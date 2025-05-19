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
      
      // Only update if we have products to initialize and we haven't initialized yet
      if (project.products.length > 0 && !initialized) {
        setProductSales(initialSales);
        setInitialized(true);
      }
    }
  }, [project, initialized]);

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
    
    // Find the product to update
    const productToUpdate = project.products.find(p => p.id === productId);
    if (!productToUpdate) return;

    // If the value is empty or only whitespace, set price to 0
    if (!value.trim()) {
      const updatedProduct: Product = {
        ...productToUpdate,
        price: 0
      };
      productStorage.updateProduct(updatedProduct, project.id);
      refreshProject();
      return;
    }

    // Only convert to number if the input is complete (no trailing decimal point)
    if (!value.endsWith('.')) {
      const numericValue = Number.parseFloat(value);
      if (!Number.isNaN(numericValue) && numericValue >= 0) {
        const updatedProduct: Product = {
          ...productToUpdate,
          price: numericValue
        };
        productStorage.updateProduct(updatedProduct, project.id);
        refreshProject();
      }
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
                <CardTitle>Sales scenarios</CardTitle>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Business Overview - Shows first on mobile, right side on desktop */}
        <div className="order-first md:order-first">
          <Card className="bg-muted/50 lg:sticky top-20 pt-0 gap-0">
            <CardHeader className="px-0 gap-0 bg-background">
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
                      Fixed costs ({formatCurrency(totalMonthlyFixedCosts, project.currency)}) are high (&gt;50% of revenue). Reduce costs or increase revenue.
                    </p>
                  ) : totalMonthlyFixedCosts > totalMonthlyRevenue * 0.3 ? (
                    <p className="text-yellow-600">
                      Fixed costs ({formatCurrency(totalMonthlyFixedCosts, project.currency)}) are moderate (&gt;30% of revenue). Monitor their impact on profitability.
                    </p>
                  ) : (
                    <p className="text-green-600">
                      Fixed costs ({formatCurrency(totalMonthlyFixedCosts, project.currency)}) are well managed (&lt;30% of revenue).
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Left Column - Financial Summary and Charts */}
        <div className="space-y-6 order-last md:order-last">
          {/* Financial Summary Cards */}
          <div className="grid grid-cols-2 gap-6">
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

          {/* Business Costs Chart and Profit Threshold Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
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

            <Card>
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
          </div>

          {/* Revenue Breakdown Chart */}
          <Card>
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
          <Card>
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
    </div>
  );
} 