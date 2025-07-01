
'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import type { Subscription, SubscriptionCategory, PaymentMethod } from '@/types';
import { subscriptionCategories, paymentMethods } from '@/types';
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO, isValid } from 'date-fns';
import { categorizeSubscription, CategorizeSubscriptionInput } from '@/ai/flows/categorize-subscription';
import { useToast } from "@/hooks/use-toast";


const formSchema = z.object({
  serviceName: z.string().min(2, "Service name is required."),
  price: z.coerce.number().min(0, "Price must be non-negative.").default(0),
  currency: z.string().min(2, "Currency code (e.g. USD) is required.").default("USD"),
  billingDate: z.date().optional(),
  nextBillingDate: z.date().optional(),
  trialEndDate: z.date().optional(),
  renewalPeriod: z.enum(['monthly', 'yearly', 'weekly', 'custom']).default('monthly'),
  category: z.enum(subscriptionCategories as [SubscriptionCategory, ...SubscriptionCategory[]]).default("Other"),
  paymentMethod: z.enum(paymentMethods as [PaymentMethod, ...PaymentMethod[]]).default("Card"),
  autoRenew: z.boolean().default(true),
  serviceUrl: z.string().url("Must be a valid URL.").optional().or(z.literal('')),
  notes: z.string().optional(),
  notificationsEnabled: z.boolean().default(true),
});

type AddSubscriptionFormValues = z.infer<typeof formSchema>;

interface AddSubscriptionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (subscriptionData: Omit<Subscription, 'id' | 'userId'>) => void;
  existingSubscription?: Subscription | null;
  isPending: boolean;
}

export default function AddSubscriptionModal({ isOpen, onOpenChange, onSave, existingSubscription, isPending }: AddSubscriptionModalProps) {
  const [isCategorizing, setIsCategorizing] = useState(false);
  const { toast } = useToast();

  const form = useForm<AddSubscriptionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: existingSubscription ? {
      ...existingSubscription,
      billingDate: existingSubscription.billingDate && isValid(parseISO(existingSubscription.billingDate)) ? parseISO(existingSubscription.billingDate) : undefined,
      nextBillingDate: existingSubscription.nextBillingDate && isValid(parseISO(existingSubscription.nextBillingDate)) ? parseISO(existingSubscription.nextBillingDate) : undefined,
      trialEndDate: existingSubscription.trialEndDate && isValid(parseISO(existingSubscription.trialEndDate)) ? parseISO(existingSubscription.trialEndDate) : undefined,
      serviceUrl: existingSubscription.serviceUrl || '',
    } : {
      serviceName: "",
      price: 0,
      currency: "USD",
      renewalPeriod: "monthly",
      category: "Other",
      paymentMethod: "Card",
      autoRenew: true,
      notificationsEnabled: true,
      serviceUrl: "",
      notes: "",
    },
  });
  
  useEffect(() => {
    if (!isOpen) {
      form.reset();
      return;
    }

    if (existingSubscription) {
      form.reset({
        ...existingSubscription,
        billingDate: existingSubscription.billingDate && isValid(parseISO(existingSubscription.billingDate)) ? parseISO(existingSubscription.billingDate) : undefined,
        nextBillingDate: existingSubscription.nextBillingDate && isValid(parseISO(existingSubscription.nextBillingDate)) ? parseISO(existingSubscription.nextBillingDate) : undefined,
        trialEndDate: existingSubscription.trialEndDate && isValid(parseISO(existingSubscription.trialEndDate)) ? parseISO(existingSubscription.trialEndDate) : undefined,
        serviceUrl: existingSubscription.serviceUrl || '',
      });
    } else {
      form.reset({
        serviceName: "", price: 0, currency: "USD", renewalPeriod: "monthly", category: "Other", paymentMethod: "Card", autoRenew: true, notificationsEnabled: true, serviceUrl: "", notes: ""
      });
    }
  }, [existingSubscription, form, isOpen]);


  const onSubmit = (values: AddSubscriptionFormValues) => {
    const subscriptionData: Omit<Subscription, 'id' | 'userId'> = {
      ...values,
      billingDate: values.billingDate?.toISOString(),
      nextBillingDate: values.nextBillingDate?.toISOString(),
      trialEndDate: values.trialEndDate?.toISOString(),
      serviceUrl: values.serviceUrl || undefined,
    };
    onSave(subscriptionData);
    onOpenChange(false);
  };

  const handleAutoCategorize = async () => {
    const serviceName = form.getValues("serviceName");
    const notes = form.getValues("notes");
    if (!serviceName) {
      toast({ title: "Service Name Required", description: "Please enter a service name to auto-categorize.", variant: "destructive" });
      return;
    }
    setIsCategorizing(true);
    try {
      const input: CategorizeSubscriptionInput = {
        subscriptionName: serviceName,
        subscriptionDescription: notes || `Subscription for ${serviceName}`,
      };
      const result = await categorizeSubscription(input);
      if (result.category) {
        form.setValue("category", result.category as SubscriptionCategory, { shouldValidate: true });
        toast({ title: "Auto-Categorized!", description: `Set category to ${result.category} with ${Math.round(result.confidence * 100)}% confidence.` });
      }
    } catch (error) {
      console.error("Error auto-categorizing:", error);
      toast({ title: "Categorization Failed", description: "Could not automatically categorize the subscription.", variant: "destructive" });
    } finally {
      setIsCategorizing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-headline">{existingSubscription ? 'Edit Subscription' : 'Add New Subscription'}</DialogTitle>
          <DialogDescription>
            {existingSubscription ? 'Update the details of your subscription.' : 'Manually add a subscription to your tracker.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-1">
            <FormField
              control={form.control}
              name="serviceName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Netflix, Spotify" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="15.99" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <FormControl>
                      <Input placeholder="USD" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="renewalPeriod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Renews</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select renewal period" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <div className="flex gap-2 items-center">
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subscriptionCategories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button type="button" variant="outline" size="sm" onClick={handleAutoCategorize} disabled={isCategorizing}>
                      {isCategorizing ? "AI..." : "AI Cat."}
                    </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select payment method" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {paymentMethods.map(method => (
                          <SelectItem key={method} value={method}>{method}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="billingDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Billing Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nextBillingDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Next Billing Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="trialEndDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Trial End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="serviceUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any additional details..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center space-x-4">
              <FormField
                control={form.control}
                name="autoRenew"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="font-normal">Auto Renews</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notificationsEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="font-normal">Enable Reminders</FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-opacity" disabled={isPending}>
                {isPending ? (existingSubscription ? "Saving..." : "Adding...") : (existingSubscription ? 'Save Changes' : 'Add Subscription')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
