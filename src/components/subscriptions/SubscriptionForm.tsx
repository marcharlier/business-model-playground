import { useState } from 'react';
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
import type {
  Subscription,
  AssociatedCost,
  Currency,
} from '@/lib/storage/types';
import { ProductPriceControl } from '@/components/products/controls/ProductPriceControl';
import { SubscriptionSubscribersControl } from '@/components/subscriptions/controls/SubscriptionSubscribersControl';
import {
  ProductCogsControl,
  type CostRow,
} from '@/components/products/controls/ProductCogsControl';

interface SubscriptionFormProps {
  className?: string;
  subscription?: Subscription;
  currency: Currency;
  onSave: (
    name: string,
    price: number,
    pricePeriod: 'monthly' | 'annual',
    subscribers: number,
    associatedCosts: AssociatedCost[]
  ) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  hideCancel?: boolean;
  onDelete?: () => void;
}

export function SubscriptionForm({
  className,
  subscription,
  currency,
  onSave,
  onCancel,
  isSubmitting,
  hideCancel,
  onDelete,
}: SubscriptionFormProps) {
  const [name, setName] = useState(subscription?.name || '');
  const [price, setPrice] = useState(
    subscription?.price === 0 ? '' : (subscription?.price || 0).toString()
  );
  const [associatedCosts, setAssociatedCosts] = useState<AssociatedCost[]>(
    subscription?.associatedCosts || []
  );
  const [newCostRows, setNewCostRows] = useState<CostRow[]>([]);
  const [subscribers, setSubscribers] = useState<number>(
    subscription?.subscribers || 0
  );
  const [pricePeriod, setPricePeriod] = useState<'monthly' | 'annual'>(
    subscription?.pricePeriod || 'monthly'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      return;
    }

    const priceValue = price.trim() ? Number.parseFloat(price) : 0;
    if (Number.isNaN(priceValue) || priceValue < 0) {
      return;
    }

    // Process new cost rows and add valid ones to associated costs
    let finalAssociatedCosts = [...associatedCosts];
    const itemId = subscription?.id || '';
    const projectId = subscription?.projectId || '';

    for (const row of newCostRows) {
      if (row.name.trim()) {
        const amount = Number.parseFloat(row.amount) || 0;
        const newCost: AssociatedCost = {
          id: crypto.randomUUID(),
          name: row.name.trim(),
          amount: amount,
          subscriptionId: itemId,
          projectId,
        };
        finalAssociatedCosts = [...finalAssociatedCosts, newCost];
      }
    }

    // Convert all cost amounts to numbers before saving
    finalAssociatedCosts = finalAssociatedCosts.map((cost) => ({
      ...cost,
      amount: Number.parseFloat(cost.amount.toString()) || 0,
    }));

    onSave(name.trim(), priceValue, pricePeriod, subscribers, finalAssociatedCosts);
  };

  const hasExistingItem = !!subscription;

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="space-y-4">
        <div className="bg-muted rounded-md p-3 space-y-4 w-full">
          <div className="space-y-2">
            <Label htmlFor="subscription-name">Name</Label>
            <Input
              id="subscription-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter subscription name"
              className="bg-background"
            />
          </div>
        </div>
        <Tabs defaultValue="price" className="w-full">
          <TabsList className="w-full border mb-2">
            <TabsTrigger value="price">Price and subscribers</TabsTrigger>
            <TabsTrigger value="cogs">Per subscriber cost</TabsTrigger>
          </TabsList>
          <TabsContent value="price" className="space-y-4">
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
                id="subscription-price"
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
              id="subscription-subscribers"
              label="Monthly subscribers"
              subscribers={subscribers}
              onSubscribersChange={setSubscribers}
            />
          </TabsContent>
          <TabsContent value="cogs">
            <ProductCogsControl
              label="Per subscriber cost"
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
            disabled={isSubmitting || !name.trim() || subscribers <= 0}
            className={`h-9 ${hideCancel ? 'w-full' : 'flex-1'}`}
          >
            {hasExistingItem ? 'Save changes' : 'Add subscription'}
          </Button>
        </div>

        {hasExistingItem && (
          <Accordion type="single" collapsible>
            <AccordionItem value="delete">
              <AccordionTrigger className="py-2 text-sm text-muted-foreground hover:text-destructive">
                Delete this subscription?
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

