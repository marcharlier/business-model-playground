import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { PlusIcon, Trash2, XIcon } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { LongPressButton } from '@/components/ui/long-press-button';
import type { Product, AssociatedCost, Currency } from '@/lib/storage/types';
import { CurrencyInput } from '@/components/ui/currency-input';

interface ProductFormProps {
  className?: string;
  product?: Product;
  currency: Currency;
  onSave: (name: string, price: number, associatedCosts: AssociatedCost[]) => void;
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
  const [newCostRows, setNewCostRows] = useState<{id: string, name: string, amount: string}[]>([]);

  const handleAddCostRow = () => {
    const newRow = {
      id: crypto.randomUUID(),
      name: '',
      amount: ''
    };
    setNewCostRows([...newCostRows, newRow]);
  };

  const handleRemoveCostRow = (rowId: string) => {
    setNewCostRows(newCostRows.filter(row => row.id !== rowId));
  };

  const handleUpdateCostRow = (rowId: string, field: 'name' | 'amount', value: string) => {
    setNewCostRows(newCostRows.map(row => 
      row.id === rowId ? { 
        ...row, 
        [field]: value 
      } : row
    ));
  };

  const handleRemoveCost = (costId: string) => {
    setAssociatedCosts(associatedCosts.filter(cost => cost.id !== costId));
  };

  const handleUpdateCost = (costId: string, field: keyof AssociatedCost, value: string | number) => {
    setAssociatedCosts(associatedCosts.map(cost => 
      cost.id === costId ? { 
        ...cost, 
        [field]: value 
      } : cost
    ));
  };

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

    onSave(name.trim(), priceValue, finalAssociatedCosts);
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
        
        <CurrencyInput
          id="product-price"
          label="Price"
          currency={currency}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          showFree
        />
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label>COGS (Cost of Goods Sold)</Label>
          </div>
          
          {associatedCosts.length > 0 && (
            <div className="space-y-2">
              {associatedCosts.map(cost => (
                <div key={cost.id} className="flex items-center gap-2">
                  <div className="flex-[2]">
                    <Input
                      id={`cost-name-${cost.id}`}
                      value={cost.name}
                      onChange={(e) => handleUpdateCost(cost.id, 'name', e.target.value)}
                      className="h-8 text-sm"
                      placeholder="Enter cost name"
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <CurrencyInput
                      id={`cost-amount-${cost.id}`}
                      currency={currency}
                      value={cost.amount === 0 ? '' : cost.amount.toString()}
                      onChange={(e) => handleUpdateCost(cost.id, 'amount', e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => handleRemoveCost(cost.id)}
                  >
                    <XIcon className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          {/* New cost rows */}
          {newCostRows.length > 0 && (
            <div className="space-y-2">
              {newCostRows.map(row => (
                <div key={row.id} className="flex items-center gap-2">
                  <div className="flex-[2]">
                    <Input
                      id={`new-cost-name-${row.id}`}
                      value={row.name}
                      onChange={(e) => handleUpdateCostRow(row.id, 'name', e.target.value)}
                      placeholder="Enter cost name"
                      className="h-8 text-sm"
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <CurrencyInput
                      id={`new-cost-amount-${row.id}`}
                      currency={currency}
                      value={row.amount}
                      onChange={(e) => handleUpdateCostRow(row.id, 'amount', e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => handleRemoveCostRow(row.id)}
                  >
                    <XIcon className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          {/* Add Cost button */}
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={handleAddCostRow}
            className="h-8 w-full"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add COGS Item
          </Button>
        </div>
        
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