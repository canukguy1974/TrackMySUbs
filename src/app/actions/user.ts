
'use server';

import type { User as FirebaseUser } from 'firebase/auth';
import clientPromise from '@/lib/mongodb';
import type { UserProfile } from '@/types';
import { adminAuth } from '@/lib/firebase-admin';

async function getDb() {
  if (!clientPromise) return null;
  const client = await clientPromise;
  return client.db();
}

export async function getOrCreateUser(firebaseUser: FirebaseUser): Promise<UserProfile> {
  const db = await getDb();
  if (!db) {
    console.warn("MongoDB not connected. Returning mock user profile.");
    // Return a default/mock profile if DB is not available
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      name: firebaseUser.displayName,
      avatarUrl: firebaseUser.photoURL,
      isPremium: false,
      freeScansUsed: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  const usersCollection = db.collection<UserProfile>('users');
  const existingUser = await usersCollection.findOne({ uid: firebaseUser.uid });

  if (existingUser) {
    return existingUser;
  }

  const newUser: UserProfile = {
    uid: firebaseUser.uid,
    email: firebaseUser.email!,
    name: firebaseUser.displayName,
    avatarUrl: firebaseUser.photoURL,
    isPremium: false,
    freeScansUsed: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await usersCollection.insertOne(newUser);
  return newUser;
}

export async function getUser(uid: string): Promise<UserProfile | null> {
    const db = await getDb();
    if (!db) {
        console.warn("MongoDB not connected. Cannot get user.");
        return null;
    }
    const usersCollection = db.collection<UserProfile>('users');
    const user = await usersCollection.findOne({ uid });
    return user;
}


export async function updateUser(uid: string, userData: Partial<UserProfile>): Promise<UserProfile | null> {
    const db = await getDb();
    if (!db) {
        console.warn("MongoDB not connected. Cannot update user.");
        // Return a mock updated user for UI to seem responsive
        return {
            uid,
            email: 'mock@example.com',
            ...userData,
            createdAt: new Date(),
            updatedAt: new Date(),
            isPremium: false,
            freeScansUsed: 0,
        };
    }
    const usersCollection = db.collection<UserProfile>('users');
    
    const updateData = {
        ...userData,
        updatedAt: new Date(),
    };

    const result = await usersCollection.findOneAndUpdate(
        { uid },
        { $set: updateData },
        { returnDocument: 'after' }
    );
    
    return result;
}

export async function getAuthenticatedUser(idToken: string): Promise<UserProfile | null> {
    try {
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const user = await getUser(decodedToken.uid);
        return user;
    } catch (error) {
        console.error("Error verifying ID token:", error);
        return null;
    }
}
