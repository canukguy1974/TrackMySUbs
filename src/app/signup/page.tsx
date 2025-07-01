
import { AuthForm } from "@/components/auth/auth-form";
import Logo from "@/components/icons/logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-primary/10 p-4">
       <Link href="/" className="mb-8">
        <Logo />
      </Link>
      <Card className="w-full max-w-md shadow-2xl bg-gradient-to-br from-primary/10 to-accent/10">
        <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold font-headline text-primary-foreground">
            Create Your Account
            </CardTitle>
            <CardDescription className="text-primary-foreground/80">Join SubScribe and take control of your subscriptions.</CardDescription>
        </CardHeader>
        <CardContent>
            <AuthForm />
        </CardContent>
      </Card>
    </div>
  );
}
