import type { FixedCost, UpfrontCost, Product, Subscription } from '../storage/types';

/**
 * Check if a fixed (running) cost has all required financial values
 */
export function isFixedCostComplete(cost: FixedCost): boolean {
  return cost.amount !== undefined && cost.amount !== null;
}

/**
 * Check if an upfront cost has all required financial values
 */
export function isUpfrontCostComplete(cost: UpfrontCost): boolean {
  return cost.amount !== undefined && cost.amount !== null;
}

/**
 * Check if any cost (fixed or upfront) has all required financial values
 */
export function isCostComplete(cost: FixedCost | UpfrontCost): boolean {
  return cost.amount !== undefined && cost.amount !== null;
}

/**
 * Check if a product has all required financial values (price and sales)
 */
export function isProductComplete(product: Product): boolean {
  return (
    product.price !== undefined &&
    product.price !== null &&
    product.sales !== undefined &&
    product.sales.volume !== undefined
  );
}

/**
 * Check if a subscription has all required financial values (price and subscribers)
 */
export function isSubscriptionComplete(subscription: Subscription): boolean {
  return (
    subscription.price !== undefined &&
    subscription.price !== null &&
    subscription.subscribers !== undefined &&
    subscription.subscribers !== null
  );
}

/**
 * Count incomplete items in a project's cost structure and revenue streams
 */
export function countIncompleteItems(
  fixedCosts: FixedCost[],
  upfrontCosts: UpfrontCost[],
  products: Product[],
  subscriptions: Subscription[]
): {
  incompleteCosts: number;
  incompleteRevenue: number;
  total: number;
} {
  const incompleteCosts =
    fixedCosts.filter((c) => !isFixedCostComplete(c)).length +
    upfrontCosts.filter((c) => !isUpfrontCostComplete(c)).length;

  const incompleteRevenue =
    products.filter((p) => !isProductComplete(p)).length +
    subscriptions.filter((s) => !isSubscriptionComplete(s)).length;

  return {
    incompleteCosts,
    incompleteRevenue,
    total: incompleteCosts + incompleteRevenue,
  };
}

