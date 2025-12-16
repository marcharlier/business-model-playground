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
import type {
  Product,
  AssociatedCost,
  Currency,
  ProductSales,
} from '@/lib/storage/types';
import { ProductPriceControl } from '@/components/products/controls/ProductPriceControl';
import { ProductSalesControl } from '@/components/products/controls/ProductSalesControl';
import {
  ProductCogsControl,
  type CostRow,
} from '@/components/products/controls/ProductCogsControl';

interface ProductFormProps {
  className?: string;
  product?: Product;
  currency: Currency;
  onSave: (
    name: string,
    price: number | undefined,
    associatedCosts: AssociatedCost[],
    sales: ProductSales
  ) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  hideCancel?: boolean;
  onDelete?: () => void;
}

export function ProductForm({
  className,
  product,
  currency,
  onSave,
  onCancel,
  isSubmitting,
  hideCancel,
  onDelete,
}: ProductFormProps) {
  const [name, setName] = useState(product?.name || '');
  // Initialize price: undefined → '', 0 → '0', other → string value
  const [price, setPrice] = useState(
    product?.price === undefined ? '' : product.price.toString()
  );
  const [associatedCosts, setAssociatedCosts] = useState<AssociatedCost[]>(
    product?.associatedCosts || []
  );
  const [newCostRows, setNewCostRows] = useState<CostRow[]>([]);
  // Initialize sales with volume that can be undefined
  const [sales, setSales] = useState<ProductSales>(
    product?.sales || { volume: undefined, period: 'monthly' }
  );

  // Auto-focus on price field when form opens
  useEffect(() => {
    // Small delay to ensure dialog is fully rendered
    const timer = setTimeout(() => {
      const priceInput = document.getElementById('product-price');
      if (priceInput) {
        priceInput.focus();
        // Select all text if there's a value
        if (priceInput instanceof HTMLInputElement && priceInput.value) {
          priceInput.select();
        }
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

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

    // Process new cost rows and add valid ones to associated costs
    let finalAssociatedCosts = [...associatedCosts];
    const itemId = product?.id || '';
    const projectId = product?.projectId || '';

    for (const row of newCostRows) {
      if (row.name.trim()) {
        const amount = Number.parseFloat(row.amount) || 0;
        const newCost: AssociatedCost = {
          id: crypto.randomUUID(),
          name: row.name.trim(),
          amount: amount,
          productId: itemId,
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

    onSave(name.trim(), priceValue, finalAssociatedCosts, sales);
  };

  const hasExistingItem = !!product;

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="space-y-4">
        <div className="bg-muted rounded-md p-3 space-y-4 w-full">
          <div className="space-y-2">
            <Label htmlFor="product-name">Name</Label>
            <Input
              id="product-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter product name"
              className="bg-background"
            />
          </div>
        </div>
        <Tabs defaultValue="price" className="w-full">
          <TabsList className="w-full border mb-2">
            <TabsTrigger value="price">Price and sales</TabsTrigger>
            <TabsTrigger value="cogs">Unit costs</TabsTrigger>
          </TabsList>
          <TabsContent value="price" className="space-y-4">
            <ProductPriceControl
              id="product-price"
              label="Price per unit"
              currency={currency}
              value={price}
              onChange={(value) => setPrice(value)}
            />
            <ProductSalesControl
              id="product-sales"
              label="Expected sales"
              sales={sales}
              onVolumeChange={(value: number | undefined) =>
                setSales((prev) => ({ ...prev, volume: value }))
              }
              onPeriodChange={(period) =>
                setSales((prev) => ({ ...prev, period }))
              }
            />
          </TabsContent>
          <TabsContent value="cogs">
            <ProductCogsControl
              label="Cost of goods (COGS)"
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
            {hasExistingItem ? 'Save changes' : 'Add product'}
          </Button>
        </div>

        {hasExistingItem && (
          <Accordion type="single" collapsible>
            <AccordionItem value="delete">
              <AccordionTrigger className="py-2 text-sm text-muted-foreground hover:text-destructive">
                Delete this product?
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
