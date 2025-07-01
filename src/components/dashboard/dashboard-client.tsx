
'use client';

import React, { useState, useMemo, useTransition } from 'react';
import SubscriptionCard from '@/components/dashboard/subscription-card';
import AddSubscriptionModal from '@/components/dashboard/add-subscription-modal';
import FilterControls from '@/components/dashboard/filter-controls';
import { Button } from '@/components/ui/button';
import type { Subscription, SubscriptionCategory, UserProfile } from '@/types';
import { PlusCircle, MailSearch, AlertTriangle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { detectSubscriptionFromEmail, DetectSubscriptionFromEmailInput } from '@/ai/flows/detect-subscription-from-email';
import { categorizeSubscription, CategorizeSubscriptionInput } from '@/ai/flows/categorize-subscription';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { addSubscription, updateSubscription, deleteSubscription, toggleNotification } from '@/app/actions/subscriptions';
import { updateUser } from '@/app/actions/user';


interface DashboardClientProps {
  initialSubscriptions: Subscription[];
  userProfile: UserProfile;
}

export default function DashboardClient({
  initialSubscriptions,
  userProfile,
}: DashboardClientProps) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(initialSubscriptions);
  const [currentUser, setCurrentUser] = useState<UserProfile>(userProfile);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<SubscriptionCategory | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [emailContent, setEmailContent] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const handleSaveSubscription = (subscriptionData: Omit<Subscription, 'id' | 'userId'>) => {
    startTransition(async () => {
      const isUpdating = !!editingSubscription;
      try {
        if (isUpdating && editingSubscription._id) {
          const fullSub: Subscription = {
            ...subscriptionData,
            _id: editingSubscription._id,
            id: editingSubscription.id,
            userId: currentUser.uid,
          };
          await updateSubscription(currentUser.uid, fullSub);
          setSubscriptions(prev => prev.map(s => s.id === fullSub.id ? fullSub : s));
        } else {
          const newSub = await addSubscription(currentUser.uid, subscriptionData);
          setSubscriptions(prev => [newSub, ...prev]);
        }
        toast({ title: "Subscription Saved!", description: `${subscriptionData.serviceName} has been ${isUpdating ? 'updated' : 'added'}.` });
        setEditingSubscription(null);
      } catch (error) {
        console.error('Error saving subscription:', error);
        toast({ title: "Error", description: "Failed to save subscription. Please try again.", variant: "destructive" });
      }
    });
  };

  const handleEditSubscription = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setIsModalOpen(true);
  };

  const handleDeleteSubscription = (subscriptionId: string) => {
    startTransition(async () => {
      const subToDelete = subscriptions.find(s => s._id === subscriptionId);
      if (!subToDelete) return;

      try {
        await deleteSubscription(currentUser.uid, subscriptionId);
        setSubscriptions(prev => prev.filter(s => s._id !== subscriptionId));
        toast({ title: "Subscription Deleted", description: `${subToDelete.serviceName} has been removed.`, variant: "destructive" });
      } catch (error) {
        console.error('Error deleting subscription:', error);
        toast({ title: "Error", description: "Failed to delete subscription. Please try again.", variant: "destructive" });
      }
    });
  };

  const handleToggleNotification = (subscriptionId: string, enabled: boolean) => {
    startTransition(async () => {
      try {
        await toggleNotification(currentUser.uid, subscriptionId, enabled);
        setSubscriptions(prev => prev.map(s => s._id === subscriptionId ? { ...s, notificationsEnabled: enabled } : s));
        toast({ title: "Notification Preference Updated" });
      } catch (error) {
        console.error('Error updating notification preference:', error);
        toast({ title: "Error", description: "Failed to update notification preference.", variant: "destructive" });
      }
    });
  };
  
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter(sub => {
      const categoryMatch = selectedCategory === 'all' || sub.category === selectedCategory;
      const searchTermMatch = sub.serviceName.toLowerCase().includes(searchTerm.toLowerCase());
      return categoryMatch && searchTermMatch;
    });
  }, [subscriptions, selectedCategory, searchTerm]);

  const openAddModal = () => {
    setEditingSubscription(null);
    setIsModalOpen(true);
  };

  const handleScanEmail = async () => {
    if (!emailContent.trim()) {
      toast({ title: "Email content is empty", description: "Please paste email content to scan.", variant: "destructive" });
      return;
    }
    setIsScanning(true);
    setScanProgress(30);

    try {
      const input: DetectSubscriptionFromEmailInput = { emailContent };
      const result = await detectSubscriptionFromEmail(input);
      setScanProgress(70);
      
      if (result.isSubscriptionRelated && result.serviceName) {
        const categoryInput: CategorizeSubscriptionInput = {
          subscriptionName: result.serviceName,
          subscriptionDescription: `Detected from email. Billing: ${result.billingDate || 'N/A'}.`,
        };
        const categoryResult = await categorizeSubscription(categoryInput);
        setScanProgress(90);

        const newSubscriptionData: Omit<Subscription, 'id' | 'userId'> = {
          serviceName: result.serviceName,
          billingDate: result.billingDate ? new Date(result.billingDate).toISOString() : undefined,
          nextBillingDate: result.billingDate ? new Date(result.billingDate).toISOString() : undefined,
          renewalPeriod: 'monthly', // Default, user can edit
          price: 0, // Will need to be filled in by user
          currency: 'USD',
          paymentMethod: (result.paymentMethod as Subscription["paymentMethod"]) || 'Unknown',
          trialEndDate: result.trialEndDate ? new Date(result.trialEndDate).toISOString() : undefined,
          category: categoryResult.category as SubscriptionCategory || 'Other',
          autoRenew: true,
          notificationsEnabled: true,
          detectedFromEmail: true,
          notes: `Detected from email.`,
        };
        
        const newSub = await addSubscription(currentUser.uid, newSubscriptionData);
        setSubscriptions(prev => [newSub, ...prev]);

        toast({ title: "Subscription Detected!", description: `${result.serviceName} added. Please review details.` });
      
        if(!currentUser.isPremium){
           const updatedUser = await updateUser(currentUser.uid, { freeScansUsed: (currentUser.freeScansUsed || 0) + 1 });
           if (updatedUser) setCurrentUser(updatedUser);
        }

      } else {
        toast({ title: "No Subscription Detected", description: "The AI could not identify a subscription in the email." });
      }
    } catch (error) {
      console.error("Error scanning email:", error);
      toast({ title: "Scan Failed", description: "An error occurred during AI processing.", variant: "destructive" });
    } finally {
      setScanProgress(100);
      setTimeout(() => {
        setIsScanning(false);
        setIsScanModalOpen(false);
        setEmailContent('');
        setScanProgress(0);
      }, 1000);
    }
  };
  
  const canScan = currentUser.isPremium || (currentUser.freeScansUsed || 0) < 1;
  const scansRemaining = !currentUser.isPremium ? 1 - (currentUser.freeScansUsed || 0) : Infinity;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">Subscription Dashboard</h1>
          <p className="text-muted-foreground">Manage all your active and upcoming subscriptions.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsScanModalOpen(true)} className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-opacity" disabled={!canScan && !currentUser.isPremium}>
            <MailSearch className="mr-2 h-4 w-4" /> Scan Email
            {!currentUser.isPremium && ` (${scansRemaining} free scan${scansRemaining === 1 ? '' : 's'} left)`}
          </Button>
          <Button onClick={openAddModal} className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-opacity">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Subscription
          </Button>
        </div>
      </div>

      {!currentUser.isPremium && (currentUser.freeScansUsed || 0) >= 1 && (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center gap-3 text-yellow-300">
          <AlertTriangle className="w-5 h-5" />
          <p className="text-sm">You've used your free AI email scan. <Button variant="link" className="p-0 h-auto text-yellow-300 hover:text-yellow-200" asChild><Link href="/billing">Upgrade to Premium</Link></Button> for unlimited scans!</p>
        </div>
      )}

      <FilterControls
        categories={[]}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onResetFilters={() => { setSelectedCategory('all'); setSearchTerm(''); }}
      />

      {filteredSubscriptions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubscriptions.map(sub => (
            <SubscriptionCard
              key={sub.id}
              subscription={sub}
              onEdit={handleEditSubscription}
              onDelete={() => handleDeleteSubscription(sub._id!)}
              onToggleNotification={handleToggleNotification}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-card rounded-lg shadow">
          <h3 className="text-xl font-semibold">No Subscriptions Found</h3>
          <p className="text-muted-foreground mt-2">
            {searchTerm || selectedCategory !== 'all' ? "Try adjusting your filters or " : "Get started by adding a new subscription."}
          </p>
          {searchTerm || selectedCategory !== 'all' ? 
            <Button variant="outline" onClick={() => { setSelectedCategory('all'); setSearchTerm(''); }} className="mt-4">Clear Filters</Button> :
            <Button onClick={openAddModal} className="mt-4">Add Manually</Button>
          }
        </div>
      )}

      <AddSubscriptionModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={handleSaveSubscription}
        existingSubscription={editingSubscription}
        isPending={isPending}
      />

      <Dialog open={isScanModalOpen} onOpenChange={setIsScanModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Scan Email for Subscriptions</DialogTitle>
            <DialogDescription>
              Paste the full content of an email below. Our AI will try to detect subscription details.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Textarea
              placeholder="Paste email content here..."
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
              rows={10}
              disabled={isScanning}
            />
            {isScanning && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Scanning with AI...</p>
                <Progress value={scanProgress} className="w-full" />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsScanModalOpen(false)} disabled={isScanning}>Cancel</Button>
            <Button onClick={handleScanEmail} disabled={isScanning || !emailContent.trim() || (!canScan && !currentUser.isPremium)}>
              {isScanning ? 'Scanning...' : 'Scan with AI'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
