'use client';

import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceDot } from 'recharts';
import type { TooltipProps } from 'recharts';
import { formatCurrency } from '@/lib/utils/currency';
import type { Currency, ProductSales } from '@/lib/storage/types';
import type { Product } from '@/lib/storage/types';
import { useMemo } from 'react';

interface MonthlyProjectionChartProps {
  products: Product[];
  productSales: Record<string, ProductSales>;
  fixedCosts: { monthly: number; annual: number; upfront: number };
  currency: Currency;
  lengthMonths?: number;
}

type CustomTooltipProps = TooltipProps<number, string>;

export function MonthlyProjectionChart({ 
  products, 
  productSales, 
  fixedCosts,
  currency,
  lengthMonths = 12
}: MonthlyProjectionChartProps) {
  // Calculate monthly data for 12 months
  const { data, firstProfitLabel, firstProfitRevenue } = useMemo(() => {
    const months = Array.from({ length: lengthMonths }, (_, i) => i + 1);
    
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

    // Calculate monthly data with compounding values (stacked cumulative costs)
    let cumulativeRevenue = 0;
    let cumulativeUpfront = 0;
    let cumulativeOperating = 0;
    let cumulativeCogs = 0;
    let firstProfitLabel: string | undefined;
    let firstProfitRevenue: number | undefined;

    const points = months.map(month => {
      // Add this month's revenue to the cumulative total
      cumulativeRevenue += baseMonthlyRevenue;

      // Build cumulative costs stacks
      if (month === 1) {
        // First month: add upfront costs once
        cumulativeUpfront = fixedCosts.upfront;
      }
      
      // Add annual costs at the start of each year (month 1, 13, 25, etc.)
      const isStartOfYear = (month - 1) % 12 === 0;
      if (isStartOfYear) {
        cumulativeOperating += fixedCosts.annual;
      }
      
      // Add monthly operating costs and COGS every month
      cumulativeOperating += fixedCosts.monthly;
      cumulativeCogs += baseMonthlyVariableCosts;

      const totalCosts = cumulativeUpfront + cumulativeOperating + cumulativeCogs;
      const profit = cumulativeRevenue - totalCosts;
      if (!firstProfitLabel && cumulativeRevenue >= totalCosts) {
        firstProfitLabel = `Month ${month}`;
        firstProfitRevenue = cumulativeRevenue;
      }

      return {
        month: `Month ${month}`,
        revenue: cumulativeRevenue,
        upfront: cumulativeUpfront,
        operating: cumulativeOperating,
        cogs: cumulativeCogs,
        totalCosts,
        profit
      };
    });
    return { data: points, firstProfitLabel, firstProfitRevenue };
  }, [products, productSales, fixedCosts, lengthMonths]);

  // Memoize the CustomTooltip component to prevent unnecessary re-renders
  const CustomTooltip = useMemo(() => {
    const TooltipComponent = ({ active, payload }: CustomTooltipProps) => {
      if (active && payload && payload.length) {
        const data = payload[0].payload as {
          month: string;
          revenue: number;
          upfront: number;
          operating: number;
          cogs: number;
          totalCosts: number;
          profit: number;
        };
        return (
          <div className="rounded-lg border bg-background p-2 shadow-sm">
            <p className="font-medium text-sm">{data.month}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-2 w-2 rounded-full bg-[hsl(var(--chart-1))]" />
              <p className="text-xs">Cumulative Revenue: {formatCurrency(data.revenue, currency)}</p>
            </div>
            <div className="mt-1">
              <p className="text-xs font-medium">Cumulative Costs</p>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="h-2 w-2 rounded-full" style={{ background: 'hsl(var(--destructive) / 0.15)' }} />
                <p className="text-xs">Up front: {formatCurrency(data.upfront, currency)}</p>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="h-2 w-2 rounded-full" style={{ background: 'hsl(var(--destructive) / 0.30)' }} />
                <p className="text-xs">Operating: {formatCurrency(data.operating, currency)}</p>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="h-2 w-2 rounded-full" style={{ background: 'hsl(var(--destructive) / 0.50)' }} />
                <p className="text-xs">COGS: {formatCurrency(data.cogs, currency)}</p>
              </div>
              <p className="text-xs mt-1">Total Costs: {formatCurrency(data.totalCosts, currency)}</p>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-2 w-2 rounded-full bg-[hsl(var(--chart-2))]" />
              <p className={`text-xs font-medium ${data.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>Cumulative Profit: {formatCurrency(data.profit, currency)}</p>
            </div>
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
        <ComposedChart
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
          <Area type="monotone" dataKey="upfront" name="Up front (cumulative)" stackId="1" stroke="none" fill="hsl(var(--destructive))" fillOpacity={0.15} />
          <Area type="monotone" dataKey="operating" name="Operating (cumulative)" stackId="1" stroke="none" fill="hsl(var(--destructive))" fillOpacity={0.3} />
          <Area type="monotone" dataKey="cogs" name="COGS (cumulative)" stackId="1" stroke="none" fill="hsl(var(--destructive))" fillOpacity={0.5} />
          <Line 
            type="monotone"
            dataKey="revenue" 
            name="Cumulative Revenue" 
            stroke="hsl(var(--chart-1))"
            strokeWidth={2}
            dot={false}
          />
          {firstProfitLabel && firstProfitRevenue !== undefined ? (
            <ReferenceDot x={firstProfitLabel} y={firstProfitRevenue} r={5} fill="hsl(var(--chart-1))" stroke="hsl(var(--chart-1))" />
          ) : null}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
} 