'use client';

import { useMemo } from 'react';
import { HandCoins, Pencil, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils/currency';
import { calculateProfitMargin, formatProfitMargin, calculateSubscriptionProfitMargin } from '@/lib/utils/financial';
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
import type { Product, Subscription, Currency } from '@/lib/storage/types';

interface RevenueStreamItem {
  id: string;
  name: string;
  displayText: string;
  type: 'product' | 'subscription';
  item: Product | Subscription;
}

interface RevenueStreamsCardProps {
  className?: string;
  products: Product[];
  subscriptions?: Subscription[];
  currency: Currency;
  onEditProduct: (product: Product) => void;
  onEditSubscription?: (subscription: Subscription) => void;
  onAddProduct: () => void;
}

export function RevenueStreamsCard({
  className,
  products,
  subscriptions = [],
  currency,
  onEditProduct,
  onEditSubscription,
  onAddProduct,
}: RevenueStreamsCardProps) {
  const Icon = HandCoins;

  const revenueStreams: RevenueStreamItem[] = useMemo(() => {
    const items: RevenueStreamItem[] = [];

    // Add products
    products.forEach((product) => {
      const priceText = product.price === 0 ? 'Free' : formatCurrency(product.price, currency);
      const salesText = product.sales
        ? `${product.sales.volume} ${product.sales.period === 'monthly' ? 'monthly' : 'daily'}`
        : '';
      const margin = formatProfitMargin(calculateProfitMargin(product));

      const parts = [product.name, priceText];
      if (salesText) parts.push(salesText);
      parts.push(`${margin} margin`);

      items.push({
        id: product.id,
        name: product.name,
        displayText: parts.join(' • '),
        type: 'product',
        item: product,
      });
    });

    // Add subscriptions
    subscriptions.forEach((subscription) => {
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

      items.push({
        id: subscription.id,
        name: subscription.name,
        displayText: parts.join(' • '),
        type: 'subscription',
        item: subscription,
      });
    });

    return items;
  }, [products, subscriptions, currency]);

  const handleItemClick = (item: RevenueStreamItem) => {
    if (item.type === 'product') {
      onEditProduct(item.item as Product);
    } else if (item.type === 'subscription' && onEditSubscription) {
      onEditSubscription(item.item as Subscription);
    }
  };

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
              revenueStreams.map((item, index) => (
                <button
                  key={`${item.type}-${item.id}-${index}`}
                  onClick={() => handleItemClick(item)}
                  className="flex min-w-0 items-center justify-between gap-2 rounded-sm bg-muted/80 px-1 py-1 text-xs font-medium text-muted-foreground hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  <span className="min-w-0 truncate text-left">{item.displayText}</span>
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
          onClick={onAddProduct}
          className="h-8 w-full justify-center rounded-lg border border-border bg-background text-xs font-medium text-foreground shadow-none"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add revenue stream
        </Button>
      </CardFooter>
    </Card>
  );
}
