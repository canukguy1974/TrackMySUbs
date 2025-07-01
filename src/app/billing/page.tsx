
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Zap, Star } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from '@/contexts/auth-context';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';

const planFeatures = {
  free: [
    { text: '1 AI Email Scan', included: true },
    { text: 'Manual Subscription Tracking', included: true },
    { text: 'Connect 1 Gmail Account', included: true },
    { text: 'Basic Reminders', included: true },
    { text: 'Unlimited AI Scans', included: false },
    { text: 'Connect Multiple Gmail Accounts', included: false },
    { text: 'Advanced SMS Reminders', included: false },
    { text: 'Priority Support', included: false },
  ],
  premium: [
    { text: 'Unlimited AI Email Scans', included: true },
    { text: 'Manual Subscription Tracking', included: true },
    { text: 'Connect up to 5 Gmail Accounts', included: true },
    { text: 'Advanced SMS & Email Reminders', included: true },
    { text: 'Subscription Categorization AI', included: true },
    { text: 'Export Data', included: true },
    { text: 'Priority Support', included: true },
  ],
};


export default function BillingPage() {
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-6 w-96" />
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="h-96 w-full rounded-lg" />
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }
  
  const plans = [
    {
      name: 'Free',
      price: '$0',
      frequency: '/month',
      features: planFeatures.free,
      cta: 'Current Plan',
      isCurrent: !user.isPremium,
    },
    {
      name: 'Premium',
      price: '$5',
      frequency: '/month',
      features: planFeatures.premium,
      cta: user.isPremium ? 'Current Plan' : 'Upgrade to Premium',
      isCurrent: user.isPremium,
      gradient: 'bg-gradient-to-r from-primary to-accent',
    },
  ];


  const handleUpgrade = (planName: string) => {
    // In a real app, this would redirect to a payment gateway like Stripe
    // The server would generate a checkout session and redirect the user.
    // Upon successful payment, a webhook would update the user's `isPremium` status in the database.
    toast({
      title: `Redirecting to payment for ${planName}...`,
      description: 'This is a demo. In a real app, you would be sent to Stripe.',
    });
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold font-headline tracking-tight">Billing & Plans</h1>
      <p className="text-muted-foreground">
        Choose the SubScribe plan that best fits your needs. Manage your subscription and payment methods here.
      </p>

      <div className="grid md:grid-cols-2 gap-8 items-stretch">
        {plans.map((plan) => (
          <Card key={plan.name} className={`flex flex-col shadow-xl hover:shadow-primary/30 transition-shadow ${plan.name === 'Premium' ? 'border-2 border-primary' : ''}`}>
            <CardHeader className="text-center">
              {plan.name === 'Premium' && <Star className="w-8 h-8 mx-auto text-primary mb-2" />}
              <CardTitle className="text-2xl font-bold font-headline">{plan.name}</CardTitle>
              <CardDescription className="text-4xl font-extrabold text-foreground">
                {plan.price}
                <span className="text-sm font-normal text-muted-foreground">{plan.frequency}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    {feature.included ? (
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-muted-foreground/50 flex-shrink-0" />
                    )}
                    <span className={!feature.included ? 'text-muted-foreground/70 line-through' : ''}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {plan.isCurrent ? (
                <Button variant="outline" className="w-full" disabled>
                  Current Plan
                </Button>
              ) : (
                <Button onClick={() => handleUpgrade(plan.name)} className={`w-full text-primary-foreground hover:opacity-90 transition-opacity ${plan.gradient || 'bg-primary'}`}>
                  <Zap className="mr-2 h-4 w-4" /> {plan.cta}
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>View your past invoices and payment details.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">Your payment history will appear here once you subscribe to a paid plan.</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Manage Payment Methods</CardTitle>
          <CardDescription>Add or update your credit card information.</CardDescription>
        </CardHeader>
        <CardContent>
           <p className="text-muted-foreground">Payment method management will be available here after integrating a payment provider.</p>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center">
        Need help? <Link href="/support" className="underline hover:text-primary">Contact Support</Link>. 
        All payments are processed securely.
      </p>
    </div>
  );
}
