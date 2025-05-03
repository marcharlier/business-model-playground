'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import type { TooltipProps } from 'recharts';
import { formatCurrency } from '@/lib/utils/currency';
import type { Currency, ProductSales } from '@/lib/storage/types';
import type { Product } from '@/lib/storage/types';
import { useMemo } from 'react';

interface ProfitabilityChartProps {
  products: Product[];
  productSales: Record<string, ProductSales>;
  fixedCosts: number;
  currency: Currency;
}

type CustomTooltipProps = TooltipProps<number, string>;

export function ProfitabilityChart({ 
  products, 
  productSales, 
  fixedCosts,
  currency 
}: ProfitabilityChartProps) {
  // Calculate current revenue and costs
  const data = useMemo(() => {
    const revenue = products.reduce((total, product) => {
      const sales = productSales[product.id] || { volume: 0, period: 'monthly' };
      const monthlyVolume = sales.period === 'monthly' ? sales.volume : sales.volume * 30;
      return total + (product.price * monthlyVolume);
    }, 0);

    const variableCosts = products.reduce((total, product) => {
      const sales = productSales[product.id] || { volume: 0, period: 'monthly' };
      const monthlyVolume = sales.period === 'monthly' ? sales.volume : sales.volume * 30;
      const unitCost = product.associatedCosts.reduce((sum, cost) => sum + cost.amount, 0);
      return total + (unitCost * monthlyVolume);
    }, 0);

    const totalCosts = fixedCosts + variableCosts;
    
    return [{
      name: 'Current Scenario',
      revenue,
      totalCosts,
      profit: revenue - totalCosts
    }];
  }, [products, productSales, fixedCosts]);

  // Calculate Y-axis domain to ensure costs line is visible
  const yAxisDomain = useMemo(() => {
    const maxValue = Math.max(data[0].revenue, data[0].totalCosts);
    // Add 20% padding to the top of the domain and round to nearest whole number
    const paddedMax = Math.ceil(maxValue * 1.2);
    return [0, paddedMax];
  }, [data]);

  // Memoize the CustomTooltip component to prevent unnecessary re-renders
  const CustomTooltip = useMemo(() => {
    const TooltipComponent = ({ active, payload }: CustomTooltipProps) => {
      if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
          <div className="rounded-lg border bg-background p-2 shadow-sm">
            <p className="font-medium text-sm">{data.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-2 w-2 rounded-full bg-[hsl(var(--chart-1))]" />
              <p className="text-xs">
                Revenue: {formatCurrency(data.revenue, currency)}
              </p>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-2 w-2 rounded-full bg-[hsl(var(--chart-2))]" />
              <p className="text-xs">
                Total Costs: {formatCurrency(data.totalCosts, currency)}
              </p>
            </div>
            <p className={`text-xs font-medium mt-1 ${data.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              Profit: {formatCurrency(data.profit, currency)}
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
            tickFormatter={(value) => {
              // Hide the top domain value
              if (value === yAxisDomain[1]) return '';
              return formatCurrency(value, currency);
            }}
            style={{ fontSize: '0.75rem' }}
            domain={yAxisDomain}
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
            dataKey="revenue" 
            name="Revenue" 
            fill="hsl(var(--chart-1))"
            radius={[4, 4, 0, 0]}
          />
          <ReferenceLine 
            y={data[0].totalCosts} 
            stroke="hsl(var(--destructive))" 
            strokeDasharray="3 3" 
            label={{ 
              value: 'Total Costs', 
              position: 'inside', 
              fill: 'hsl(var(--destructive))',
              fontSize: 10
            }} 
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
} 