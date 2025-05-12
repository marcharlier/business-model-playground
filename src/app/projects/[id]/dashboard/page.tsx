'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useProject } from '@/lib/context/ProjectContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CostBreakdownChart } from '@/components/dashboard/CostBreakdownChart';
import { RevenueBreakdownChart } from '@/components/dashboard/RevenueBreakdownChart';
import { ProfitabilityChart } from '@/components/dashboard/ProfitabilityChart';
import { MonthlyProjectionChart } from '@/components/dashboard/MonthlyProjectionChart';
import { ProductControls } from '@/components/dashboard/ProductControls';
import { BusinessStatusSummary } from '@/components/dashboard/BusinessStatusSummary';
import { formatCurrency } from '@/lib/utils/currency';
import { formatProfitMargin } from '@/lib/utils/financial';
import { calculateProductTotalCost } from '@/lib/utils/financial';
import type { Product, ProductSales } from '@/lib/storage/types';
import { projectStorage } from '@/lib/storage/projectStorage';
import { productStorage } from '@/lib/storage/productStorage';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { Separator } from '@/components/ui/separator';
export default function DashboardPage() {
  const { id } = useParams();
  const { project, refreshProject } = useProject();
  const [productSales, setProductSales] = useState<Record<string, ProductSales>>({});
  const [initialized, setInitialized] = useState(false);

  // Load project data when component mounts or id changes
  useEffect(() => {
    if (id) {
      refreshProject();
    }
  }, [id, refreshProject]);

  // Initialize product sales when project is loaded or changes
  useEffect(() => {
    if (project) {
      // Initialize product sales from project data or defaults
      const initialSales: Record<string, ProductSales> = {};
      
      for (const product of project.products) {
        // Use stored values if available, otherwise default to 1 unit monthly
        initialSales[product.id] = project.productSales?.[product.id] || {
          volume: 1,
          period: 'monthly'
        };
      }
      
      // Only update if we have products to initialize
      if (project.products.length > 0) {
        setProductSales(initialSales);
      }
      setInitialized(true);
    }
  }, [project]);

  // Save sales volumes to localStorage when they change
  useEffect(() => {
    if (project && initialized && Object.keys(productSales).length > 0) {
      const updatedProject = {
        ...project,
        productSales
      };
      projectStorage.updateProject(updatedProject);
    }
  }, [productSales, project, initialized]);

  // Memoize handlers to prevent unnecessary re-renders
  const handleSalesVolumeChange = useCallback((productId: string, value: number) => {
    setProductSales(prev => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || { period: 'monthly' }), // Preserve period or default to monthly
        volume: value
      }
    }));
  }, []);

  const handleSalesPeriodChange = useCallback((productId: string, period: 'monthly' | 'daily') => {
    setProductSales(prev => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || { volume: 0 }), // Preserve volume or default to 0
        period
      }
    }));
  }, []);

  const handlePriceChange = useCallback((productId: string, value: string) => {
    if (!project) return;
    
    const numericValue = Number.parseFloat(value);
    if (!Number.isNaN(numericValue) && numericValue >= 0) {
      // Find the product to update
      const productToUpdate = project.products.find(p => p.id === productId);
      if (!productToUpdate) return;

      // Update the product with the new price
      const updatedProduct: Product = {
        ...productToUpdate,
        price: numericValue
      };

      // Update the product in storage
      productStorage.updateProduct(updatedProduct, project.id);

      // Refresh the project to get the updated data
      refreshProject();
    }
  }, [project, refreshProject]);

  if (!project) {
    return <div>Loading...</div>;
  }

  // Check if there are any products or fixed costs
  const hasProducts = project.products.length > 0;
  const hasFixedCosts = project.fixedCosts.length > 0;
  const hasData = hasProducts || hasFixedCosts;

  // Calculate total monthly fixed costs
  const totalMonthlyFixedCosts = project.fixedCosts.reduce((total, cost) => {
    const monthlyAmount = cost.frequency === 'monthly' 
      ? cost.amount 
      : cost.frequency === 'annual' 
        ? cost.amount / 12 
        : cost.amount * 12;
    return total + monthlyAmount;
  }, 0);

  // Calculate total annual fixed costs
  const totalAnnualFixedCosts = project.fixedCosts.reduce((total, cost) => {
    // Only include costs that are specifically marked as annual
    if (cost.frequency === 'annual') {
      return total + cost.amount;
    }
    return total;
  }, 0);

  // Calculate total monthly variable costs
  const totalMonthlyVariableCosts = project.products.reduce((total, product) => {
    const productCost = calculateProductTotalCost(product);
    const sales = productSales[product.id] || { volume: 1, period: 'monthly' };
    const monthlyVolume = sales.period === 'monthly' ? sales.volume : sales.volume * 30;
    return total + (productCost * monthlyVolume);
  }, 0);

  // Calculate total monthly revenue
  const totalMonthlyRevenue = project.products.reduce((total, product) => {
    const sales = productSales[product.id] || { volume: 1, period: 'monthly' };
    const monthlyVolume = sales.period === 'monthly' ? sales.volume : sales.volume * 30;
    return total + (product.price * monthlyVolume);
  }, 0);

  // Calculate total monthly profit
  const totalMonthlyProfit = totalMonthlyRevenue - totalMonthlyFixedCosts - totalMonthlyVariableCosts;

  // Calculate profit margin
  const profitMargin = totalMonthlyRevenue > 0 
    ? (totalMonthlyProfit / totalMonthlyRevenue) * 100 
    : 0;

  // If there's no data, show the empty state
  if (!hasData) {
    return (
      <div>
        <OnboardingProgress 
          hasCosts={project.fixedCosts.length > 0}
          hasProducts={project.products.length > 0}
          projectId={project.id}
          currentPage="dashboard"
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Metrics and Charts */}
          <div className="space-y-6">
            {/* Financial Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="lg:text-2xl text-lg font-bold">{formatCurrency(0, project.currency)}</p>
                  <p className="text-sm text-muted-foreground">Monthly</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Costs</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="lg:text-2xl text-lg font-bold">{formatCurrency(0, project.currency)}</p>
                  <p className="text-sm text-muted-foreground">Monthly</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Profit</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="lg:text-2xl text-lg font-bold">{formatCurrency(0, project.currency)}</p>
                  <p className="text-sm text-muted-foreground">Monthly</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Margin</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="lg:text-2xl text-lg font-bold">0%</p>
                  <p className="text-sm text-muted-foreground">Monthly</p>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Right Column - Product Controls */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Product Controls</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No products added yet
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <OnboardingProgress 
        hasCosts={project.fixedCosts.length > 0}
        hasProducts={project.products.length > 0}
        projectId={project.id}
        currentPage="dashboard"
      />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 auto-rows-min">
        {/* Financial Summary Cards */}
        <div className="grid grid-cols-2 gap-6 order-1 lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="lg:text-2xl text-lg font-bold">{formatCurrency(totalMonthlyRevenue, project.currency)}</p>
              <p className="text-sm text-muted-foreground">Monthly</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Costs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="lg:text-2xl text-lg font-bold">{formatCurrency(totalMonthlyFixedCosts + totalMonthlyVariableCosts, project.currency)}</p>
              <p className="text-sm text-muted-foreground">Monthly</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`lg:text-2xl text-lg font-bold ${totalMonthlyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totalMonthlyProfit, project.currency)}
              </p>
              <p className="text-sm text-muted-foreground">Monthly</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Margin</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`lg:text-2xl text-lg font-bold ${profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatProfitMargin(profitMargin)}
              </p>
              <p className="text-sm text-muted-foreground">Monthly</p>
            </CardContent>
          </Card>
        </div>

        {/* Business Overview Card */}
        <Card className="bg-muted/50 order-2 lg:col-span-2 gap-2">
          <CardHeader className="pb-2">
            <BusinessStatusSummary 
              project={project}
              productSales={productSales}
              showTitle={true}
            />
          </CardHeader>
          <CardContent className="space-y-6 px-0">
            <Separator />
            {/* Product Controls */}
            <div className="px-6">
              <ProductControls 
                products={project.products}
                productSales={productSales}
                currency={project.currency}
                onSalesVolumeChange={handleSalesVolumeChange}
                onSalesPeriodChange={handleSalesPeriodChange}
                onPriceChange={handlePriceChange}
                totalMonthlyFixedCosts={totalMonthlyFixedCosts}
                project={project}
              />
            </div>
            <Separator />
            {/* Costs Summary */}
            <div className="space-y-2 px-6">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Fixed costs</h3>
                <Link 
                  href={`/projects/${project.id}/fixed-costs`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Edit costs
                </Link>
              </div>
              <div className="text-sm text-muted-foreground">
                {totalMonthlyFixedCosts > totalMonthlyRevenue * 0.5 ? (
                  <p className="text-red-600">
                    Fixed costs ({formatCurrency(totalMonthlyFixedCosts, project.currency)}) are high ({Math.round((totalMonthlyFixedCosts / totalMonthlyRevenue) * 100)}% of revenue). Consider reducing costs or increasing sales.
                  </p>
                ) : totalMonthlyFixedCosts > totalMonthlyRevenue * 0.3 ? (
                  <p className="text-yellow-600">
                    Fixed costs ({formatCurrency(totalMonthlyFixedCosts, project.currency)}) are moderate ({Math.round((totalMonthlyFixedCosts / totalMonthlyRevenue) * 100)}% of revenue). Monitor their impact on profitability.
                  </p>
                ) : (
                  <p className="text-green-600">
                    Fixed costs ({formatCurrency(totalMonthlyFixedCosts, project.currency)}) are well managed ({Math.round((totalMonthlyFixedCosts / totalMonthlyRevenue) * 100)}% of revenue).
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Costs Chart */}
        <Card className="order-3 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle>Business costs</CardTitle>
            <CardDescription>Monthly fixed and variable costs</CardDescription>
          </CardHeader>
          <CardContent>
            <CostBreakdownChart 
              fixedCosts={totalMonthlyFixedCosts}
              variableCosts={totalMonthlyVariableCosts}
              currency={project.currency}
            />
          </CardContent>
        </Card>

        {/* Profit Threshold Chart */}
        <Card className="order-4 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle>Profit threshold</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfitabilityChart 
              products={project.products}
              productSales={productSales}
              fixedCosts={totalMonthlyFixedCosts}
              currency={project.currency}
            />
          </CardContent>
        </Card>

        {/* Revenue Breakdown Chart */}
        <Card className="order-5 lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>Revenue by product</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueBreakdownChart 
              products={project.products}
              productSales={productSales}
              currency={project.currency}
            />
          </CardContent>
        </Card>

        {/* Monthly Projection Chart */}
        <Card className="order-6 lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>12-Month Projection</CardTitle>
            <CardDescription>Revenue and costs over time. Annual costs added in month 1.</CardDescription>
          </CardHeader>
          <CardContent>
            <MonthlyProjectionChart 
              products={project.products}
              productSales={productSales}
              fixedCosts={{
                monthly: totalMonthlyFixedCosts,
                annual: totalAnnualFixedCosts
              }}
              currency={project.currency}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 