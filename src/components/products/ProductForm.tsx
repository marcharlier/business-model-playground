import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { PlusIcon, XIcon } from 'lucide-react';
import type { Product, AssociatedCost, Currency } from '@/lib/storage/types';

interface ProductFormProps {
  className?: string;
  product?: Product;
  currency: Currency;
  onSave: (name: string, price: number, associatedCosts: AssociatedCost[]) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  hideCancel?: boolean;
}

export function ProductForm({
  className,
  product,
  currency,
  onSave,
  onCancel,
  isSubmitting,
  hideCancel
}: ProductFormProps) {
  const [name, setName] = useState(product?.name ?? '');
  const [price, setPrice] = useState(product?.price.toString() ?? '');
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
      row.id === rowId ? { ...row, [field]: value } : row
    ));
  };

  const handleRemoveCost = (costId: string) => {
    setAssociatedCosts(associatedCosts.filter(cost => cost.id !== costId));
  };

  const handleUpdateCost = (costId: string, field: keyof AssociatedCost, value: string | number) => {
    setAssociatedCosts(associatedCosts.map(cost => 
      cost.id === costId ? { ...cost, [field]: value } : cost
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !price) {
      return;
    }

    const priceValue = Number.parseFloat(price);
    if (Number.isNaN(priceValue) || priceValue <= 0) {
      return;
    }

    // Process new cost rows and add valid ones to associated costs
    let finalAssociatedCosts = [...associatedCosts];
    
    for (const row of newCostRows) {
      if (row.name && row.amount) {
        const amount = Number.parseFloat(row.amount);
        if (!Number.isNaN(amount) && amount > 0) {
          const newCost: AssociatedCost = {
            id: crypto.randomUUID(),
            name: row.name,
            amount: amount,
            productId: product?.id || '',
            projectId: product?.projectId || ''
          };
          finalAssociatedCosts = [...finalAssociatedCosts, newCost];
        }
      }
    }

    onSave(name, priceValue, finalAssociatedCosts);
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
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="product-price">Price</Label>
          <div className="relative">
            <Input
              id="product-price"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="pl-6"
            />
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              {currency === 'GBP' ? '£' : currency === 'USD' ? '$' : '€'}
            </span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label>Associated Costs</Label>
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
                    />
                  </div>
                  <div className="flex-1">
                    <div className="relative">
                      <Input
                        id={`cost-amount-${cost.id}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={cost.amount}
                        onChange={(e) => handleUpdateCost(cost.id, 'amount', Number(e.target.value))}
                        className="h-8 text-sm pl-6"
                      />
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                        {currency === 'GBP' ? '£' : currency === 'USD' ? '$' : '€'}
                      </span>
                    </div>
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
                    />
                  </div>
                  <div className="flex-1">
                    <div className="relative">
                      <Input
                        id={`new-cost-amount-${row.id}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={row.amount}
                        onChange={(e) => handleUpdateCostRow(row.id, 'amount', e.target.value)}
                        placeholder="0.00"
                        className="h-8 text-sm pl-6"
                      />
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                        {currency === 'GBP' ? '£' : currency === 'USD' ? '$' : '€'}
                      </span>
                    </div>
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
            Add Cost
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
            disabled={isSubmitting}
            className={`h-9 ${hideCancel ? 'w-full' : 'flex-1'}`}
          >
            {product ? 'Save changes' : 'Add product'}
          </Button>
        </div>
      </div>
    </form>
  );
} 