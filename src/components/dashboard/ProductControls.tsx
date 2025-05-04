'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Pencil, Plus, Minus } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';
import { formatProfitMargin } from '@/lib/utils/financial';
import { calculateProductTotalCost } from '@/lib/utils/financial';
import type { Product, Currency, ProductSales } from '@/lib/storage/types';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import React from 'react';

interface ProductControlsProps {
  products: Product[];
  productSales: Record<string, ProductSales>;
  currency: Currency;
  onSalesVolumeChange: (productId: string, value: number) => void;
  onSalesPeriodChange: (productId: string, period: 'monthly' | 'daily') => void;
  onPriceChange: (productId: string, value: string) => void;
  totalMonthlyFixedCosts: number;
}

export function ProductControls({
  products,
  productSales,
  currency,
  onSalesVolumeChange,
  onSalesPeriodChange,
  onPriceChange,
  totalMonthlyFixedCosts
}: ProductControlsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [openDrawerId, setOpenDrawerId] = useState<string | null>(null);

  useEffect(() => {
    // Small delay to ensure the initial state is set before showing the controls
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  // Calculate break-even point for each product
  const calculateBreakEven = (product: Product, period: 'monthly' | 'daily') => {
    const variableCost = calculateProductTotalCost(product);
    if (product.price <= variableCost) return Number.POSITIVE_INFINITY; // Can't break even if price is less than or equal to variable cost
    
    // Break-even formula: Fixed Costs / (Price - Variable Cost)
    // We allocate all fixed costs to this product for the break-even calculation
    const breakEvenPoint = Math.ceil(totalMonthlyFixedCosts / (product.price - variableCost));
    
    // If daily, convert to daily break-even point
    return period === 'daily' ? Math.ceil(breakEvenPoint / 30) : breakEvenPoint;
  };

  const renderProductCard = (product: Product, sales: ProductSales) => {
    const revenue = product.price * sales.volume;
    const costs = calculateProductTotalCost(product) * sales.volume;
    const profit = revenue - costs;
    const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;
    const breakEvenPoint = calculateBreakEven(product, sales.period);

    return (
      <div key={product.id} className="border rounded p-3 space-y-2">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium">{product.name}</p>
          </div>
          <div className="text-right">
            <p>{formatCurrency(product.price, currency)}</p>
            <p className="text-sm text-muted-foreground">
              {formatCurrency(
                product.associatedCosts.reduce((total, cost) => total + cost.amount, 0),
                currency
              )} total costs • {formatProfitMargin(profitMargin)} margin
            </p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <Label htmlFor={`sales-${product.id}`} className="text-xs">
              {sales.period === 'monthly' ? 'Monthly' : 'Daily'} Sales
            </Label>
            <div className="text-center">
              <Label htmlFor={`period-${product.id}`} className="text-xs hidden">Frequency</Label>
            </div>
            <Label htmlFor={`price-${product.id}`} className="text-xs">Price</Label>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <Input
              id={`sales-${product.id}`}
              type="number"
              min="0"
              step="1"
              value={sales.volume === 0 ? '' : sales.volume}
              placeholder="0"
              onChange={(e) => {
                const value = e.target.value === '' ? 0 : Number.parseInt(e.target.value);
                onSalesVolumeChange(product.id, value);
              }}
              className="h-8 text-sm"
            />
            
            <div className="flex items-center space-x-2">
              <span className="text-xs">Daily</span>
              <Switch
                id={`period-${product.id}`}
                checked={sales.period === 'monthly'}
                onCheckedChange={(checked: boolean) => onSalesPeriodChange(product.id, checked ? 'monthly' : 'daily')}
              />
              <span className="text-xs">Monthly</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <span className="text-xs">{currency === 'GBP' ? '£' : currency === 'USD' ? '$' : '€'}</span>
              <Input
                id={`price-${product.id}`}
                type="number"
                min="0"
                step="0.01"
                value={product.price}
                onChange={(e) => onPriceChange(product.id, e.target.value)}
                className="h-8 text-sm"
              />
            </div>
          </div>
        </div>
        
        <div className="text-xs p-1.5 bg-muted rounded">
          <p className="font-medium">Break-Even Analysis</p>
          <p>
            {breakEvenPoint === Number.POSITIVE_INFINITY 
              ? "Cannot break even at current price (price is less than or equal to variable cost)" 
              : `Selling ${breakEvenPoint} units ${sales.period === 'monthly' ? 'per month' : 'per day'} would cover fixed costs`}
          </p>
        </div>
      </div>
    );
  };

  const renderMobileProductCard = (product: Product, sales: ProductSales) => {
    return (
      <div key={product.id} className="border rounded p-3">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium">{product.name}</p>
            <p className="text-sm text-muted-foreground">
              {formatCurrency(product.price, currency)} • {sales.volume} {sales.period === 'monthly' ? 'monthly' : 'daily'} sales
            </p>
          </div>
          <Drawer open={openDrawerId === product.id} onOpenChange={(open) => setOpenDrawerId(open ? product.id : null)}>
            <DrawerTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => {
                  setOpenDrawerId(product.id);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Edit {product.name}</DrawerTitle>
              </DrawerHeader>
              <div className="p-4 space-y-4">
                {/* Mobile-optimized controls */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor={`mobile-price-${product.id}`} className="text-sm">Price</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10"
                        onClick={() => onPriceChange(product.id, (product.price - 0.1).toFixed(1))}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <div className="flex-1 flex items-center space-x-1">
                        <span className="text-sm">{currency === 'GBP' ? '£' : currency === 'USD' ? '$' : '€'}</span>
                        <Input
                          id={`mobile-price-${product.id}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={product.price}
                          onChange={(e) => onPriceChange(product.id, e.target.value)}
                          className="h-10 text-base"
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10"
                        onClick={() => onPriceChange(product.id, (product.price + 0.1).toFixed(1))}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <Label htmlFor={`mobile-sales-${product.id}`} className="text-sm">
                        {sales.period === 'monthly' ? 'Monthly' : 'Daily'} Sales
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10"
                        onClick={() => onSalesVolumeChange(product.id, Math.max(0, sales.volume - 1))}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        id={`mobile-sales-${product.id}`}
                        type="number"
                        min="0"
                        step="1"
                        value={sales.volume === 0 ? '' : sales.volume}
                        placeholder="0"
                        onChange={(e) => {
                          const value = e.target.value === '' ? 0 : Number.parseInt(e.target.value);
                          onSalesVolumeChange(product.id, value);
                        }}
                        className="h-10 text-base flex-1"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10"
                        onClick={() => onSalesVolumeChange(product.id, sales.volume + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <div className="flex items-center space-x-2 ml-2">
                        <span className="text-sm">Daily</span>
                        <Switch
                          id={`mobile-period-${product.id}`}
                          checked={sales.period === 'monthly'}
                          onCheckedChange={(checked: boolean) => onSalesPeriodChange(product.id, checked ? 'monthly' : 'daily')}
                          className="h-6 w-11"
                        />
                        <span className="text-sm">Monthly</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-sm p-2 bg-muted rounded">
                    <p className="font-medium">Break-Even Analysis</p>
                    <p>
                      {calculateBreakEven(product, sales.period) === Number.POSITIVE_INFINITY 
                        ? "Cannot break even at current price (price is less than or equal to variable cost)" 
                        : `Selling ${calculateBreakEven(product, sales.period)} units ${sales.period === 'monthly' ? 'per month' : 'per day'} would cover fixed costs`}
                    </p>
                  </div>
                </div>
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
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-20" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {products.map(product => (
              <div key={product.id} className="border rounded p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-20 mb-1" />
                    <Skeleton className="h-4 w-12 mb-1" />
                  </div>
                  <Skeleton className="h-8 w-full" />
                </div>
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Product sales controls</CardTitle>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <p className="text-muted-foreground">No products or services added yet.</p>
        ) : (
          <div className="space-y-4">
            {products.map(product => {
              const sales = productSales[product.id] || { volume: 1, period: 'monthly' };
              return (
                <React.Fragment key={product.id}>
                  {/* Mobile View */}
                  <div className="sm:hidden">
                    {renderMobileProductCard(product, sales)}
                  </div>
                  {/* Desktop View */}
                  <div className="hidden sm:block">
                    {renderProductCard(product, sales)}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 