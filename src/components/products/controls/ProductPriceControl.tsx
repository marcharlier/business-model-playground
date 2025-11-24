import { useCallback, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CurrencyInput } from '@/components/ui/currency-input';
import type { Currency } from '@/lib/storage/types';

interface ProductPriceControlProps {
  id: string;
  currency: Currency;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  adjustPercent?: number;
  showFree?: boolean;
  containerClassName?: string;
  inputClassName?: string;
}

export function ProductPriceControl({
  id,
  currency,
  label = 'Price',
  value,
  onChange,
  adjustPercent = 5,
  showFree = true,
  containerClassName = 'space-y-2',
  inputClassName = 'h-10 text-base',
}: ProductPriceControlProps) {
  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.value);
    },
    [onChange]
  );

  const handleAdjust = useCallback(
    (direction: 'increase' | 'decrease') => {
      const numericValue = Number.parseFloat(value || '0') || 0;
      const factor = adjustPercent / 100;
      const multiplier = direction === 'increase' ? 1 + factor : 1 - factor;
      const adjusted = Math.max(0, Number.parseFloat((numericValue * multiplier).toFixed(2)));
      const nextValue = adjusted === 0 ? '' : adjusted.toFixed(2);
      onChange(nextValue);
    },
    [adjustPercent, onChange, value]
  );

  return (
    <div className={containerClassName}>
      <Label htmlFor={id}>{label}</Label>
      <div className="grid grid-cols-4 gap-2 mt-1 items-center">
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-full text-muted-foreground"
          type="button"
          onClick={() => handleAdjust('decrease')}
        >
          <span className="text-sm">-{adjustPercent}%</span>
        </Button>
        <div className="col-span-2 flex items-center space-x-1">
          <CurrencyInput
            id={id}
            currency={currency}
            value={value}
            onChange={handleInputChange}
            showFree={showFree}
            className={`${inputClassName} w-full`}
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-full text-muted-foreground"
          type="button"
          onClick={() => handleAdjust('increase')}
        >
          <span className="text-sm">+{adjustPercent}%</span>
        </Button>
      </div>
    </div>
  );
}

