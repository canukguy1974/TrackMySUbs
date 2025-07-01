
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, PlusCircle, Trash2, RefreshCw, CheckCircle, ArrowLeft } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Image from 'next/image';

interface LinkedAccount {
  id: string;
  provider: 'gmail';
  email: string;
  lastScan?: string;
  isScanning?: boolean;
}

const initialAccounts: LinkedAccount[] = [
  { id: 'gmail1', provider: 'gmail', email: 'alex.ryder@gmail.com', lastScan: '2024-06-29T12:00:00Z' },
  { id: 'gmail2', provider: 'gmail', email: 'personal.subscriptions@gmail.com', lastScan: '2024-06-26T12:00:00Z' },
];

export default function ConnectAccountPage() {
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>(initialAccounts);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleConnectGmail = () => {
    // This would initiate OAuth flow for Gmail
    toast({ title: 'Connecting Gmail...', description: 'Redirecting to Gmail for authorization.' });
    // Simulate adding an account after a delay
    setTimeout(() => {
      const newAccountEmail = user?.email || `user${Date.now()}@gmail.com`;
      setLinkedAccounts(prev => [...prev, { id: crypto.randomUUID(), provider: 'gmail', email: newAccountEmail }]);
      toast({ title: 'Gmail Account Connected!', description: `${newAccountEmail} has been added.` });
    }, 2000);
  };

  const handleRemoveAccount = (accountId: string) => {
    setLinkedAccounts(prev => prev.filter(acc => acc.id !== accountId));
    toast({ title: 'Account Removed', variant: 'destructive' });
  };

  const handleScanAccount = (accountId: string) => {
    // Find the account before updating state to avoid circular references
    const accountToScan = linkedAccounts.find(a => a.id === accountId);
    if (!accountToScan) return;
    
    setLinkedAccounts(prev => prev.map(acc => acc.id === accountId ? { ...acc, isScanning: true } : acc));
    toast({ title: `Scanning ${accountToScan.email}...` });
    
    // Simulate scanning process
    setTimeout(() => {
      setLinkedAccounts(prev => prev.map(acc => acc.id === accountId ? { ...acc, isScanning: false, lastScan: new Date().toISOString() } : acc));
      toast({ title: 'Scan Complete!', description: `Finished scanning ${accountToScan.email}.` });
    }, 3000 + Math.random() * 2000);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
      <h1 className="text-3xl font-bold font-headline tracking-tight">Connect Accounts</h1>
      <p className="text-muted-foreground">
        Link your email accounts to automatically detect and manage your subscriptions.
        SubScribe currently supports Gmail.
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image src="/google-g-logo.svg" alt="Gmail Logo" width={24} height={24} data-ai-hint="google logo" />
            Connect Gmail Account
          </CardTitle>
          <CardDescription>
            Allow SubScribe to securely scan your Gmail inbox for subscription-related emails. 
            We only look for relevant information and respect your privacy.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleConnectGmail} className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-opacity">
            <PlusCircle className="mr-2 h-4 w-4" /> Connect New Gmail Account
          </Button>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Linked Accounts</CardTitle>
          <CardDescription>Manage your currently connected email accounts.</CardDescription>
        </CardHeader>
        <CardContent>
          {linkedAccounts.length === 0 ? (
            <p className="text-muted-foreground">No accounts connected yet.</p>
          ) : (
            <ul className="space-y-4">
              {linkedAccounts.map(account => (
                <li key={account.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-3">
                  <div className="flex items-center gap-3">
                     <Image src="/google-g-logo.svg" alt="Gmail Logo" width={20} height={20} data-ai-hint="google logo" />
                    <div>
                      <p className="font-medium">{account.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Last scan: {account.lastScan ? new Date(account.lastScan).toLocaleDateString() : 'Never'}
                        {account.isScanning && <span className="ml-2 text-primary animate-pulse">(Scanning...)</span>}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2 sm:mt-0 self-end sm:self-center">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleScanAccount(account.id)}
                      disabled={account.isScanning}
                    >
                      {account.isScanning ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                      Scan Now
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="mr-2 h-4 w-4" /> Remove
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will disconnect {account.email} from SubScribe. 
                            Detected subscriptions from this account will remain unless manually deleted.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleRemoveAccount(account.id)}>
                            Confirm Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      
      <Card className="mt-8 bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CheckCircle className="text-primary w-5 h-5" /> How Scanning Works</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>1. You authorize SubScribe to access your Gmail account (read-only access for emails).</p>
          <p>2. Our AI scans your emails for patterns related to subscriptions, trials, and payments.</p>
          <p>3. We extract key information like service name, billing dates, and amounts.</p>
          <p>4. Your privacy is paramount. We do not store email content, only extracted subscription data.</p>
          <p>5. You can revoke access at any time from this page or your Google Account settings.</p>
        </CardContent>
      </Card>
    </div>
  );
}
