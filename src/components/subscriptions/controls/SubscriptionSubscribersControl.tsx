import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Minus, Plus } from 'lucide-react';
import { useMemo } from 'react';
import { Slider } from '@/components/ui/slider';

interface SubscriptionSubscribersControlProps {
  id: string;
  label?: string;
  subscribers: number | undefined;
  onSubscribersChange: (value: number | undefined) => void;
  minSubscribers?: number;
  step?: number;
  disabled?: boolean;
}

export function SubscriptionSubscribersControl({
  id,
  label = 'Subscribers',
  subscribers,
  onSubscribersChange,
  minSubscribers = 0,
  step = 1,
  disabled = false,
}: SubscriptionSubscribersControlProps) {
  // Display: undefined → '', 0 → '0', other → number
  const displayValue = useMemo(() => {
    if (subscribers === undefined) return '';
    return subscribers;
  }, [subscribers]);

  const handleAdjust = (direction: 'increase' | 'decrease') => {
    if (disabled) return;
    const currentSubscribers = subscribers ?? 0;
    const delta = direction === 'increase' ? step : -step;
    const nextValue = Math.max(minSubscribers, currentSubscribers + delta);
    onSubscribersChange(nextValue);
  };

  return (
    <div className="bg-muted rounded-md p-3 space-y-4 w-full">
      <Label htmlFor={id}>{label}</Label>
      <Slider
        value={[subscribers ?? 0]}
        onValueChange={(value) => onSubscribersChange(value[0])}
        min={minSubscribers}
        max={10000}
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
          disabled={disabled || (subscribers ?? 0) <= minSubscribers}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <div className="col-span-2">
          <Input
            id={id}
            type="number"
            min={minSubscribers}
            step={step}
            value={displayValue}
            placeholder="Enter subscribers"
            onChange={(e) => {
              // Empty string → undefined, '0' → 0, other → parsed number
              if (e.target.value === '') {
                onSubscribersChange(undefined);
              } else {
                const parsed = Number.parseInt(e.target.value, 10);
                if (!isNaN(parsed)) {
                  onSubscribersChange(Math.max(minSubscribers, parsed));
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

