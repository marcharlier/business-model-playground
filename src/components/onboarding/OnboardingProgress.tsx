'use client';

import { Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { formatProfitMargin, calculateProfitMargin } from '@/lib/utils/financial';
import type { Product } from '@/lib/types';
import { useProject } from '@/lib/context/ProjectContext';
import { formatCurrency } from '@/lib/utils/currency';

interface OnboardingProgressProps {
  hasCosts: boolean;
  hasProducts: boolean;
  className?: string;
  projectId?: string;
  currentPage?: 'fixed-costs' | 'products' | 'dashboard';
}

export function OnboardingProgress({
  hasCosts,
  hasProducts,
  className,
  projectId,
  currentPage,
}: OnboardingProgressProps) {
  const { project } = useProject();

  if (!project) {
    return null;
  }

  return (
    <div className={cn("w-full space-y-4 mb-8", className)}>
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {/* Step 1: Fixed Costs */}
        <Link 
          href={`/projects/${projectId}/fixed-costs`}
          className={cn(
            "flex flex-col items-center text-center p-3 sm:p-6 rounded-lg border transition-colors",
            hasCosts ? "bg-primary/5 hover:bg-muted" : "bg-muted/50 hover:bg-muted/80",
            currentPage === 'fixed-costs' && "ring-2 ring-foreground"
          )}
        >
          <div className={cn(
            "w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mb-1 sm:mb-2",
            hasCosts ? "bg-black" : "bg-primary/10"
          )}>
            {hasCosts ? (
              <Check className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
            ) : (
              <span className="text-muted-foreground text-sm sm:text-base">1</span>
            )}
          </div>
          <h3 className="font-medium text-sm sm:text-base">Fixed Costs</h3>
          <p className="hidden sm:block text-sm text-muted-foreground mt-1">
            {hasCosts ? `Your business has ${formatCurrency(project.fixedCosts.reduce((acc, cost) => {
              const monthlyAmount = cost.frequency === 'annual' ? cost.amount / 12 : cost.amount;
              return acc + monthlyAmount;
            }, 0), project.currency)} in monthly fixed costs` : 'Add your monthly fixed costs'}
          </p>
        </Link>

        {/* Step 2: Set up Products */}
        <Link 
          href={`/projects/${projectId}/products`}
          className={cn(
            "flex flex-col items-center text-center p-3 sm:p-6 rounded-lg border transition-colors",
            hasProducts ? "bg-primary/5 hover:bg-muted" : "bg-muted/50 hover:bg-muted/80",
            currentPage === 'products' && "ring-2 ring-foreground"
          )}
        >
          <div className={cn(
            "w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mb-1 sm:mb-2",
            hasProducts ? "bg-black" : "bg-primary/10"
          )}>
            {hasProducts ? (
              <Check className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
            ) : (
              <span className="text-muted-foreground text-sm sm:text-base">2</span>
            )}
          </div>
          <h3 className="font-medium text-sm sm:text-base">Products & Services</h3>
          <p className="hidden sm:block text-sm text-muted-foreground mt-1">
            {hasProducts ? `You have ${project.products.length} products with an average margin of ${formatProfitMargin(project.products.reduce((acc: number, product: Product) => acc + calculateProfitMargin(product), 0) / project.products.length)}` : 'Add your products and services'}
          </p>
        </Link>

        {/* Step 3: Play with Dashboard */}
        <Link 
          href={`/projects/${projectId}/dashboard`}
          className={cn(
            "flex flex-col items-center text-center p-3 sm:p-6 rounded-lg border transition-colors",
            "hover:bg-muted/80",
            currentPage === 'dashboard' && "ring-2 ring-foreground"
          )}
        >
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center mb-1 sm:mb-2">
            {hasCosts && hasProducts ? (
              <Sparkles className="w-3 h-3 sm:w-5 sm:h-5 text-muted-foreground" />
            ) : (
              <span className="text-muted-foreground text-sm sm:text-base">3</span>
            )}
          </div>
          <h3 className="font-medium text-sm sm:text-base">Play with Dashboard</h3>
          <p className="hidden sm:block text-sm text-muted-foreground mt-1">
            {hasCosts && hasProducts ? 'Explore your business model' : 'Add costs and products to see dashboard'}
          </p>
        </Link>
      </div>
    </div>
  );
} 