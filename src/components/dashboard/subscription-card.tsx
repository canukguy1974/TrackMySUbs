
'use client';

import type { Subscription } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, CreditCard, Edit3, Bell, BellOff, Trash2, ExternalLink, Info, AlertTriangle, CheckCircle, Package, Repeat } from 'lucide-react';
import { getCategoryIcon } from '@/lib/placeholder-data';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { MoreVertical } from 'lucide-react';
import Link from 'next/link';
import { format, parseISO, differenceInDays, isValid } from 'date-fns';
import React, { useState, useEffect } from 'react';

interface SubscriptionCardProps {
  subscription: Subscription;
  onEdit: (subscription: Subscription) => void;
  onDelete: (subscriptionId: string) => void;
  onToggleNotification: (subscriptionId: string, enabled: boolean) => void;
}

export default function SubscriptionCard({ subscription, onEdit, onDelete, onToggleNotification }: SubscriptionCardProps) {
  const CategoryIconComponent = getCategoryIcon(subscription.category);
  const [showAnnualized, setShowAnnualized] = useState(false);

  const [daysUntilNextPayment, setDaysUntilNextPayment] = useState<number | null>(null);
  const [daysUntilTrialEnd, setDaysUntilTrialEnd] = useState<number | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const today = new Date();
    if (subscription.nextBillingDate) {
      const nextBillingDate = parseISO(subscription.nextBillingDate);
      if (isValid(nextBillingDate)) {
        setDaysUntilNextPayment(differenceInDays(nextBillingDate, today));
      }
    }
    if (subscription.trialEndDate) {
      const trialEndDate = parseISO(subscription.trialEndDate);
      if (isValid(trialEndDate)) {
        setDaysUntilTrialEnd(differenceInDays(trialEndDate, today));
      }
    }
  }, [subscription.nextBillingDate, subscription.trialEndDate]);


  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = parseISO(dateString);
    return isValid(date) ? format(date, 'MMM d, yyyy') : 'Invalid Date';
  };
  
  const paymentOrTrialStatus = () => {
    if (daysUntilTrialEnd !== null) {
      if (daysUntilTrialEnd <= 2 && daysUntilTrialEnd >= 0) {
        return <Badge variant="destructive" className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Trial ends in {daysUntilTrialEnd} day{daysUntilTrialEnd === 1 ? '' : 's'}</Badge>;
      } else if (daysUntilTrialEnd < 0) {
        return <Badge variant="outline">Trial ended</Badge>;
      }
      return <Badge variant="secondary">Trial ends: {formatDate(subscription.trialEndDate)}</Badge>;
    }
    if (daysUntilNextPayment !== null) {
      if (daysUntilNextPayment <= 2 && daysUntilNextPayment >= 0) {
        return <Badge variant="destructive" className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Due in {daysUntilNextPayment} day{daysUntilNextPayment === 1 ? '' : 's'}</Badge>;
      }
      return <Badge variant="secondary">Next payment: {formatDate(subscription.nextBillingDate)}</Badge>;
    }
    return <Badge variant="outline">No upcoming payment</Badge>;
  };

  const displayPrice = () => {
    if (subscription.price === 0) return 'Free';

    let price = subscription.price;
    let period = subscription.renewalPeriod || 'cycle';

    if (showAnnualized) {
      if (subscription.renewalPeriod === 'monthly') {
        price = subscription.price * 12;
        period = 'year';
      } else if (subscription.renewalPeriod === 'yearly') {
        price = subscription.price / 12;
        period = 'month';
      }
    }
    return `${subscription.currency} ${price.toFixed(2)} / ${period}`;
  };

  const canTogglePriceView = subscription.renewalPeriod === 'monthly' || subscription.renewalPeriod === 'yearly';
  
  const toggleButtonText = () => {
    if (!canTogglePriceView) return '';
    if (showAnnualized) {
      return subscription.renewalPeriod === 'monthly' ? 'View Monthly' : 'View Yearly';
    }
    return subscription.renewalPeriod === 'monthly' ? 'View Yearly' : 'View Monthly';
  };


  return (
    <Card className="flex flex-col justify-between shadow-lg hover:shadow-primary/30 transition-all duration-300 ease-in-out transform hover:-translate-y-1 bg-gradient-to-br from-primary/10 to-accent/10">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded-full">
              <CategoryIconComponent className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-headline">{subscription.serviceName}</CardTitle>
              <CardDescription>{subscription.category}</CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(subscription)}>
                <Edit3 className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              {subscription.serviceUrl && (
                <DropdownMenuItem asChild>
                  <Link href={subscription.serviceUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" /> Visit Service
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(subscription._id!)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground flex items-center gap-1"><CreditCard className="w-4 h-4" /> Payment:</span>
          <div className="flex items-center gap-2">
            <span className="font-medium">{displayPrice()}</span>
            {canTogglePriceView && subscription.price > 0 && (
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowAnnualized(!showAnnualized)} title={toggleButtonText()}>
                <Repeat className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground flex items-center gap-1"><CalendarDays className="w-4 h-4" /> Status:</span>
          {isClient ? paymentOrTrialStatus() : <Badge variant="secondary">Calculating...</Badge>}
        </div>
         <div className="flex items-center justify-between">
          <span className="text-muted-foreground flex items-center gap-1">
            {subscription.autoRenew ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Info className="w-4 h-4 text-yellow-500" />}
            Auto-Renew:
          </span>
          <Badge variant={subscription.autoRenew ? "default" : "outline"}>
            {subscription.autoRenew ? 'Enabled' : 'Disabled'}
          </Badge>
        </div>
        {subscription.paymentMethod !== "Free" && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Method:</span>
            <span>{subscription.paymentMethod}</span>
          </div>
        )}
        {subscription.notes && (
          <div className="pt-2">
            <p className="text-xs text-muted-foreground">Notes: {subscription.notes}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center border-t pt-4 mt-auto">
        <div className="flex items-center space-x-2">
          <Switch
            id={`notif-${subscription.id}`}
            checked={subscription.notificationsEnabled}
            onCheckedChange={(checked) => onToggleNotification(subscription._id!, checked)}
            aria-label="Toggle notifications"
          />
          <Label htmlFor={`notif-${subscription.id}`} className="text-xs text-muted-foreground flex items-center gap-1">
            {subscription.notificationsEnabled ? <Bell className="w-3 h-3" /> : <BellOff className="w-3 h-3" />}
            Reminders
          </Label>
        </div>
        {subscription.detectedFromEmail && <Badge variant="outline" className="text-xs">AI Detected</Badge>}
      </CardFooter>
    </Card>
  );
}
