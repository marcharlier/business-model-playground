'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Settings2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';
import { formatProfitMargin } from '@/lib/utils/financial';
import { calculateProductTotalCost } from '@/lib/utils/financial';
import type { Product, Currency, ProductSales, Project } from '@/lib/storage/types';
import { CardTitle } from '@/components/ui/card';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { ProductPriceControl } from '@/components/products/controls/ProductPriceControl';
import { ProductSalesControl } from '@/components/products/controls/ProductSalesControl';

interface ProductControlsProps {
  products: Product[];
  productSales: Record<string, ProductSales>;
  currency: Currency;
  onSalesVolumeChange: (productId: string, value: number) => void;
  onSalesPeriodChange: (productId: string, period: 'monthly' | 'daily') => void;
  onPriceChange: (productId: string, value: string) => void;
  totalMonthlyFixedCosts: number;
  project: Project;
}

interface ProductControlFormProps {
  product: Product;
  sales: ProductSales;
  currency: Currency;
  onPriceChange: (productId: string, value: string) => void;
  onSalesVolumeChange: (productId: string, value: number) => void;
  onSalesPeriodChange: (productId: string, period: 'monthly' | 'daily') => void;
  calculateBreakEven: (product: Product, period: 'monthly' | 'daily') => number;
  upfrontRecoupText?: string;
}

function ProductControlForm({
  product,
  sales,
  currency,
  onPriceChange,
  onSalesVolumeChange,
  onSalesPeriodChange,
  calculateBreakEven,
  upfrontRecoupText
}: ProductControlFormProps) {
  // Derive input value from product.price - no need for separate state sync
  const inputValue = product.price === 0 ? '' : product.price.toString();

  const handlePriceChange = useCallback(
    (nextValue: string) => {
      onPriceChange(product.id, nextValue);
    },
    [onPriceChange, product.id]
  );

  return (
    <div className="space-y-4">
      <ProductPriceControl
        id={`price-${product.id}`}
        currency={currency}
        label="Change price"
        value={inputValue}
        onChange={handlePriceChange}
      />

      <ProductSalesControl
        id={`sales-${product.id}`}
        label="Expected sales"
        sales={sales}
        onVolumeChange={(value) => onSalesVolumeChange(product.id, value)}
        onPeriodChange={(period) => onSalesPeriodChange(product.id, period)}
      />

      <div className="text-sm p-2 bg-muted rounded">
        <p className="font-medium">Break-Even Analysis</p>
        <p>
          {calculateBreakEven(product, sales.period) === Number.POSITIVE_INFINITY 
            ? "Cannot break even at current price (price is less than or equal to variable cost)" 
            : `Selling ${calculateBreakEven(product, sales.period)} units ${sales.period === 'monthly' ? 'per month' : 'per day'} would cover monthly operating costs (excludes up-front)`}
        </p>
        {upfrontRecoupText ? <p>{upfrontRecoupText}</p> : null}
      </div>
    </div>
  );
}

export function ProductControls({
  products,
  productSales,
  currency,
  onSalesVolumeChange,
  onSalesPeriodChange,
  onPriceChange,
  totalMonthlyFixedCosts,
  project
}: ProductControlsProps) {
  const [openDrawerId, setOpenDrawerId] = useState<string | null>(null);

  // Calculate break-even point for each product
  const calculateBreakEven = (product: Product, period: 'monthly' | 'daily') => {
    const variableCost = calculateProductTotalCost(product);
    if (product.price <= variableCost) return Number.POSITIVE_INFINITY;
    
    const breakEvenPoint = Math.ceil(totalMonthlyFixedCosts / (product.price - variableCost));
    return period === 'daily' ? Math.ceil(breakEvenPoint / 30) : breakEvenPoint;
  };

  // Calculate average product margin
  const calculateAverageMargin = () => {
    if (products.length === 0) return 0;
    
    const totalMargin = products.reduce((sum, product) => {
      const revenue = product.price * (productSales[product.id]?.volume || 1);
      const costs = calculateProductTotalCost(product) * (productSales[product.id]?.volume || 1);
      const profit = revenue - costs;
      return sum + (revenue > 0 ? (profit / revenue) * 100 : 0);
    }, 0);
    
    return totalMargin / products.length;
  };

  const averageMargin = calculateAverageMargin();
  const getMarginStatus = () => {
    // Calculate total monthly fixed costs (monthly + annual amortized)
    const totalMonthlyFixedCosts = project.costStructure.fixedRunningCosts.reduce((total: number, cost: { frequency: string; amount: number }) => {
      const monthlyAmount = cost.frequency === 'annual' ? cost.amount / 12 : cost.amount;
      return total + monthlyAmount;
    }, 0);

    // Calculate total monthly revenue
    const totalMonthlyRevenue = products.reduce((total: number, product: Product) => {
      const sales = productSales[product.id] || { volume: 1, period: 'monthly' };
      const monthlyVolume = sales.period === 'monthly' ? sales.volume : sales.volume * 30;
      return total + (product.price * monthlyVolume);
    }, 0);

    // Calculate total monthly variable costs
    const totalMonthlyVariableCosts = products.reduce((total: number, product: Product) => {
      const productCost = calculateProductTotalCost(product);
      const sales = productSales[product.id] || { volume: 1, period: 'monthly' };
      const monthlyVolume = sales.period === 'monthly' ? sales.volume : sales.volume * 30;
      return total + (productCost * monthlyVolume);
    }, 0);

    // Calculate total monthly profit
    const totalMonthlyProfit = totalMonthlyRevenue - totalMonthlyFixedCosts - totalMonthlyVariableCosts;

    if (averageMargin < 0) {
      return { 
        text: "Products are currently unprofitable.", 
        color: "text-red-600" 
      };
    }

    if (averageMargin < 20) {
      return { 
        text: "Product margins are tight (Below 20%).", 
        color: "text-yellow-600" 
      };
    }

    if (totalMonthlyProfit < 0) {
      return { 
        text: "Product margins are healthy (Average above 20%) but business is unprofitable due to high fixed costs or low sales volume.", 
        color: "text-yellow-600" 
      };
    }

    return { 
      text: "Product margins are healthy (Average above 20%).", 
      color: "text-green-600" 
    };
  };

  const marginStatus = getMarginStatus();

  // Compute upfront recoup text at the scenario level
  const upfrontTotals = {
    upfront: (project.costStructure.upfrontCosts || []).reduce((sum, c) => sum + c.amount, 0),
    monthlyFixed: project.costStructure.fixedRunningCosts.reduce((sum, cost) => sum + (cost.frequency === 'annual' ? cost.amount / 12 : cost.amount), 0),
  };

  const totalMonthlyRevenueAll = products.reduce((total, product) => {
    const sales = productSales[product.id] || { volume: 0, period: 'monthly' };
    const monthlyVolume = sales.period === 'monthly' ? sales.volume : sales.volume * 30;
    return total + product.price * monthlyVolume;
  }, 0);

  const totalMonthlyVariableAll = products.reduce((total, product) => {
    const sales = productSales[product.id] || { volume: 0, period: 'monthly' };
    const monthlyVolume = sales.period === 'monthly' ? sales.volume : sales.volume * 30;
    const unitCost = calculateProductTotalCost(product);
    return total + unitCost * monthlyVolume;
  }, 0);

  const monthlyProfitAll = totalMonthlyRevenueAll - upfrontTotals.monthlyFixed - totalMonthlyVariableAll;
  let upfrontRecoupText: string | undefined;
  if (upfrontTotals.upfront > 0) {
    if (monthlyProfitAll <= 0) {
      upfrontRecoupText = `At current scenario, up-front costs of ${formatCurrency(upfrontTotals.upfront, currency)} would not be recouped.`;
    } else {
      const months = Math.ceil(upfrontTotals.upfront / monthlyProfitAll);
      upfrontRecoupText = `Up-front costs of ${formatCurrency(upfrontTotals.upfront, currency)} would be recouped in ~${months} months.`;
    }
  }

  const renderProductCard = (product: Product, sales: ProductSales) => {
    const revenue = product.price * sales.volume;
    const costs = calculateProductTotalCost(product) * sales.volume;
    const profit = revenue - costs;
    const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

    return (
      <div key={product.id} className="border rounded p-3 hover:bg-muted/50 transition-colors duration-200">
        <Drawer repositionInputs={false} open={openDrawerId === product.id} onOpenChange={(open) => setOpenDrawerId(open ? product.id : null)}>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">{product.name}</p>
              <p className="text-sm text-muted-foreground">
                {product.price === 0 ? 'Free' : formatCurrency(product.price, currency)} • {sales.volume} {sales.period === 'monthly' ? 'monthly' : 'daily'} sales • {formatProfitMargin(profitMargin)} margin
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="hidden md:flex"
                  >
                    <Settings2 className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <ProductControlForm
                    product={product}
                    sales={sales}
                    currency={currency}
                    onPriceChange={onPriceChange}
                    onSalesVolumeChange={onSalesVolumeChange}
                    onSalesPeriodChange={onSalesPeriodChange}
                    calculateBreakEven={calculateBreakEven}
                    upfrontRecoupText={upfrontRecoupText}
                  />
                </PopoverContent>
              </Popover>
              <DrawerTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="md:hidden"
                >
                  <Settings2 className="h-4 w-4" />
                </Button>
              </DrawerTrigger>
            </div>
          </div>
          <DrawerContent>
            <div className="mx-auto w-full max-w-sm">
              <DrawerHeader>
                <DrawerTitle>{product.name}</DrawerTitle>
                <DrawerDescription>Change price and sales estimates</DrawerDescription>
              </DrawerHeader>
              <div className="p-4">
                <ProductControlForm
                  product={product}
                  sales={sales}
                  currency={currency}
                  onPriceChange={onPriceChange}
                  onSalesVolumeChange={onSalesVolumeChange}
                  onSalesPeriodChange={onSalesPeriodChange}
                  calculateBreakEven={calculateBreakEven}
                />
              </div>
              <div className="p-4 border-t">
                <Button
                  className="w-full h-12 text-base"
                  onClick={() => {
                    setOpenDrawerId(null);
                  }}
                >
                  Done
                </Button>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    );
  };

  if (products.length === 0) {
    return (
      <div>
        <div className="flex flex-row items-center justify-between mb-4">
          <CardTitle>Product pricing and sales</CardTitle>
        </div>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">No products or services added yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-row items-center justify-between mb-2">
        <CardTitle>Product pricing and sales</CardTitle>
      </div>
      <p className={`text-sm mb-4 ${marginStatus.color}`}>{marginStatus.text}</p>
      {products.length === 0 ? (
        <p className="text-muted-foreground">No products or services added yet.</p>
      ) : (
        <div className="space-y-4">
          {products.map(product => {
            const sales = productSales[product.id] || { volume: 1, period: 'monthly' };
            return renderProductCard(product, sales);
          })}
        </div>
      )}
    </div>
  );
} 