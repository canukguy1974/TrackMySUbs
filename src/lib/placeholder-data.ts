
import type { SubscriptionCategory } from '@/types';
import { Newspaper, Youtube, Music2, ShoppingCart, Package, Briefcase, Zap, HeartPulse, BookOpen, DollarSign, type LucideProps } from 'lucide-react';
import type React from 'react';

export const getCategoryIcon = (category: SubscriptionCategory): React.ComponentType<LucideProps> => {
  switch (category) {
    case 'News': return Newspaper;
    case 'Entertainment': return Youtube;
    case 'Music': return Music2;
    case 'Shopping': return ShoppingCart;
    case 'Productivity': return Briefcase;
    case 'Utilities': return Zap;
    case 'Health & Fitness': return HeartPulse;
    case 'Education': return BookOpen;
    case 'Finance': return DollarSign;
    case 'Other': return Package;
    default: return Package;
  }
};
