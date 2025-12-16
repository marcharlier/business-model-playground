import type { Currency } from '../storage/types';

const currencySymbols: Record<Currency, string> = {
  GBP: '£',
  USD: '$',
  EUR: '€',
};

export const formatCurrency = (amount: number | undefined | null, currency: Currency): string => {
  const symbol = currencySymbols[currency];
  
  // Handle undefined/null values (suggestion mode)
  if (amount === undefined || amount === null) {
    return `${symbol}--`;
  }
  
  // Format with 2 decimal places and thousands separators
  const formattedAmount = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  
  return `${symbol}${formattedAmount}`;
};

export const parseCurrencyInput = (value: string): number => {
  // Remove currency symbols and commas, then parse as float
  const cleanValue = value.replace(/[£$€,]/g, '');
  return Number.parseFloat(cleanValue) || 0;
}; 