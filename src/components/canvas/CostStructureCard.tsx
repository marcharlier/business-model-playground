'use client';

import { useMemo } from 'react';
import { CircleDollarSign, Pencil, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils/currency';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { FixedCost, UpfrontCost, Currency } from '@/lib/storage/types';

type UnifiedCost = FixedCost | UpfrontCost;

interface CostWithType {
  cost: UnifiedCost;
  type: 'upfront' | 'operating';
  displayText: string;
}

interface CostStructureCardProps {
  className?: string;
  operatingCosts: FixedCost[];
  upfrontCosts: UpfrontCost[];
  currency: Currency;
  onEditCost: (cost: UnifiedCost, type: 'upfront' | 'operating') => void;
  onAddCost: () => void;
}

export function CostStructureCard({
  className,
  operatingCosts,
  upfrontCosts,
  currency,
  onEditCost,
  onAddCost,
}: CostStructureCardProps) {
  const Icon = CircleDollarSign;

  const costsWithTypes: CostWithType[] = useMemo(() => {
    const operating = operatingCosts.map((cost) => {
      // Show name-only if amount is not set (suggestion mode)
      if (cost.amount === undefined || cost.amount === null) {
        return {
          cost,
          type: 'operating' as const,
          displayText: `${cost.name} - (Operating cost)`,
        };
      }
      const cadence = cost.frequency === 'monthly' ? 'per month' : 'per year';
      return {
        cost,
        type: 'operating' as const,
        displayText: `${cost.name} - ${formatCurrency(cost.amount, currency)} ${cadence}`,
      };
    });

    const upfront = upfrontCosts.map((cost) => {
      // Show name-only if amount is not set (suggestion mode)
      if (cost.amount === undefined || cost.amount === null) {
        return {
          cost,
          type: 'upfront' as const,
          displayText: `${cost.name} - (Upfront cost)`,
        };
      }
      return {
        cost,
        type: 'upfront' as const,
        displayText: `${cost.name} - ${formatCurrency(cost.amount, currency)} upfront`,
      };
    });

    return [...operating, ...upfront];
  }, [operatingCosts, upfrontCosts, currency]);

  return (
    <Card
      className={cn(
        'flex h-full flex-col rounded-xl gap-0 border-border bg-background p-1',
        className,
      )}
    >
      <CardHeader className="space-y-2 px-2 py-2">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base font-medium text-foreground">Cost Structure</CardTitle>
          <div className="">
            <Icon className="h-4 w-4 text-muted-foreground/80" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 min-h-0 flex-col px-2 pt-0">
        <ScrollArea className="flex-1 min-h-0">
          <div className="flex flex-col gap-2 pr-2">
            {costsWithTypes.length > 0 ? (
              costsWithTypes.map((item, index) => (
                <button
                  key={`${item.type}-${item.cost.id}-${index}`}
                  onClick={() => onEditCost(item.cost, item.type)}
                  className="flex min-w-0 items-center justify-between gap-2 rounded-sm bg-muted/80 px-1 py-1 text-xs font-medium text-muted-foreground hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  <span className="min-w-0 truncate text-left">{item.displayText}</span>
                  <Pencil className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                </button>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-border/60 px-3 py-6 text-center text-sm text-muted-foreground">
                No costs yet
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="mt-auto flex w-full flex-col gap-2 px-2 pb-2 pt-0">
        <Separator className="bg-border/70" />
        <div className="flex w-full gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onAddCost}
            className="h-8 flex-1 justify-center rounded-lg border border-border bg-background text-xs font-medium text-foreground shadow-none"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add costs
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
