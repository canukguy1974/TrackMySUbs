'use client';

import React, { createContext, useEffect, useState, useContext, useRef } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import type { User as FirebaseUser } from 'firebase/auth';
import { getOrCreateUser } from '@/app/actions/user';
import type { UserProfile } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null | undefined;
  loading: boolean;
  error?: Error;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [firebaseUser, firebaseLoading, firebaseError] = useAuthState(auth);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const syncingRef = useRef(false);

  // Ensure we're on client side to prevent hydration mismatches
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const syncUser = async () => {
      // Prevent multiple simultaneous syncs
      if (firebaseLoading || syncingRef.current) return;
      
      if (firebaseUser && !user) {
        syncingRef.current = true;
        try {
          const dbUser = await getOrCreateUser(firebaseUser);
          setUser(dbUser);
        } catch (e) {
          console.error("Error syncing user with database", e);
          // Fallback to basic user info if DB sync fails
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email!,
            name: firebaseUser.displayName,
            avatarUrl: firebaseUser.photoURL,
            isPremium: false,
            freeScansUsed: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        } finally {
          syncingRef.current = false;
          setLoading(false);
        }
      } else if (!firebaseUser && user) {
        setUser(null);
        setLoading(false);
      } else if (!firebaseLoading) {
        setLoading(false);
      }
    };

    syncUser();
  }, [firebaseUser, firebaseLoading]);

  // Show loading only when we're still determining auth state
  if (firebaseLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4 w-1/2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  const value = { user, firebaseUser, loading, error: firebaseError };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
