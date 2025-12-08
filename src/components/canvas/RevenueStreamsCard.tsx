'use client';

import { useMemo } from 'react';
import { HandCoins, Pencil, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils/currency';
import { calculateProfitMargin, formatProfitMargin } from '@/lib/utils/financial';
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
import type { Product, Currency } from '@/lib/storage/types';

interface ProductWithDisplay {
  product: Product;
  displayText: string;
}

interface RevenueStreamsCardProps {
  className?: string;
  products: Product[];
  currency: Currency;
  onEditProduct: (product: Product) => void;
  onAddProduct: () => void;
}

export function RevenueStreamsCard({
  className,
  products,
  currency,
  onEditProduct,
  onAddProduct,
}: RevenueStreamsCardProps) {
  const Icon = HandCoins;

  const productsWithDisplay: ProductWithDisplay[] = useMemo(() => {
    return products.map((product) => {
      const priceText = product.price === 0 ? 'Free' : formatCurrency(product.price, currency);
      const salesText = product.sales
        ? `${product.sales.volume} ${product.sales.period === 'monthly' ? 'monthly' : 'daily'}`
        : '';
      const margin = formatProfitMargin(calculateProfitMargin(product));

      const parts = [product.name, priceText];
      if (salesText) parts.push(salesText);
      parts.push(`${margin} margin`);

      return {
        product,
        displayText: parts.join(' • '),
      };
    });
  }, [products, currency]);

  return (
    <Card
      className={cn(
        'flex h-full flex-col rounded-lg gap-0 border-black/5 bg-background p-1 shadow-md',
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
            {productsWithDisplay.length > 0 ? (
              productsWithDisplay.map((item, index) => (
                <button
                  key={`product-${item.product.id}-${index}`}
                  onClick={() => onEditProduct(item.product)}
                  className="flex items-center justify-between rounded-lg bg-muted/80 px-1 py-1 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  <span className="truncate text-left">{item.displayText}</span>
                  <Pencil className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 ml-1" />
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

