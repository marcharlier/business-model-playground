'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { TooltipProps } from 'recharts';
import { formatCurrency } from '@/lib/utils/currency';
import type { Currency, ProductSales } from '@/lib/storage/types';
import type { Product } from '@/lib/storage/types';
import { useMemo } from 'react';

interface RevenueBreakdownChartProps {
  products: Product[];
  productSales: Record<string, ProductSales>;
  currency: Currency;
}

type CustomTooltipProps = TooltipProps<number, string>;

export function RevenueBreakdownChart({ 
  products, 
  productSales, 
  currency 
}: RevenueBreakdownChartProps) {
  // Memoize data to prevent unnecessary re-renders
  const data = useMemo(() => {
    return products.map(product => {
      const sales = productSales[product.id] || { volume: 1, period: 'monthly' };
      const monthlyVolume = sales.period === 'monthly' ? sales.volume : sales.volume * 30;
      const costs = product.associatedCosts.reduce((total, cost) => total + cost.amount, 0) * monthlyVolume;
      const profit = product.price * monthlyVolume - costs;
      
      return {
        name: product.name,
        costs,
        profit
      };
    });
  }, [products, productSales]);

  // Memoize the CustomTooltip component to prevent unnecessary re-renders
  const CustomTooltip = useMemo(() => {
    return function CustomTooltipContent({ active, payload }: CustomTooltipProps) {
      if (active && payload && payload.length) {
        const data = payload[0].payload;
        const totalRevenue = data.costs + data.profit;
        return (
          <div className="rounded-lg border bg-background p-2 shadow-sm">
            <p className="font-medium text-sm">{data.name}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Revenue: {formatCurrency(totalRevenue, currency)}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-2 w-2 rounded-full bg-[hsl(var(--chart-2))]" />
              <p className="text-xs">
                Costs: {formatCurrency(data.costs, currency)}
              </p>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-2 w-2 rounded-full bg-[hsl(var(--chart-1))]" />
              <p className="text-xs">
                Profit: {formatCurrency(data.profit, currency)}
              </p>
            </div>
          </div>
        );
      }
      return null;
    };
  }, [currency]);

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
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
            dataKey="name" 
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
          <Bar 
            dataKey="costs" 
            name="Costs" 
            stackId="a"
            fill="hsl(var(--chart-2))"
            radius={[0, 0, 4, 4]}
          />
          <Bar 
            dataKey="profit" 
            name="Profit" 
            stackId="a"
            fill="hsl(var(--chart-1))"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
} 