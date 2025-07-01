
import type { User as FirebaseUser } from 'firebase/auth';

export type SubscriptionCategory = "News" | "Entertainment" | "Music" | "Shopping" | "Other" | "Productivity" | "Utilities" | "Health & Fitness" | "Education" | "Finance";

export type PaymentMethod = "Card" | "PayPal" | "Free" | "Apple Pay" | "Google Pay" | "Bank Transfer" | "Unknown";

export interface Subscription {
  _id?: string; // from MongoDB
  id: string; // Keep original UUID for client-side keys
  serviceName: string;
  billingDate?: string;
  nextBillingDate?: string;
  renewalPeriod?: 'monthly' | 'yearly' | 'weekly' | 'custom';
  price: number;
  currency: string;
  paymentMethod: PaymentMethod;
  trialEndDate?: string;
  category: SubscriptionCategory;
  autoRenew: boolean;
  serviceUrl?: string;
  notes?: string;
  notificationsEnabled: boolean;
  userId: string;
  linkedAccountId?: string;
  detectedFromEmail?: boolean;
  emailSourceId?: string;
}

// Represents user data stored in our MongoDB
export interface UserProfile {
  _id?: string;
  uid: string; // Firebase Auth UID
  email: string;
  name?: string;
  avatarUrl?: string;
  isPremium: boolean;
  freeScansUsed: number;
  phone?: string; // For SMS notifications
  createdAt: Date;
  updatedAt: Date;
}

// Combined user object for use in the app context
export interface AppUser extends UserProfile {
  firebaseUser: FirebaseUser;
}


export const subscriptionCategories: SubscriptionCategory[] = [
  "News", "Entertainment", "Music", "Shopping", "Productivity", "Utilities", "Health & Fitness", "Education", "Finance", "Other"
];

export const paymentMethods: PaymentMethod[] = [
  "Card", "PayPal", "Free", "Apple Pay", "Google Pay", "Bank Transfer", "Unknown"
];
