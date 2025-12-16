'use client';

import { Card, CardContent } from '@/components/ui/card';
import { calculateBreakEven, formatBreakEvenStatement } from '@/lib/utils/break-even';
import type { Product, ProductSales, FixedCost, UpfrontCost } from '@/lib/storage/types';

interface BreakEvenStatementProps {
  products: Product[];
  productSales: Record<string, ProductSales>;
  fixedCosts: FixedCost[];
  upfrontCosts: UpfrontCost[];
}

// Helper function to calculate totals like the dashboard does
function calculateFixedCostTotals(fixedCosts: FixedCost[], upfrontCosts: UpfrontCost[]) {
  const totalMonthlyFixedCosts = fixedCosts.reduce((total, cost) => {
    const amount = cost.amount ?? 0;
    return cost.frequency === 'monthly' ? total + amount : total;
  }, 0);

  const totalAnnualFixedCosts = fixedCosts.reduce((total, cost) => {
    const amount = cost.amount ?? 0;
    return cost.frequency === 'annual' ? total + amount : total;
  }, 0);

  const totalUpfrontFixedCosts = upfrontCosts.reduce((total, cost) => total + (cost.amount ?? 0), 0);

  return {
    monthly: totalMonthlyFixedCosts,
    annual: totalAnnualFixedCosts,
    upfront: totalUpfrontFixedCosts
  };
}

export function BreakEvenStatement({ 
  products, 
  productSales, 
  fixedCosts, 
  upfrontCosts 
}: BreakEvenStatementProps) {
  const costTotals = calculateFixedCostTotals(fixedCosts, upfrontCosts);
  

  
  const result = calculateBreakEven(products, productSales, costTotals);
  const statement = formatBreakEvenStatement(result);

  // Determine text color based on the result
  const getTextColor = () => {
    if (!result.hasRevenue || !result.hasPositiveMargin) {
      return 'text-amber-600';
    }
    if (result.isImmediateProfitable) {
      return 'text-green-600';
    }
    if (result.months && result.months <= 12) {
      return 'text-blue-600';
    }
    if (result.months && result.months <= 36) {
      return 'text-purple-600';
    }
    return 'text-amber-600';
  };

  return (
    <Card>
        <CardContent className={getTextColor()}>
          {statement}
        </CardContent>
    </Card>
  );
}
