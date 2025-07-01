
'use server';

import type { Subscription, UserProfile } from '@/types';
import clientPromise from '@/lib/mongodb';
import { revalidatePath } from 'next/cache';
import { ObjectId } from 'mongodb';
import { sendSms } from '@/services/twilio';

async function getDb() {
    if (!clientPromise) return null;
    const client = await clientPromise;
    return client.db();
}

export async function getSubscriptions(userId: string): Promise<Subscription[]> {
  const db = await getDb();
  if (!db) {
    console.warn("MongoDB not connected. Returning empty subscriptions array.");
    return [];
  }
  const subscriptions = await db.collection('subscriptions').find({ userId }).sort({ nextBillingDate: 1 }).toArray();
  
  // Convert ObjectId to string for client-side compatibility
  return subscriptions.map(sub => ({
      ...sub,
      _id: sub._id.toString(),
  })) as Subscription[];
}

export async function addSubscription(userId: string, subscriptionData: Omit<Subscription, 'id' | 'userId'>): Promise<Subscription> {
    const db = await getDb();
    const newSubscription: Omit<Subscription, '_id' | 'id'> & { id: string } = {
        ...subscriptionData,
        id: crypto.randomUUID(), // For client-side key
        userId,
    };

    if (!db) {
        console.warn("MongoDB not connected. Mocking addSubscription.");
        return { ...newSubscription, _id: new ObjectId().toString() };
    }
    
    const result = await db.collection('subscriptions').insertOne(newSubscription);
    revalidatePath('/dashboard');
    revalidatePath('/subscriptions-list');
    return { ...newSubscription, _id: result.insertedId.toString() };
}

export async function updateSubscription(userId: string, subscription: Subscription): Promise<void> {
    const db = await getDb();
    if (!db) {
        console.warn("MongoDB not connected. Mocking updateSubscription.");
        return;
    }
    const { _id, ...subscriptionData } = subscription;
    await db.collection('subscriptions').updateOne(
        { _id: new ObjectId(_id), userId },
        { $set: subscriptionData }
    );
    revalidatePath('/dashboard');
    revalidatePath('/subscriptions-list');
}


export async function deleteSubscription(userId: string, subscriptionId: string): Promise<void> {
    const db = await getDb();
    if (!db) {
        console.warn("MongoDB not connected. Mocking deleteSubscription.");
        return;
    }
    await db.collection('subscriptions').deleteOne({ _id: new ObjectId(subscriptionId), userId });
    revalidatePath('/dashboard');
    revalidatePath('/subscriptions-list');
}

export async function toggleNotification(userId: string, subscriptionId: string, enabled: boolean): Promise<void> {
    const db = await getDb();
    if (!db) {
        console.warn("MongoDB not connected. Mocking toggleNotification.");
        return;
    }
    await db.collection('subscriptions').updateOne(
        { _id: new ObjectId(subscriptionId), userId },
        { $set: { notificationsEnabled: enabled } }
    );
    revalidatePath('/dashboard');
    revalidatePath('/subscriptions-list');
}

export async function sendTestReminder(user: UserProfile, subscription: Subscription) {
    if (!user.phone) {
        return { success: false, error: 'User does not have a phone number configured.' };
    }

    const message = `Hi ${user.name}, this is a test reminder from SubScribe for your ${subscription.serviceName} subscription.`;
    
    return await sendSms(user.phone, message);
}
