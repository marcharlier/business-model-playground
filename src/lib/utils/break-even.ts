import type { Product, Subscription, ProductSales } from '@/lib/storage/types';
import { getSubscriptionMonthlyPrice } from './financial';

export interface BreakEvenResult {
  months: number | null;
  isImmediateProfitable: boolean;
  hasRevenue: boolean;
  hasPositiveMargin: boolean;
}

/**
 * Calculate the month when the business breaks even (cumulative revenue >= cumulative costs)
 */
export function calculateBreakEven(
  products: Product[],
  productSales: Record<string, ProductSales>,
  fixedCosts: { monthly: number; annual: number; upfront: number },
  subscriptions: Subscription[] = []
): BreakEvenResult {
  // Calculate monthly revenue from products
  const productRevenue = products.reduce((total, product) => {
    const sales = productSales[product.id] || { volume: 1, period: 'monthly' };
    const monthlyVolume = sales.period === 'monthly' ? sales.volume : sales.volume * 30;
    return total + (product.price * monthlyVolume);
  }, 0);

  // Calculate monthly revenue from subscriptions
  const subscriptionRevenue = subscriptions.reduce((total, subscription) => {
    const monthlyPrice = getSubscriptionMonthlyPrice(subscription);
    return total + (monthlyPrice * subscription.subscribers);
  }, 0);

  const monthlyRevenue = productRevenue + subscriptionRevenue;

  // Calculate monthly variable costs (COGS) from products
  const productCogs = products.reduce((total, product) => {
    const sales = productSales[product.id] || { volume: 1, period: 'monthly' };
    const monthlyVolume = sales.period === 'monthly' ? sales.volume : sales.volume * 30;
    const unitCost = product.associatedCosts.reduce((sum, cost) => sum + cost.amount, 0);
    return total + (unitCost * monthlyVolume);
  }, 0);

  // Calculate monthly variable costs (COGS) from subscriptions
  // For subscriptions, COGS are per subscriber per month
  const subscriptionCogs = subscriptions.reduce((total, subscription) => {
    const unitCost = subscription.associatedCosts.reduce((sum, cost) => sum + cost.amount, 0);
    return total + (unitCost * subscription.subscribers);
  }, 0);

  const monthlyCogs = productCogs + subscriptionCogs;

  // Use the pre-calculated totals (same as chart)
  const monthlyFixedCosts = fixedCosts.monthly;
  const annualFixedCosts = fixedCosts.annual;
  const totalUpfrontCosts = fixedCosts.upfront;

  // Edge cases
  if (monthlyRevenue === 0) {
    return {
      months: null,
      isImmediateProfitable: false,
      hasRevenue: false,
      hasPositiveMargin: false
    };
  }

  // Calculate month 1 profit to check if immediately profitable
  // Month 1 includes: revenue - COGS - monthly costs - annual costs - upfront costs
  const month1Profit = monthlyRevenue - monthlyCogs - monthlyFixedCosts - annualFixedCosts - totalUpfrontCosts;
  
  // Calculate ongoing monthly profit (after month 1, without annual and upfront costs)
  const ongoingMonthlyProfit = monthlyRevenue - monthlyCogs - monthlyFixedCosts;

  // If ongoing monthly profit is negative, business will never be profitable
  if (ongoingMonthlyProfit <= 0) {
    return {
      months: null,
      isImmediateProfitable: false,
      hasRevenue: true,
      hasPositiveMargin: false
    };
  }

  // If month 1 profit is positive, immediately profitable
  if (month1Profit >= 0) {
    return {
      months: null,
      isImmediateProfitable: true,
      hasRevenue: true,
      hasPositiveMargin: true
    };
  }

  // Calculate break-even month
  // We need to find when cumulative revenue >= cumulative costs
  let cumulativeRevenue = 0;
  let cumulativeCosts = 0;

  for (let month = 1; month <= 120; month++) { // Check up to 10 years
    cumulativeRevenue += monthlyRevenue;
    
    // Add upfront costs only in month 1
    if (month === 1) {
      cumulativeCosts += totalUpfrontCosts;
    }
    
    // Add annual costs at start of each year (month 1, 13, 25, etc.)
    if ((month - 1) % 12 === 0) {
      cumulativeCosts += annualFixedCosts;
    }
    
    // Add monthly costs every month
    cumulativeCosts += monthlyFixedCosts + monthlyCogs;

    if (cumulativeRevenue >= cumulativeCosts) {
      return {
        months: month,
        isImmediateProfitable: false,
        hasRevenue: true,
        hasPositiveMargin: true
      };
    }
  }

  // If we reach here, business doesn't break even within 10 years
  return {
    months: null,
    isImmediateProfitable: false,
    hasRevenue: true,
    hasPositiveMargin: true
  };
}

/**
 * Format the break-even result into a human-readable statement
 */
export function formatBreakEvenStatement(result: BreakEvenResult): string {
  if (!result.hasRevenue) {
    return "Set up your revenue streams to see break-even analysis.";
  }

  if (!result.hasPositiveMargin) {
    return "Your running costs exceed revenue. Adjust pricing or reduce costs to achieve profitability.";
  }

  if (result.isImmediateProfitable) {
    return "Your business is profitable from day 1.";
  }

  if (result.months === null) {
    return "Break-even point is beyond 10 years with current projections.";
  }

  if (result.months === 1) {
    return "Your business will break even in the first month.";
  }

  const years = Math.floor(result.months / 12);
  const remainingMonths = result.months % 12;

  if (years === 0) {
    return `Your business will break even in ${result.months} month${result.months > 1 ? 's' : ''}.`;
  } else if (remainingMonths === 0) {
    return `Your business will break even in ${years} year${years > 1 ? 's' : ''}.`;
  } else {
    return `Your business will break even in ${years} year${years > 1 ? 's' : ''} and ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}.`;
  }
}
