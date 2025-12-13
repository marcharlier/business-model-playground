import type { Product, Subscription } from '../storage/types';

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

/**
 * Calculate the total cost of a subscription including all associated costs
 */
export function calculateSubscriptionTotalCost(subscription: Subscription): number {
  return subscription.associatedCosts.reduce((total, cost) => total + cost.amount, 0);
}

/**
 * Get the monthly price for a subscription, converting annual prices to monthly
 */
export function getSubscriptionMonthlyPrice(subscription: Subscription): number {
  return subscription.pricePeriod === 'annual' 
    ? subscription.price / 12 
    : subscription.price;
}

/**
 * Calculate the profit margin for a subscription as a percentage
 * Returns a number between 0 and 100
 */
export function calculateSubscriptionProfitMargin(subscription: Subscription): number {
  const totalCost = calculateSubscriptionTotalCost(subscription);
  const monthlyPrice = getSubscriptionMonthlyPrice(subscription);
  if (monthlyPrice === 0) return 0;
  
  const profit = monthlyPrice - totalCost;
  return (profit / monthlyPrice) * 100;
} 