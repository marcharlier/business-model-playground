import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Trash2 } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { LongPressButton } from '@/components/ui/long-press-button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type {
  RevenueStream,
  ProductRevenueStream,
  SubscriptionRevenueStream,
  AssociatedCost,
  Currency,
  ProductSales,
} from '@/lib/storage/types';
import { ProductPriceControl } from '@/components/products/controls/ProductPriceControl';
import { ProductSalesControl } from '@/components/products/controls/ProductSalesControl';
import { SubscriptionSubscribersControl } from '@/components/subscriptions/controls/SubscriptionSubscribersControl';
import {
  ProductCogsControl,
  type CostRow,
} from '@/components/products/controls/ProductCogsControl';

type RevenueStreamType = 'product' | 'subscription';

// Type for saving - id and projectId are optional for new items
type ProductRevenueStreamInput = Omit<ProductRevenueStream, 'id' | 'projectId'> & { id?: string; projectId?: string };
type SubscriptionRevenueStreamInput = Omit<SubscriptionRevenueStream, 'id' | 'projectId'> & { id?: string; projectId?: string };
export type RevenueStreamInput = ProductRevenueStreamInput | SubscriptionRevenueStreamInput;

interface RevenueStreamFormProps {
  className?: string;
  revenueStream?: RevenueStream;
  currency: Currency;
  onSave: (item: RevenueStreamInput) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  hideCancel?: boolean;
  onDelete?: () => void;
}

export function RevenueStreamForm({
  className,
  revenueStream,
  currency,
  onSave,
  onCancel,
  isSubmitting,
  hideCancel,
  onDelete,
}: RevenueStreamFormProps) {
  // Name - always shown first
  const [name, setName] = useState(revenueStream?.name || '');
  
  // Type - default to product
  const [type, setType] = useState<RevenueStreamType>(
    revenueStream?.type || 'product'
  );
  
  // Price (shared between types)
  const [price, setPrice] = useState(
    revenueStream?.price === undefined ? '' : revenueStream.price.toString()
  );
  
  // Associated costs (shared between types)
  const [associatedCosts, setAssociatedCosts] = useState<AssociatedCost[]>(
    revenueStream?.associatedCosts || []
  );
  const [newCostRows, setNewCostRows] = useState<CostRow[]>([]);

  // Product-specific fields
  const [sales, setSales] = useState<ProductSales>(() => {
    if (revenueStream?.type === 'product' && revenueStream.sales) {
      return revenueStream.sales;
    }
    return { volume: undefined, period: 'monthly' };
  });

  // Subscription-specific fields
  const [pricePeriod, setPricePeriod] = useState<'monthly' | 'annual'>(() => {
    if (revenueStream?.type === 'subscription') {
      return revenueStream.pricePeriod || 'monthly';
    }
    return 'monthly';
  });
  const [subscribers, setSubscribers] = useState<number | undefined>(() => {
    if (revenueStream?.type === 'subscription') {
      return revenueStream.subscribers;
    }
    return undefined;
  });

  // Auto-focus: name field for new items, price field for editing
  useEffect(() => {
    // Small delay to ensure dialog is fully rendered
    const timer = setTimeout(() => {
      if (revenueStream) {
        // Editing existing item - focus on price field
        const priceInput = document.getElementById('revenue-stream-price');
        if (priceInput) {
          priceInput.focus();
          // Select all text if there's a value
          if (priceInput instanceof HTMLInputElement && priceInput.value) {
            priceInput.select();
          }
        }
      } else {
        // New item - focus on name field
        const nameInput = document.getElementById('revenue-stream-name');
        if (nameInput) {
          nameInput.focus();
        }
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [revenueStream]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      return;
    }

    // Parse price: empty string → undefined, '0' → 0, valid number → number
    let priceValue: number | undefined;
    if (price.trim() === '') {
      priceValue = undefined;
    } else {
      const num = Number.parseFloat(price);
      if (Number.isNaN(num) || num < 0) {
        return;
      }
      priceValue = num;
    }

    // Process new cost rows
    let finalAssociatedCosts = [...associatedCosts];
    const itemId = revenueStream?.id || '';
    const projectId = revenueStream?.projectId || '';

    for (const row of newCostRows) {
      if (row.name.trim()) {
        const amount = Number.parseFloat(row.amount) || 0;
        const newCost: AssociatedCost = {
          id: crypto.randomUUID(),
          name: row.name.trim(),
          amount: amount,
          revenueStreamId: itemId,
          projectId,
        };
        finalAssociatedCosts = [...finalAssociatedCosts, newCost];
      }
    }

    // Convert all cost amounts to numbers
    finalAssociatedCosts = finalAssociatedCosts.map((cost) => ({
      ...cost,
      amount: Number.parseFloat(cost.amount.toString()) || 0,
    }));

    // Build the appropriate revenue stream type
    if (type === 'product') {
      onSave({
        id: revenueStream?.id,
        type: 'product',
        name: name.trim(),
        price: priceValue,
        associatedCosts: finalAssociatedCosts,
        sales,
      });
    } else {
      onSave({
        id: revenueStream?.id,
        type: 'subscription',
        name: name.trim(),
        price: priceValue,
        associatedCosts: finalAssociatedCosts,
        pricePeriod,
        subscribers,
      });
    }
  };

  const hasExistingItem = !!revenueStream;

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="space-y-4">
        {/* Name field - always first */}
        <div className="bg-muted rounded-md p-3 space-y-4 w-full">
          <div className="space-y-2">
            <Label htmlFor="revenue-stream-name">Name</Label>
            <Input
              id="revenue-stream-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter name"
              className="bg-background"
            />
          </div>
        </div>

        {/* Type selector - always shown */}
        <div className="bg-muted rounded-md p-3 space-y-2 w-full">
          <Label>Revenue type</Label>
          <Select
            value={type}
            onValueChange={(value) => setType(value as RevenueStreamType)}
          >
            <SelectTrigger className="w-full bg-background">
              <SelectValue placeholder="Select a revenue type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="product">Product sales</SelectItem>
              <SelectItem value="subscription">Subscription revenue</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Type-specific fields */}
        <Tabs defaultValue="pricing" className="w-full">
          <TabsList className="w-full border mb-2">
            <TabsTrigger value="pricing">
              {type === 'product' ? 'Price and sales' : 'Price and subscribers'}
            </TabsTrigger>
            <TabsTrigger value="costs">
              {type === 'product' ? 'Unit costs' : 'Per subscriber cost'}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pricing" className="space-y-4">
            {type === 'product' ? (
              // Product pricing fields
              <>
                <ProductPriceControl
                  id="revenue-stream-price"
                  label="Price per unit"
                  currency={currency}
                  value={price}
                  onChange={(value) => setPrice(value)}
                />
                <ProductSalesControl
                  id="revenue-stream-sales"
                  label="Expected sales"
                  sales={sales}
                  onVolumeChange={(value: number | undefined) =>
                    setSales((prev) => ({ ...prev, volume: value }))
                  }
                  onPeriodChange={(period) =>
                    setSales((prev) => ({ ...prev, period }))
                  }
                />
              </>
            ) : (
              // Subscription pricing fields
              <>
                <div className="bg-muted rounded-md p-3 space-y-4">
                  <Tabs
                    value={pricePeriod}
                    onValueChange={(value) => setPricePeriod(value as 'monthly' | 'annual')}
                    className="w-full"
                  >
                    <TabsList className="h-8 w-full">
                      <TabsTrigger value="monthly" className="px-3 py-1 text-xs">
                        Monthly
                      </TabsTrigger>
                      <TabsTrigger value="annual" className="px-3 py-1 text-xs">
                        Annual
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <ProductPriceControl
                    id="revenue-stream-price"
                    label={pricePeriod === 'annual' 
                      ? 'Annual subscription price' 
                      : 'Monthly subscription price'}
                    currency={currency}
                    value={price}
                    onChange={(value) => setPrice(value)}
                    containerClassName="space-y-4"
                  />
                </div>
                <SubscriptionSubscribersControl
                  id="revenue-stream-subscribers"
                  label="Subscribers"
                  subscribers={subscribers}
                  onSubscribersChange={setSubscribers}
                />
              </>
            )}
          </TabsContent>
          
          <TabsContent value="costs">
            <ProductCogsControl
              label={type === 'product' ? 'Cost of goods (COGS)' : 'Per subscriber cost'}
              associatedCosts={associatedCosts}
              newCostRows={newCostRows}
              currency={currency}
              onCostsChange={setAssociatedCosts}
              onNewCostRowsChange={setNewCostRows}
            />
          </TabsContent>
        </Tabs>
        
        <Separator className="my-4" />

        <div
          className={`${hideCancel ? 'flex flex-col' : 'flex flex-row justify-between'} gap-2`}
        >
          {!hideCancel && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="h-9 flex-1"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting || !name.trim()}
            className={`h-9 ${hideCancel ? 'w-full' : 'flex-1'}`}
          >
            {hasExistingItem ? 'Save changes' : 'Add revenue stream'}
          </Button>
        </div>

        {hasExistingItem && (
          <Accordion type="single" collapsible>
            <AccordionItem value="delete">
              <AccordionTrigger className="py-2 text-sm text-muted-foreground hover:text-destructive">
                Delete this revenue stream?
              </AccordionTrigger>
              <AccordionContent>
                <LongPressButton
                  variant="destructive"
                  onLongPress={() => onDelete?.()}
                  disabled={isSubmitting}
                  className="w-full gap-2"
                  duration={2000}
                >
                  <Trash2 className="h-4 w-4" />
                  Long press to delete
                </LongPressButton>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </div>
    </form>
  );
}
