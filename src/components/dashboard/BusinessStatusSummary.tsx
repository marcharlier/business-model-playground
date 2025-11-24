import { AlertCircle, TrendingUp, CircleDollarSign } from 'lucide-react';
import type { Project, ProductSales } from '@/lib/storage/types';
import { calculateProductTotalCost } from '@/lib/utils/financial';
import { CardTitle } from '@/components/ui/card';

interface BusinessStatusSummaryProps {
  project: Project;
  productSales: Record<string, ProductSales>;
  showTitle?: boolean;
}

export function BusinessStatusSummary({ project, productSales, showTitle = false }: BusinessStatusSummaryProps) {
  // Calculate total monthly operating costs
  const totalMonthlyFixedCosts = project.costStructure.fixedRunningCosts.reduce((total, cost) => {
    const monthlyAmount = cost.frequency === 'annual' ? cost.amount / 12 : cost.amount;
    return total + monthlyAmount;
  }, 0);

  // Calculate total monthly variable costs
  const totalMonthlyVariableCosts = project.revenueStreams.products.reduce((total, product) => {
    const productCost = calculateProductTotalCost(product);
    const sales = productSales[product.id] || product.sales || { volume: 1, period: 'monthly' };
    const monthlyVolume = sales.period === 'monthly' ? sales.volume : sales.volume * 30;
    return total + (productCost * monthlyVolume);
  }, 0);

  // Calculate total monthly revenue
  const totalMonthlyRevenue = project.revenueStreams.products.reduce((total, product) => {
    const sales = productSales[product.id] || product.sales || { volume: 1, period: 'monthly' };
    const monthlyVolume = sales.period === 'monthly' ? sales.volume : sales.volume * 30;
    return total + (product.price * monthlyVolume);
  }, 0);

  // Calculate total monthly profit
  const totalMonthlyProfit = totalMonthlyRevenue - totalMonthlyFixedCosts - totalMonthlyVariableCosts;

  // Calculate profit margin
  const profitMargin = totalMonthlyRevenue > 0 
    ? (totalMonthlyProfit / totalMonthlyRevenue) * 100 
    : 0;

  // Determine business status
  const getStatusInfo = () => {
    if (totalMonthlyProfit < 0) {
      return {
        icon: <AlertCircle className="h-5 w-5 text-red-500" />,
        title: "Not operating profitably",
        color: "text-red-500",
        message: "Increase sales, raise prices, or reduce costs to achieve operating profitability.",
        bgColor: "bg-red-500/10"
      };
    }
    
    if (profitMargin < 10) {
      return {
        icon: <TrendingUp className="h-5 w-5 text-yellow-500" />,
        title: "Your operations are just about profitable",
        color: "text-yellow-600 dark:text-yellow-500",
        message: "Your operations are profitable but margins are tight (below 10%).",
        bgColor: "bg-yellow-500/10"
      };
    }

    if (profitMargin < 25) {
      return {
        icon: <TrendingUp className="h-5 w-5 text-green-500" />,
        title: "Good operating profit",
        color: "text-green-600 dark:text-green-500",
        message: `Your operations are profitable and margins are good (~${Math.round(profitMargin)}%).`,
        bgColor: "bg-green-500/10"
      };
    }
    
    return {
      icon: <CircleDollarSign className="h-5 w-5 text-green-500" />,
      title: "Great operating profit!",
      color: "text-green-600 dark:text-green-500",
      message: "Well done! Your business operations are showing healthy profitability. (Above 25%)",
      bgColor: "bg-green-500/20"
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <div className={`py-8 px-4 h-full ${statusInfo.bgColor} rounded-t-[0.7rem]`}>
      <div className="flex flex-row items-center gap-2">
        {statusInfo.icon}
        {showTitle ? (
          <CardTitle className={statusInfo.color}>{statusInfo.title}</CardTitle>
        ) : (
          <h2 className="text-lg font-semibold">{statusInfo.title}</h2>
        )}
      </div>
      <p className="text-sm text-muted-foreground mt-2">{statusInfo.message}</p>
    </div>
  );
} 