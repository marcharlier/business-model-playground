'use client';

import { useMemo } from 'react';
import { HandCoins, Pencil, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils/currency';
import { formatProfitMargin } from '@/lib/utils/financial';
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
import type { RevenueStream, ProductRevenueStream, SubscriptionRevenueStream, Currency } from '@/lib/storage/types';

interface RevenueStreamDisplayItem {
  id: string;
  name: string;
  displayText: string;
  item: RevenueStream;
}

interface RevenueStreamsCardProps {
  className?: string;
  items: RevenueStream[];
  currency: Currency;
  onEditItem: (item: RevenueStream) => void;
  onAddItem: () => void;
}

function calculateProductProfitMargin(product: ProductRevenueStream): number {
  const price = product.price ?? 0;
  if (price === 0) return 0;
  const totalCost = product.associatedCosts.reduce((sum, cost) => sum + cost.amount, 0);
  return ((price - totalCost) / price) * 100;
}

function calculateSubscriptionProfitMargin(subscription: SubscriptionRevenueStream): number {
  const price = subscription.price ?? 0;
  if (price === 0) return 0;
  const totalCost = subscription.associatedCosts.reduce((sum, cost) => sum + cost.amount, 0);
  return ((price - totalCost) / price) * 100;
}

export function RevenueStreamsCard({
  className,
  items,
  currency,
  onEditItem,
  onAddItem,
}: RevenueStreamsCardProps) {
  const Icon = HandCoins;

  const revenueStreams: RevenueStreamDisplayItem[] = useMemo(() => {
    return items.map((item) => {
      if (item.type === 'product') {
        const product = item as ProductRevenueStream;
        // Check if product is incomplete (suggestion mode)
        const isIncomplete = product.price === undefined || product.price === null;
        
        if (isIncomplete) {
          return {
            id: product.id,
            name: product.name,
            displayText: product.name,
            item,
          };
        }

        const priceText = product.price === 0 ? 'Free' : formatCurrency(product.price, currency);
        const salesText = product.sales
          ? `${product.sales.volume} ${product.sales.period === 'monthly' ? 'monthly' : 'daily'}`
          : '';
        const margin = formatProfitMargin(calculateProductProfitMargin(product));

        const parts = [product.name, priceText];
        if (salesText) parts.push(salesText);
        parts.push(`${margin} margin`);

        return {
          id: product.id,
          name: product.name,
          displayText: parts.join(' • '),
          item,
        };
      } else {
        const subscription = item as SubscriptionRevenueStream;
        // Check if subscription is incomplete (suggestion mode)
        const isIncomplete = 
          (subscription.price === undefined || subscription.price === null) ||
          (subscription.subscribers === undefined || subscription.subscribers === null);
        
        if (isIncomplete) {
          return {
            id: subscription.id,
            name: subscription.name,
            displayText: subscription.name,
            item,
          };
        }

        const priceText = subscription.price === 0 ? 'Free' : formatCurrency(subscription.price, currency);
        const pricePeriod = subscription.pricePeriod || 'monthly';
        const periodLabel = pricePeriod === 'annual' ? '/yr' : '/mo';
        const subscribersText = `${subscription.subscribers} subscriber${subscription.subscribers !== 1 ? 's' : ''}`;
        const margin = formatProfitMargin(calculateSubscriptionProfitMargin(subscription));

        const parts = [
          subscription.name,
          `${priceText}${periodLabel}`,
          subscribersText,
          `${margin} margin`
        ];

        return {
          id: subscription.id,
          name: subscription.name,
          displayText: parts.join(' • '),
          item,
        };
      }
    });
  }, [items, currency]);

  return (
    <Card
      className={cn(
        'flex h-full flex-col rounded-xl gap-0 border-border bg-background p-1',
        className,
      )}
    >
      <CardHeader className="space-y-2 px-2 py-2">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base font-medium text-foreground">Revenue Streams</CardTitle>
          <div className="">
            <Icon className="h-4 w-4 text-muted-foreground/80" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 min-h-0 flex-col px-2 pt-0">
        <ScrollArea className="flex-1 min-h-0">
          <div className="flex flex-col gap-2 pr-2">
            {revenueStreams.length > 0 ? (
              revenueStreams.map((displayItem, index) => (
                <button
                  key={`${displayItem.item.type}-${displayItem.id}-${index}`}
                  onClick={() => onEditItem(displayItem.item)}
                  className="flex min-w-0 items-center justify-between gap-2 rounded-sm bg-muted/80 px-1 py-1 text-xs font-medium text-muted-foreground hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  <span className="min-w-0 truncate text-left">{displayItem.displayText}</span>
                  <Pencil className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                </button>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-border/60 px-3 py-6 text-center text-sm text-muted-foreground">
                No revenue streams yet
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="mt-auto flex w-full flex-col gap-2 px-2 pb-2 pt-0">
        <Separator className="bg-border/70" />
        <Button
          variant="ghost"
          size="sm"
          onClick={onAddItem}
          className="h-8 w-full justify-center rounded-lg border border-border bg-background text-xs font-medium text-foreground shadow-none"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add revenue stream
        </Button>
      </CardFooter>
    </Card>
  );
}
