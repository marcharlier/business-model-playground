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
  onVolumeChange: (value: number) => void;
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
  const displayValue = useMemo(() => (sales.volume === 0 ? '' : sales.volume), [sales.volume]);

  const handleAdjust = (direction: 'increase' | 'decrease') => {
    if (disabled) return;
    const delta = direction === 'increase' ? step : -step;
    const nextValue = Math.max(minVolume, (sales.volume || 0) + delta);
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
        value={[sales.volume]}
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
          disabled={disabled || sales.volume <= minVolume}
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
            placeholder="0"
            onChange={(e) => {
              const value = e.target.value === '' ? 0 : Math.max(minVolume, Number.parseInt(e.target.value, 10) || 0);
              onVolumeChange(value);
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

