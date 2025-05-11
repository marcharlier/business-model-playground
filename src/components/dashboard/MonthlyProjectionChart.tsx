'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { TooltipProps } from 'recharts';
import { formatCurrency } from '@/lib/utils/currency';
import type { Currency, ProductSales } from '@/lib/storage/types';
import type { Product } from '@/lib/storage/types';
import { useMemo } from 'react';

interface MonthlyProjectionChartProps {
  products: Product[];
  productSales: Record<string, ProductSales>;
  fixedCosts: { monthly: number; annual: number };
  currency: Currency;
}

type CustomTooltipProps = TooltipProps<number, string>;

export function MonthlyProjectionChart({ 
  products, 
  productSales, 
  fixedCosts,
  currency 
}: MonthlyProjectionChartProps) {
  // Calculate monthly data for 12 months
  const data = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    
    // Calculate base monthly revenue (one month's worth)
    const baseMonthlyRevenue = products.reduce((total, product) => {
      const sales = productSales[product.id] || { volume: 1, period: 'monthly' };
      const monthlyVolume = sales.period === 'monthly' ? sales.volume : sales.volume * 30;
      return total + (product.price * monthlyVolume);
    }, 0);

    // Calculate base monthly variable costs (one month's worth)
    const baseMonthlyVariableCosts = products.reduce((total, product) => {
      const sales = productSales[product.id] || { volume: 1, period: 'monthly' };
      const monthlyVolume = sales.period === 'monthly' ? sales.volume : sales.volume * 30;
      const unitCost = product.associatedCosts.reduce((sum, cost) => sum + cost.amount, 0);
      return total + (unitCost * monthlyVolume);
    }, 0);

    // Calculate monthly data with compounding values
    let cumulativeRevenue = 0;
    let cumulativeCosts = 0;

    return months.map(month => {
      // Add this month's revenue to the cumulative total
      cumulativeRevenue += baseMonthlyRevenue;

      // For costs:
      // Month 1: Annual costs (if any) + monthly costs
      // Month 2+: Previous month's costs + monthly costs
      if (month === 1) {
        // Only add annual costs in month 1
        cumulativeCosts = fixedCosts.annual + fixedCosts.monthly + baseMonthlyVariableCosts;
        
        // Log the Month 1 cost calculation details
        console.log('Month 1 Cost Calculation:', {
          annualFixedCosts: fixedCosts.annual,
          monthlyFixedCosts: fixedCosts.monthly,
          baseMonthlyVariableCosts,
          total: cumulativeCosts,
          currency
        });
      } else {
        // Add only monthly costs for subsequent months
        cumulativeCosts += fixedCosts.monthly + baseMonthlyVariableCosts;
      }

      return {
        month: `Month ${month}`,
        revenue: cumulativeRevenue,
        costs: cumulativeCosts,
        profit: cumulativeRevenue - cumulativeCosts
      };
    });
  }, [products, productSales, fixedCosts, currency]);

  // Memoize the CustomTooltip component to prevent unnecessary re-renders
  const CustomTooltip = useMemo(() => {
    const TooltipComponent = ({ active, payload }: CustomTooltipProps) => {
      if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
          <div className="rounded-lg border bg-background p-2 shadow-sm">
            <p className="font-medium text-sm">{data.month}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-2 w-2 rounded-full bg-[hsl(var(--chart-1))]" />
              <p className="text-xs">
                Cumulative Revenue: {formatCurrency(data.revenue, currency)}
              </p>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-2 w-2 rounded-full bg-[hsl(var(--chart-2))]" />
              <p className="text-xs">
                Cumulative Costs: {formatCurrency(data.costs, currency)}
              </p>
            </div>
            <p className={`text-xs font-medium mt-1 ${data.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              Cumulative Profit: {formatCurrency(data.profit, currency)}
            </p>
          </div>
        );
      }
      return null;
    };
    TooltipComponent.displayName = 'CustomTooltip';
    return TooltipComponent;
  }, [currency]);

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis 
            dataKey="month" 
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            style={{ fontSize: '0.75rem' }}
          />
          <YAxis 
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => formatCurrency(value, currency)}
            style={{ fontSize: '0.75rem' }}
          />
          <Tooltip 
            content={CustomTooltip}
            cursor={false}
          />
          <Legend 
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ paddingTop: '20px', fontSize: '0.75rem' }}
          />
          <Line 
            type="monotone"
            dataKey="revenue" 
            name="Cumulative Revenue" 
            stroke="hsl(var(--chart-1))"
            strokeWidth={2}
            dot={false}
          />
          <Line 
            type="monotone"
            dataKey="costs" 
            name="Cumulative Costs" 
            stroke="hsl(var(--chart-2))"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
} 