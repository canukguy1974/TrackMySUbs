
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import type { Subscription, SubscriptionCategory } from '@/types';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format, parseISO, isValid, differenceInDays } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckCircle, XCircle, AlertTriangle, DollarSign, Gift, Package } from 'lucide-react';
import { getCategoryIcon } from '@/lib/placeholder-data';
import { getSubscriptions } from '@/app/actions/subscriptions';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  const date = parseISO(dateString);
  return isValid(date) ? format(date, 'MMM d, yyyy') : 'Invalid Date';
};

const SubscriptionRow = ({ subscription }: { subscription: Subscription }) => {
    const [statusInfo, setStatusInfo] = useState<{ text: string; variant: 'default' | 'secondary' | 'destructive' | 'outline', icon: React.ReactNode, daysRemainingText?: string } | null>(null);

    useEffect(() => {
        const today = new Date();
        let info: { text: string; variant: 'default' | 'secondary' | 'destructive' | 'outline', icon: React.ReactNode, daysRemainingText?: string };

        if (subscription.trialEndDate) {
            const trialEnd = parseISO(subscription.trialEndDate);
            if (isValid(trialEnd)) {
                const daysLeft = differenceInDays(trialEnd, today);
                let daysRemainingText = `Ends in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`;
                if (daysLeft < 0) daysRemainingText = "Ended";
                else if (daysLeft === 0) daysRemainingText = "Ends today";
                
                info = { text: 'Trial', variant: daysLeft <= 3 && daysLeft >=0 ? 'destructive' : 'secondary', icon: <AlertTriangle className="w-3 h-3 mr-1 inline-block" />, daysRemainingText };
            } else {
                 info = { text: 'Trial', variant: 'secondary', icon: <AlertTriangle className="w-3 h-3 mr-1 inline-block" />, daysRemainingText: "Invalid Date" };
            }
        } else if (subscription.price === 0) {
            info = { text: 'Free', variant: 'default', icon: <Gift className="w-3 h-3 mr-1 inline-block" /> };
        } else {
            let daysRemainingText: string | undefined;
            if (subscription.nextBillingDate) {
                const nextBilling = parseISO(subscription.nextBillingDate);
                if (isValid(nextBilling)) {
                    const daysLeft = differenceInDays(nextBilling, today);
                    if (daysLeft >= 0) {
                      daysRemainingText = `In ${daysLeft} day${daysLeft === 1 ? '' : 's'}`;
                      if (daysLeft === 0) daysRemainingText = "Due today";
                    } else {
                       daysRemainingText = "Past due";
                    }
                }
            }
            info = { text: 'Paid', variant: 'outline', icon: <DollarSign className="w-3 h-3 mr-1 inline-block" />, daysRemainingText };
        }
        setStatusInfo(info);
    }, [subscription]);
    
    const CategoryIcon = getCategoryIcon(subscription.category);

    if (!statusInfo) {
        return (
            <TableRow>
                <TableCell colSpan={8} className="text-center p-4">
                  <div className="flex items-center justify-center text-muted-foreground">
                    <Package className="w-4 h-4 mr-2 animate-spin" /> Calculating...
                  </div>
                </TableCell>
            </TableRow>
        );
    }

    return (
        <TableRow className={
            statusInfo.text === 'Trial' ? 'bg-yellow-500/5 hover:bg-yellow-500/10' : 
            statusInfo.text === 'Free' ? 'bg-green-500/5 hover:bg-green-500/10' : 
            'hover:bg-muted/50'
        }>
            <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                    <CategoryIcon className="w-4 h-4 text-muted-foreground" />
                    {subscription.serviceName}
                </div>
            </TableCell>
            <TableCell>{subscription.category}</TableCell>
            <TableCell>
                <Badge variant={statusInfo.variant} className="whitespace-nowrap">
                    {statusInfo.icon}
                    {statusInfo.text}
                </Badge>
            </TableCell>
            <TableCell className="text-right">
                {subscription.price > 0 ? `${subscription.currency} ${subscription.price.toFixed(2)}` : 'Free'}
            </TableCell>
            <TableCell>{subscription.renewalPeriod || 'N/A'}</TableCell>
            <TableCell>
                {formatDate(statusInfo.text === 'Trial' ? subscription.trialEndDate : subscription.nextBillingDate)}
                {statusInfo.daysRemainingText && <span className="block text-xs text-muted-foreground">{statusInfo.daysRemainingText}</span>}
            </TableCell>
            <TableCell>{subscription.paymentMethod}</TableCell>
            <TableCell className="text-center">
                {subscription.autoRenew ? <CheckCircle className="w-5 h-5 text-green-500 mx-auto" /> : <XCircle className="w-5 h-5 text-red-500 mx-auto" />}
            </TableCell>
        </TableRow>
    );
};

export default function SubscriptionsListPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
        router.push('/login');
        return;
    }

    if (user) {
        async function loadSubscriptions() {
          setIsLoading(true);
          const subs = await getSubscriptions(user.uid);
          setSubscriptions(subs);
          setIsLoading(false);
        }
        loadSubscriptions();
    }
  }, [user, authLoading, router]);

  if (authLoading || isLoading) {
     return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-10 w-32" />
            </div>
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            {[...Array(8)].map((_, i) => <TableHead key={i}><Skeleton className="h-5 w-20" /></TableHead>)}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                           {[...Array(8)].map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
     );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">All Subscriptions</h1>
          <p className="text-muted-foreground">A detailed overview of all your tracked subscriptions.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {subscriptions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>Renews</TableHead>
                  <TableHead>Next Payment / Trial End</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead className="text-center">Auto-Renew</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((sub) => <SubscriptionRow key={sub.id} subscription={sub} />)}
              </TableBody>
              <TableCaption>A detailed list of all your subscriptions. {subscriptions.length} subscription(s) total.</TableCaption>
            </Table>
          ) : (
             <div className="text-center py-12">
                <h3 className="text-xl font-semibold">No Subscriptions Yet</h3>
                <p className="text-muted-foreground mt-2">Add subscriptions on the dashboard to see them here.</p>
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
