import Link from 'next/link';
import Logo from '@/components/icons/logo';

export default function Footer() {
  return (
    <footer className="border-t border-border/40 mt-auto">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between py-8 px-4 md:px-6">
        <div className="flex items-center mb-4 md:mb-0">
          <Logo />
        </div>
        <div className="text-sm text-muted-foreground text-center md:text-left">
          <p>&copy; {new Date().getFullYear()} SubScribe. All rights reserved.</p>
          <p>Manage your subscriptions effortlessly.</p>
        </div>
        <nav className="flex gap-4 mt-4 md:mt-0">
          <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Terms of Service
          </Link>
          <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Privacy Policy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
