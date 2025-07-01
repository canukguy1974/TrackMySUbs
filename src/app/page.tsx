import { Button } from "@/components/ui/button";
import Link from "next/link";
import Header from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import { CheckCircle, MailSearch, BellRing, ListFilter, Users, ShieldCheck, DollarSign } from "lucide-react";
import Image from "next/image";

const features = [
  {
    icon: <MailSearch className="w-10 h-10 text-primary" />,
    title: "AI Subscription Detection",
    description: "Automatically scan your emails to find all your subscriptions, distinguishing actual subscriptions from marketing noise."
  },
  {
    icon: <Users className="w-10 h-10 text-primary" />,
    title: "Multi-Account Support",
    description: "Connect multiple Gmail accounts to get a consolidated view of all your subscriptions in one place."
  },
  {
    icon: <BellRing className="w-10 h-10 text-primary" />,
    title: "Smart Reminders",
    description: "Receive SMS notifications for trial endings and upcoming payments, so you never miss a renewal."
  },
  {
    icon: <ListFilter className="w-10 h-10 text-primary" />,
    title: "Categorize & Filter",
    description: "Organize your subscriptions by category (News, Music, etc.) and easily filter to find what you need."
  },
  {
    icon: <DollarSign className="w-10 h-10 text-primary" />,
    title: "Monetization Ready",
    description: "Flexible plans including a free tier to get started, and premium features for power users."
  },
  {
    icon: <ShieldCheck className="w-10 h-10 text-primary" />,
    title: "Secure & Private",
    description: "Your data is handled with the utmost care, ensuring privacy and security for your peace of mind."
  }
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 md:py-32 bg-gradient-to-br from-background to-primary/10">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 font-headline
                           bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Never Lose Track of Subscriptions Again
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              SubScribe uses AI to automatically find, track, and manage all your subscriptions. Save money and stay organized effortlessly.
            </p>
            <Button size="lg" asChild className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-opacity px-8 py-3 text-lg rounded-lg shadow-lg">
              <Link href="/signup">Get Started for Free</Link>
            </Button>
            <p className="text-sm text-muted-foreground mt-4">First scan is on us!</p>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-headline">Why Choose SubScribe?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-card p-6 rounded-lg shadow-lg hover:shadow-primary/20 transition-shadow duration-300 flex flex-col items-center text-center">
                  <div className="mb-4 p-3 rounded-full bg-primary/10">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 font-headline">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* How it works / Visual Section */}
        <section className="py-16 md:py-24 bg-card">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="lg:w-1/2">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 font-headline">Effortless Subscription Management</h2>
                <p className="text-muted-foreground mb-4">
                  SubScribe simplifies your digital life. Connect your email, and let our AI do the heavy lifting.
                  View all your subscriptions in a clean dashboard, get timely reminders, and take control of your spending.
                </p>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-primary" /> AI-Powered Discovery</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-primary" /> Centralized Dashboard</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-primary" /> Customizable Notifications</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-primary" /> Easy Manual Entry</li>
                </ul>
                <Button size="lg" asChild className="mt-8 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-opacity">
                  <Link href="/dashboard">Explore Dashboard</Link>
                </Button>
              </div>
              <div className="lg:w-1/2">
                <Image 
                  src="https://placehold.co/600x400.png" 
                  alt="SubScribe Dashboard Preview" 
                  width={600} 
                  height={400}
                  className="rounded-lg shadow-2xl"
                  data-ai-hint="dashboard preview"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-20 md:py-32 text-center bg-gradient-to-tr from-background to-accent/10">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-headline">Ready to Take Control?</h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
              Join thousands of users simplifying their subscription management with SubScribe. Sign up today and experience the difference.
            </p>
            <Button size="lg" asChild className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-opacity px-10 py-4 text-xl rounded-lg shadow-lg">
              <Link href="/signup">Sign Up Now</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
