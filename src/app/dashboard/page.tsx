'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { getSubscriptions } from '@/app/actions/subscriptions';
import type { Subscription } from '@/types';
import DashboardClient from '@/components/dashboard/dashboard-client';
import { Skeleton } from '@/components/ui/skeleton';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!authLoading && !user && typeof window !== 'undefined') {
      router.push('/login');
      return;
    }

    if (user) {
      const fetchSubs = async () => {
        try {
          const subs = await getSubscriptions(user.uid);
          setSubscriptions(subs);
        } catch (error) {
          console.error('Error fetching subscriptions:', error);
          // Fallback to empty array if there's an error
          setSubscriptions([]);
        } finally {
          setIsLoading(false);
        }
      };
      fetchSubs();
    }
  }, [user, authLoading, router]);

  if (authLoading || isLoading || !user) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
        <Skeleton className="h-16 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardClient 
	    initialSubscriptions={subscriptions}
        userProfile={user}		
	  />
    </ProtectedRoute>
  );
}
