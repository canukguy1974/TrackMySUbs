'use client';

import type React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { SubscriptionCategory } from '@/types';
import { subscriptionCategories } from '@/types';
import { ListFilter, Search, RotateCcw } from 'lucide-react';

interface FilterControlsProps {
  categories: SubscriptionCategory[];
  selectedCategory: SubscriptionCategory | 'all';
  onCategoryChange: (category: SubscriptionCategory | 'all') => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onResetFilters: () => void;
}

export default function FilterControls({
  selectedCategory,
  onCategoryChange,
  searchTerm,
  onSearchChange,
  onResetFilters
}: FilterControlsProps) {
  return (
    <div className="mb-6 p-4 bg-card rounded-lg shadow flex flex-col sm:flex-row gap-4 items-center">
      <div className="flex-grow w-full sm:w-auto relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search subscriptions..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 w-full"
        />
      </div>
      <div className="w-full sm:w-auto sm:min-w-[200px]">
        <Select
          value={selectedCategory}
          onValueChange={(value) => onCategoryChange(value as SubscriptionCategory | 'all')}
        >
          <SelectTrigger className="w-full">
            <ListFilter className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {subscriptionCategories.map(category => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button variant="outline" onClick={onResetFilters} className="w-full sm:w-auto">
        <RotateCcw className="h-4 w-4 mr-2" /> Reset
      </Button>
    </div>
  );
}
