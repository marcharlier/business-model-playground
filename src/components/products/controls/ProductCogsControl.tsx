import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusIcon, XIcon } from 'lucide-react';
import type { AssociatedCost, Currency } from '@/lib/storage/types';
import { CurrencyInput } from '@/components/ui/currency-input';

export interface CostRow {
  id: string;
  name: string;
  amount: string;
}

interface ProductCogsControlProps {
  label?: string;
  associatedCosts: AssociatedCost[];
  newCostRows: CostRow[];
  currency: Currency;
  onCostsChange: (costs: AssociatedCost[]) => void;
  onNewCostRowsChange: (rows: CostRow[]) => void;
  disabled?: boolean;
}

export function ProductCogsControl({
  label = 'COGS (Cost of Goods Sold)',
  associatedCosts,
  newCostRows,
  currency,
  onCostsChange,
  onNewCostRowsChange,
  disabled = false,
}: ProductCogsControlProps) {
  const handleAddCostRow = () => {
    if (disabled) return;
    const newRow: CostRow = {
      id: crypto.randomUUID(),
      name: '',
      amount: '',
    };
    onNewCostRowsChange([...newCostRows, newRow]);
  };

  const handleRemoveCostRow = (rowId: string) => {
    onNewCostRowsChange(newCostRows.filter((row) => row.id !== rowId));
  };

  const handleUpdateCostRow = (rowId: string, field: 'name' | 'amount', value: string) => {
    if (disabled) return;
    onNewCostRowsChange(
      newCostRows.map((row) =>
        row.id === rowId
          ? {
              ...row,
              [field]: value,
            }
          : row
      )
    );
  };

  const handleRemoveCost = (costId: string) => {
    if (disabled) return;
    onCostsChange(associatedCosts.filter((cost) => cost.id !== costId));
  };

  const handleUpdateCost = (costId: string, field: keyof AssociatedCost, value: string | number) => {
    if (disabled) return;
    onCostsChange(
      associatedCosts.map((cost) =>
        cost.id === costId
          ? {
              ...cost,
              [field]: value,
            }
          : cost
      )
    );
  };

  return (
    <div className="bg-muted rounded-md p-3 space-y-4 w-full">
      <Label>{label}</Label>
      <div className="space-y-2">
      {associatedCosts.length > 0 && (
        <div className="space-y-2">
          {associatedCosts.map((cost) => (
            <div key={cost.id} className="flex items-center gap-2">
              <div className="flex-[2]">
                <Input
                  id={`cost-name-${cost.id}`}
                  value={cost.name}
                  onChange={(e) => handleUpdateCost(cost.id, 'name', e.target.value)}
                  className="h-8 text-sm bg-background"
                  placeholder="Enter cost name"
                  required
                  disabled={disabled}
                  autoComplete="off"
                />
              </div>
              <div className="flex-1">
                <CurrencyInput
                  id={`cost-amount-${cost.id}`}
                  currency={currency}
                  value={cost.amount === 0 ? '' : cost.amount.toString()}
                  onChange={(e) => handleUpdateCost(cost.id, 'amount', e.target.value)}
                  className="h-8 text-sm"
                  disabled={disabled}
                  autoComplete="off"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={() => handleRemoveCost(cost.id)}
                disabled={disabled}
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
          {newCostRows.map((row) => (
            <div key={row.id} className="flex items-center gap-2">
              <div className="flex-[2]">
                <Input
                  id={`new-cost-name-${row.id}`}
                  value={row.name}
                  onChange={(e) => handleUpdateCostRow(row.id, 'name', e.target.value)}
                  placeholder="Enter cost name"
                  className="h-8 text-sm bg-background"
                  required
                  disabled={disabled}
                />
              </div>
              <div className="flex-1">
                <CurrencyInput
                  id={`new-cost-amount-${row.id}`}
                  currency={currency}
                  value={row.amount}
                  onChange={(e) => handleUpdateCostRow(row.id, 'amount', e.target.value)}
                  className="h-8 text-sm"
                  disabled={disabled}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={() => handleRemoveCostRow(row.id)}
                disabled={disabled}
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
        variant="ghost"
        size="sm"
        onClick={handleAddCostRow}
        className="h-8 w-full text-muted-foreground"
        disabled={disabled}
      >
        <PlusIcon className="h-4 w-4 mr-1" />
        Add row
      </Button>
      </div>
    </div>
  );
}

