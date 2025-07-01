
'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Shield, Bell, CreditCard, LogOut, User, Mail, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { updateUser } from '@/app/actions/user';
import type { UserProfile } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { handleSignOut } from '@/components/auth/auth-form';

export default function SettingsPage() {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
        router.push('/login');
    }
    if (user) {
      setName(user.name || '');
      setEmail(user.email);
      setPhone(user.phone || '');
    }
  }, [user, authLoading, router]);

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    startTransition(async () => {
        try {
            await updateUser(user.uid, { name, email, phone });
            toast({ title: 'Profile Updated', description: 'Your settings have been saved.' });
        } catch (error) {
            toast({ title: 'Update Failed', description: 'Could not update your profile.', variant: 'destructive' });
        }
    });
  };
  
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    // This would typically involve Firebase's sendPasswordResetEmail function
    toast({ title: 'Password Change Requested', description: 'If your email exists, you will receive a password reset link.' });
  };
  
  if (authLoading || !user) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-12 w-1/3" />
        <Card>
          <CardHeader>
             <Skeleton className="h-8 w-1/4" />
             <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <Skeleton className="h-10 w-24" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                 <Skeleton className="h-4 w-16" />
                 <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold font-headline tracking-tight">Settings</h1>
      
      <Card className="bg-gradient-to-br from-primary/10 to-accent/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><User className="w-5 h-5" /> Profile Settings</CardTitle>
          <CardDescription>Manage your personal information and preferences.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.avatarUrl!} alt={user.name!} data-ai-hint="user avatar" />
                <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <Button variant="outline" type="button">Change Avatar</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" name="email" type="email" value={email} disabled />
              </div>
               <div className="space-y-1">
                <Label htmlFor="phone">Phone Number (for SMS)</Label>
                <Input id="phone" name="phone" type="tel" placeholder="+15551234567" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>
            <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : "Save Profile Changes"}</Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      <Card className="bg-gradient-to-br from-primary/10 to-accent/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5" /> Notification Preferences</CardTitle>
          <CardDescription>Control how you receive alerts and updates.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           {/* This would be wired up to user preferences in the database */}
          <div className="flex items-center justify-between p-3 rounded-md border">
            <Label htmlFor="emailNotifications" className="flex flex-col gap-1">
              <span>Email Notifications</span>
              <span className="text-xs text-muted-foreground">Receive updates and reminders via email.</span>
            </Label>
            <Switch id="emailNotifications" defaultChecked />
          </div>
          <div className="flex items-center justify-between p-3 rounded-md border">
            <Label htmlFor="smsNotifications" className="flex flex-col gap-1">
              <span>SMS Reminders</span>
              <span className="text-xs text-muted-foreground">Get text message alerts for important events.</span>
            </Label>
            <Switch id="smsNotifications" defaultChecked />
          </div>
           <Button type="button" onClick={() => toast({ title: 'Notification Settings Saved'})}>Save Notification Preferences</Button>
        </CardContent>
      </Card>
      
      <Separator />

      <Card className="bg-gradient-to-br from-primary/10 to-accent/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><KeyRound className="w-5 h-5" /> Security Settings</CardTitle>
          <CardDescription>Manage your account security, like password changes.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground mb-4">You are signed in with Google. To change your password, please manage it through your Google account settings.</p>
            <Button variant="outline" asChild>
                <a href="https://myaccount.google.com/security" target="_blank" rel="noopener noreferrer">Go to Google Security</a>
            </Button>
        </CardContent>
      </Card>

      <Separator />
      
      <Card className="bg-gradient-to-br from-primary/10 to-accent/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CreditCard className="w-5 h-5" /> Billing & Subscription</CardTitle>
          <CardDescription>Manage your SubScribe plan and payment methods.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user.isPremium ? (
            <div>
              <p>You are currently on the <span className="font-semibold text-primary">Premium Plan</span>.</p>
              <Button variant="outline" className="mt-2" asChild><Link href="/billing">Manage Subscription</Link></Button>
            </div>
          ) : (
            <div>
              <p>You are currently on the <span className="font-semibold">Free Plan</span>.</p>
              <Button className="mt-2 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-opacity" asChild>
                <Link href="/billing">Upgrade to Premium</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      <div className="flex justify-start">
        <Button variant="destructive" onClick={() => {
            toast({ title: 'Logging out...' });
            handleSignOut();
        }}>
          <LogOut className="mr-2 h-4 w-4" /> Log Out
        </Button>
      </div>
    </div>
  );
}
