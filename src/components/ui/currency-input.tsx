import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { Currency } from '@/lib/storage/types';

const currencySymbols: Record<Currency, string> = {
  GBP: '£',
  USD: '$',
  EUR: '€',
};

interface CurrencyInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  currency: Currency;
  label?: string;
  error?: string;
  showFree?: boolean;
}

export function CurrencyInput({
  currency,
  label,
  error,
  showFree = false,
  className,
  value,
  onChange,
  ...props
}: CurrencyInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Allow empty value
    if (value === '') {
      onChange?.(e);
      return;
    }

    // Check if the value is a valid decimal number with up to 2 decimal places
    // This regex ensures:
    // - Optional leading digits
    // - Optional decimal point
    // - Up to 2 decimal places
    // - No multiple decimal points
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      onChange?.(e);
    }
  };

  const displayValue = value === 0 ? '' : value;
  const placeholder = showFree ? 'Free' : '0.00';

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="relative">
        <Input
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          className={cn("pl-6 bg-background", error && "border-destructive", className)}
          {...props}
        />
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          {currencySymbols[currency]}
        </span>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
} 