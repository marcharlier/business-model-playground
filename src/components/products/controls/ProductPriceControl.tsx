import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CurrencyInput } from '@/components/ui/currency-input';
import type { Currency } from '@/lib/storage/types';
import { Slider } from '@/components/ui/slider';

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
  containerClassName = 'bg-muted rounded-md p-3 space-y-4',
  inputClassName = 'h-10 text-base',
}: ProductPriceControlProps) {
  const basePriceRef = useRef<number | null>(null);
  const [sliderValue, setSliderValue] = useState(100); // 100 = middle (0% change)
  const hasInitializedRef = useRef(false);

  // Convert slider value (0-200) to price
  // 0 = -100% (0), 100 = 0% (base), 200 = +100% (2x base)
  const sliderToPrice = useCallback((sliderVal: number, base: number): string => {
    if (base === 0) return '';
    const multiplier = sliderVal / 100; // 0 = 0x, 100 = 1x, 200 = 2x
    const newPrice = base * multiplier;
    if (newPrice === 0) return '';
    return Math.max(0, Number.parseFloat(newPrice.toFixed(2))).toFixed(2);
  }, []);

  // Convert price to slider value (0-200)
  const priceToSlider = useCallback((price: number, base: number): number => {
    if (base === 0) return 100; // Default to middle if no base
    const multiplier = price / base;
    return Math.max(0, Math.min(200, Math.round(multiplier * 100)));
  }, []);

  // Initialize base price and reset slider when component first shows
  useEffect(() => {
    if (!hasInitializedRef.current) {
      const currentPrice = Number.parseFloat(value || '0') || 0;
      const basePrice = currentPrice || 1; // Use 1 as default if price is 0
      basePriceRef.current = basePrice;
      // Reset slider to middle (100 = 0% change from base)
      setSliderValue(100);
      hasInitializedRef.current = true;
    }
  }, [value]); // Initialize with initial value, but only run once due to hasInitializedRef guard

  const handleSliderChange = useCallback(
    (newSliderValue: number[]) => {
      const newValue = newSliderValue[0];
      setSliderValue(newValue);
      if (basePriceRef.current !== null) {
        const newPrice = sliderToPrice(newValue, basePriceRef.current);
        onChange(newPrice);
      }
    },
    [onChange, sliderToPrice]
  );

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const newPrice = event.target.value;
      onChange(newPrice);
      // Update slider position based on new price
      if (basePriceRef.current !== null) {
        const numericPrice = Number.parseFloat(newPrice || '0') || 0;
        const newSliderVal = priceToSlider(numericPrice, basePriceRef.current);
        setSliderValue(newSliderVal);
      }
    },
    [onChange, priceToSlider]
  );

  const handleAdjust = useCallback(
    (direction: 'increase' | 'decrease') => {
      const numericValue = Number.parseFloat(value || '0') || 0;
      const factor = adjustPercent / 100;
      const multiplier = direction === 'increase' ? 1 + factor : 1 - factor;
      const adjusted = Math.max(0, Number.parseFloat((numericValue * multiplier).toFixed(2)));
      const nextValue = adjusted === 0 ? '' : adjusted.toFixed(2);
      onChange(nextValue);
      // Update slider position
      if (basePriceRef.current !== null) {
        const newSliderVal = priceToSlider(adjusted, basePriceRef.current);
        setSliderValue(newSliderVal);
      }
    },
    [adjustPercent, onChange, value, priceToSlider]
  );

  return (
    <div className={containerClassName}>
      <Label htmlFor={id}>{label}</Label>
      <Slider
        value={[sliderValue]}
        onValueChange={handleSliderChange}
        min={0}
        max={200}
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
          variant="ghost"
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

