import type { Product } from '../storage/types';

/**
 * Calculate the total cost of a product including all associated costs
 */
export function calculateProductTotalCost(product: Product): number {
  return product.associatedCosts.reduce((total, cost) => total + cost.amount, 0);
}

/**
 * Calculate the profit margin for a product as a percentage
 * Returns a number between 0 and 100
 */
export function calculateProfitMargin(product: Product): number {
  const totalCost = calculateProductTotalCost(product);
  if (product.price === 0) return 0;
  
  const profit = product.price - totalCost;
  return (profit / product.price) * 100;
}

/**
 * Get a color class based on profit margin
 * Returns a Tailwind CSS class for text color
 */
export function getProfitMarginColorClass(margin: number): string {
  if (margin >= 50) return 'text-green-600';
  if (margin >= 25) return 'text-green-500';
  if (margin > 0) return 'text-yellow-500';
  return 'text-red-500';
}

/**
 * Format a profit margin as a percentage string
 */
export function formatProfitMargin(margin: number): string {
  return `${margin.toFixed(1)}%`;
} 