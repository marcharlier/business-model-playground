'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Label } from 'recharts';
import { formatCurrency } from '@/lib/utils/currency';
import type { Currency } from '@/lib/storage/types';

interface CostBreakdownChartProps {
  fixedCosts: number;
  variableCosts: number;
  currency: Currency;
}

// Using theme chart colors that work in both light and dark modes
const COLORS = [
  'hsl(var(--chart-1))', // Primary for operating costs
  'hsl(var(--chart-2))', // Secondary for COGS
];

export function CostBreakdownChart({ fixedCosts, variableCosts, currency }: CostBreakdownChartProps) {
  const data = [
    { name: 'Operating Costs', value: fixedCosts, id: 'operating', color: COLORS[0] },
    { name: 'COGS', value: variableCosts, id: 'cogs', color: COLORS[1] },
  ];

  const totalCosts = fixedCosts + variableCosts;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={90}
          outerRadius={110}
          paddingAngle={1}
          dataKey="value"
          stroke="none"
        >
          {data.map((entry) => (
            <Cell key={entry.id} fill={entry.color} />
          ))}
          <Label
            content={() => (
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                <tspan
                  x="50%"
                  y="45%"
                  className="fill-foreground text-2xl font-bold"
                >
                  {formatCurrency(totalCosts, currency)}
                </tspan>
                <tspan
                  x="50%"
                  y="55%"
                  className="fill-muted-foreground text-xs"
                >
                   Total Running Costs
                </tspan>
              </text>
            )}
          />
        </Pie>
        <Tooltip 
          content={({ active, payload }) => {
            if (active && payload && payload.length && typeof payload[0].value === 'number') {
              const entry = data.find(d => d.name === payload[0].name);
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="h-2 w-2 rounded-full" 
                      style={{ backgroundColor: entry?.color }}
                    />
                    <p className="font-medium text-sm">{payload[0].name}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatCurrency(payload[0].value, currency)}
                  </p>
                </div>
              );
            }
            return null;
          }}
          cursor={false}
        />
      </PieChart>
    </ResponsiveContainer>
  );
} 