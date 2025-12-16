import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Minus, Plus } from 'lucide-react';
import type { ProductSales } from '@/lib/storage/types';
import { useMemo } from 'react';
import { Slider } from '@/components/ui/slider';

interface ProductSalesControlProps {
  id: string;
  label?: string;
  sales: ProductSales;
  onVolumeChange: (value: number | undefined) => void;
  onPeriodChange: (period: ProductSales['period']) => void;
  minVolume?: number;
  step?: number;
  disabled?: boolean;
}

export function ProductSalesControl({
  id,
  label = 'Expected sales',
  sales,
  onVolumeChange,
  onPeriodChange,
  minVolume = 0,
  step = 1,
  disabled = false,
}: ProductSalesControlProps) {
  // Display: undefined → '', 0 → '0', other → number
  const displayValue = useMemo(() => {
    if (sales.volume === undefined) return '';
    return sales.volume;
  }, [sales.volume]);

  const handleAdjust = (direction: 'increase' | 'decrease') => {
    if (disabled) return;
    const currentVolume = sales.volume ?? 0;
    const delta = direction === 'increase' ? step : -step;
    const nextValue = Math.max(minVolume, currentVolume + delta);
    onVolumeChange(nextValue);
  };

  return (
    <div className="bg-muted rounded-md p-3 space-y-4 w-full">
      <Label htmlFor={id}>{label}</Label>
      <Tabs
        value={sales.period}
        onValueChange={(value) => onPeriodChange(value as ProductSales['period'])}
        className="w-full"
      >
        <TabsList className="h-8 w-full">
          <TabsTrigger value="daily" className="px-3 py-1 text-xs">
            Daily
          </TabsTrigger>
          <TabsTrigger value="monthly" className="px-3 py-1 text-xs">
            Monthly
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <Slider
        value={[sales.volume ?? 0]}
        onValueChange={(value) => onVolumeChange(value[0])}
        min={minVolume}
        max={1000}
        step={1}
        className="w-full"
      />
      <div className="grid grid-cols-4 gap-2 mt-1 items-center">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-full text-muted-foreground"
          type="button"
          onClick={() => handleAdjust('decrease')}
          disabled={disabled || (sales.volume ?? 0) <= minVolume}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <div className="col-span-2">
          <Input
            id={id}
            type="number"
            min={minVolume}
            step={step}
            value={displayValue}
            placeholder="Enter volume"
            onChange={(e) => {
              // Empty string → undefined, '0' → 0, other → parsed number
              if (e.target.value === '') {
                onVolumeChange(undefined);
              } else {
                const parsed = Number.parseInt(e.target.value, 10);
                if (!isNaN(parsed)) {
                  onVolumeChange(Math.max(minVolume, parsed));
                }
              }
            }}
            className="h-10 text-base w-full bg-background text-center md:pl-[26px]"
            disabled={disabled}
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-full text-muted-foreground"
          type="button"
          onClick={() => handleAdjust('increase')}
          disabled={disabled}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

