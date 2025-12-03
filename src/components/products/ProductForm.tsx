import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Trash2 } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { LongPressButton } from '@/components/ui/long-press-button';
import type { Product, AssociatedCost, Currency, ProductSales } from '@/lib/storage/types';
import { ProductPriceControl } from '@/components/products/controls/ProductPriceControl';
import { ProductSalesControl } from '@/components/products/controls/ProductSalesControl';
import { ProductCogsControl, type CostRow } from '@/components/products/controls/ProductCogsControl';

interface ProductFormProps {
  className?: string;
  product?: Product;
  currency: Currency;
  onSave: (name: string, price: number, associatedCosts: AssociatedCost[], sales: ProductSales) => void;
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
  onDelete
}: ProductFormProps) {
  const [name, setName] = useState(product?.name ?? '');
  const [price, setPrice] = useState(product?.price === 0 ? '' : product?.price.toString() ?? '');
  const [associatedCosts, setAssociatedCosts] = useState<AssociatedCost[]>(product?.associatedCosts ?? []);
  const [newCostRows, setNewCostRows] = useState<CostRow[]>([]);
  const [sales, setSales] = useState<ProductSales>(product?.sales ?? { volume: 1, period: 'monthly' });

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
    
    for (const row of newCostRows) {
      if (row.name.trim()) {  // Only require name for associated costs
        const amount = Number.parseFloat(row.amount) || 0;  // Default to 0 if no amount
        const newCost: AssociatedCost = {
          id: crypto.randomUUID(),
          name: row.name.trim(),
          amount: amount,
          productId: product?.id || '',
          projectId: product?.projectId || ''
        };
        finalAssociatedCosts = [...finalAssociatedCosts, newCost];
      }
    }

    // Convert all cost amounts to numbers before saving
    finalAssociatedCosts = finalAssociatedCosts.map(cost => ({
      ...cost,
      amount: Number.parseFloat(cost.amount.toString()) || 0
    }));

    onSave(name.trim(), priceValue, finalAssociatedCosts, sales);
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="product-name">Product Name</Label>
          <Input
            id="product-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Enter product name"
          />
        </div>
        
        <ProductPriceControl
          id="product-price"
          label="Price"
          currency={currency}
          value={price}
          onChange={(value) => setPrice(value)}
        />

        <ProductSalesControl
          id="product-sales"
          label="Expected sales"
          sales={sales}
          onVolumeChange={(value) => setSales((prev) => ({ ...prev, volume: value }))}
          onPeriodChange={(period) => setSales((prev) => ({ ...prev, period }))}
        />
        
        <ProductCogsControl
          label="Cost of goods (COGS)"
          associatedCosts={associatedCosts}
          newCostRows={newCostRows}
          currency={currency}
          onCostsChange={setAssociatedCosts}
          onNewCostRowsChange={setNewCostRows}
        />
        
        <Separator className="my-4" />
        
        <div className={`${hideCancel ? 'flex flex-col' : 'flex flex-row justify-between'} gap-2`}>
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
            {product ? 'Save changes' : 'Add product'}
          </Button>
        </div>

        {product && (
          <Accordion type="single" collapsible>
            <AccordionItem value="delete">
              <AccordionTrigger className="py-2 text-destructive">Delete this product?</AccordionTrigger>
              <AccordionContent>
                <LongPressButton
                  variant="destructive"
                  onLongPress={() => onDelete?.()}
                  disabled={isSubmitting}
                  className="gap-2 w-full"
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