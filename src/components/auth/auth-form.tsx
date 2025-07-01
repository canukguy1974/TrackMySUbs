
'use client';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export function AuthForm() {
  const { toast } = useToast();
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({
        title: 'Login Successful',
        description: 'Welcome to SubScribe!',
      });
      router.push('/dashboard');
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      toast({
        title: 'Login Failed',
        description: 'Could not sign in with Google. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Button
      onClick={handleGoogleSignIn}
      className="w-full bg-white text-black hover:bg-gray-200"
      variant="outline"
    >
      <Image src="/google-g-logo.svg" alt="Google logo" width={20} height={20} className="mr-3" data-ai-hint="google logo" />
      Sign In with Google
    </Button>
  );
}

export async function handleSignOut() {
    try {
        await signOut(auth);
        window.location.href = '/login';
    } catch (error) {
        console.error("Sign out error", error);
    }
}
