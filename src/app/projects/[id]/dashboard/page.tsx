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
import { BreakEvenStatement } from '@/components/dashboard/BreakEvenStatement';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
export default function DashboardPage() {
  const { id } = useParams();
  const { project, refreshProject } = useProject();
  const [productSales, setProductSales] = useState<Record<string, ProductSales>>({});
  const [initialized, setInitialized] = useState(false);
  const [projectionMonths, setProjectionMonths] = useState<number>(12);

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
      
      for (const product of project.revenueStreams.products) {
        // Use stored values if available (from embedded sales or productSales), otherwise default to 1 unit monthly
        initialSales[product.id] = product.sales || {
          volume: 1,
          period: 'monthly'
        };
      }
      
      // Only update if we have products to initialize and we haven't initialized yet
      if (project.revenueStreams.products.length > 0 && !initialized) {
        setProductSales(initialSales);
        setInitialized(true);
      }
    }
  }, [project, initialized]);

  // Save sales volumes to products when they change
  useEffect(() => {
    if (project && initialized && Object.keys(productSales).length > 0) {
      // Update sales in products
      const updatedProducts = project.revenueStreams.products.map(product => {
        const sales = productSales[product.id];
        return sales ? { ...product, sales } : product;
      });
      
      const updatedProject = {
        ...project,
        revenueStreams: {
          ...project.revenueStreams,
          products: updatedProducts
        }
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
    const productToUpdate = project.revenueStreams.products.find(p => p.id === productId);
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
  const hasProducts = project.revenueStreams.products.length > 0;
  const hasFixedCosts = project.costStructure.fixedRunningCosts.length > 0;
  const hasData = hasProducts || hasFixedCosts;

  // Calculate total monthly fixed costs (only true monthly costs, not annual)
  const totalMonthlyFixedCosts = project.costStructure.fixedRunningCosts.reduce((total, cost) => {
    return cost.frequency === 'monthly' ? total + cost.amount : total;
  }, 0);
  
  // Calculate total monthly running costs (for display purposes - includes annual amortized)
  const totalMonthlyRunningCosts = project.costStructure.fixedRunningCosts.reduce((total, cost) => {
    const monthlyAmount = cost.frequency === 'annual' ? cost.amount / 12 : cost.amount;
    return total + monthlyAmount;
  }, 0);

  // Calculate total annual fixed costs
  const totalAnnualFixedCosts = project.costStructure.fixedRunningCosts.reduce((total, cost) => {
    // Only include costs that are specifically marked as annual
    if (cost.frequency === 'annual') {
      return total + cost.amount;
    }
    return total;
  }, 0);

  // Up-front costs come from dedicated array
  const totalUpfrontFixedCosts = (project.costStructure.upfrontCosts || []).reduce((sum, c) => sum + (c?.amount || 0), 0);



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
  const totalMonthlyProfit = totalMonthlyRevenue - totalMonthlyRunningCosts - totalMonthlyVariableCosts;

  // Calculate profit margin
  const profitMargin = totalMonthlyRevenue > 0 
    ? (totalMonthlyProfit / totalMonthlyRevenue) * 100 
    : 0;

  // If there's no data, show the empty state
  if (!hasData) {
    return (
      <div>
        <OnboardingProgress 
          hasCosts={project.costStructure.fixedRunningCosts.length > 0}
          hasProducts={project.revenueStreams.products.length > 0}
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
        hasCosts={project.costStructure.fixedRunningCosts.length > 0}
        hasProducts={project.revenueStreams.products.length > 0}
        projectId={project.id}
        currentPage="dashboard"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Business Overview - Shows first on mobile, right side on desktop */}
        <div className="order-first md:order-first space-y-6">
        <div className="sticky top-14 pt-4 border-b pb-4 bg-background/60 backdrop-blur z-10">
          <h3 className="text-xl font-bold px-4">Upfront costs and projections</h3>
          <p className="text-sm text-muted-foreground px-4">How long will it take to recoup your upfront costs?</p>
          </div>
          <BreakEvenStatement
            products={project.revenueStreams.products}
            productSales={productSales}
            fixedCosts={project.costStructure.fixedRunningCosts}
            upfrontCosts={project.costStructure.upfrontCosts || []}
          />
          {/* Monthly Projection Chart */}
          <Card>
              <CardHeader className="pb-2 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-4">
                  <CardTitle>Projection</CardTitle>
                  <div className="flex items-center gap-4">
                    <Select value={String(projectionMonths)} onValueChange={(v) => setProjectionMonths(Number(v))}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12">1 year</SelectItem>
                        <SelectItem value="24">2 years</SelectItem>
                        <SelectItem value="36">3 years</SelectItem>
                        <SelectItem value="60">5 years</SelectItem>
                        <SelectItem value="120">10 years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                                 <CardDescription>Revenue and costs over time. Up-front costs added once, annual costs added yearly.</CardDescription>
            </CardHeader>
            <CardContent>
              <MonthlyProjectionChart 
                products={project.revenueStreams.products}
                productSales={productSales}
                fixedCosts={{
                  monthly: totalMonthlyFixedCosts,
                  annual: totalAnnualFixedCosts,
                  upfront: totalUpfrontFixedCosts
                }}
                currency={project.currency}
                  lengthMonths={projectionMonths}
              />
            </CardContent>
          </Card>
        </div>

        {/* Left Column - Financial Summary and Charts */}
        <div className="space-y-6 order-last md:order-last">
          <div className="sticky top-14 pt-4 border-b pb-4 bg-background/60 backdrop-blur z-10">
          <h3 className="text-xl font-bold px-4">Operating metrics</h3>
          <p className="text-sm text-muted-foreground px-4">Excluding up-front costs, is the business operating profitably?</p>
          </div>
          {/* Financial Summary Cards */}
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Sales revenue</CardTitle>
                <CardDescription>Monthly</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="lg:text-2xl text-lg font-bold">{formatCurrency(totalMonthlyRevenue, project.currency)}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Running costs total</CardTitle>
                <CardDescription>Monthly (Operating costs + COGS)</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="lg:text-2xl text-lg font-bold">{formatCurrency(totalMonthlyRunningCosts + totalMonthlyVariableCosts, project.currency)}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Operating profit</CardTitle>
                <CardDescription>Monthly (Sales revenue - Running costs)</CardDescription>
              </CardHeader>
              <CardContent>
                <p className={`lg:text-2xl text-lg font-bold ${totalMonthlyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(totalMonthlyProfit, project.currency)}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Operating margin</CardTitle>
                <CardDescription>Monthly (Operating profit / Sales revenue)</CardDescription>
              </CardHeader>
              <CardContent>
                <p className={`lg:text-2xl text-lg font-bold ${profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatProfitMargin(profitMargin)}
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="">
          <Card className="bg-muted/50 lg:sticky top-20 pt-0 gap-0">
            <CardHeader className="px-0 gap-0">
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
                  products={project.revenueStreams.products}
                  productSales={productSales}
                  currency={project.currency}
                  onSalesVolumeChange={handleSalesVolumeChange}
                  onSalesPeriodChange={handleSalesPeriodChange}
                  onPriceChange={handlePriceChange}
                  totalMonthlyFixedCosts={totalMonthlyRunningCosts}
                  project={project}
                />
              </div>
              <Separator />
              {/* Costs Summary */}
              <div className="space-y-2 px-6">
                <div className="flex items-center justify-between">
                   <h3 className="font-medium">Operating costs</h3>
                  <Link 
                    href={`/projects/${project.id}/fixed-costs`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Edit costs
                  </Link>
                </div>
                <div className="text-sm text-muted-foreground">
                  {totalMonthlyRunningCosts > totalMonthlyRevenue * 0.5 ? (
                    <p className="text-red-600">
                       Operating costs ({formatCurrency(totalMonthlyRunningCosts, project.currency)}) are high (&gt;50% of revenue). Reduce costs or increase revenue.
                    </p>
                  ) : totalMonthlyRunningCosts > totalMonthlyRevenue * 0.3 ? (
                    <p className="text-yellow-600">
                       Operating costs ({formatCurrency(totalMonthlyRunningCosts, project.currency)}) are moderate (&gt;30% of revenue). Monitor their impact on profitability.
                    </p>
                  ) : (
                    <p className="text-green-600">
                       Operating costs ({formatCurrency(totalMonthlyRunningCosts, project.currency)}) are well managed (&lt;30% of revenue).
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          </div>

          {/* Business Costs Chart and Profit Threshold Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 hidden">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Business costs</CardTitle>
           <CardDescription>Monthly running costs: Operating costs + COGS (excludes up-front)</CardDescription>
              </CardHeader>
              <CardContent>
                <CostBreakdownChart 
                  fixedCosts={totalMonthlyRunningCosts}
                  variableCosts={totalMonthlyVariableCosts}
                  currency={project.currency}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Profit threshold</CardTitle>
                <CardDescription>When your business becomes profitable</CardDescription>
              </CardHeader>
              <CardContent>
                <ProfitabilityChart 
                  products={project.revenueStreams.products}
                  productSales={productSales}
                  fixedCosts={totalMonthlyRunningCosts}
                  currency={project.currency}
                />
              </CardContent>
            </Card>
          </div>

          {/* Revenue Breakdown Chart */}
          <Card className="hidden">
            <CardHeader className="pb-2">
              <CardTitle>Revenue by product</CardTitle>
              <CardDescription>How much revenue each product generates</CardDescription>
            </CardHeader>
            <CardContent>
              <RevenueBreakdownChart 
                products={project.revenueStreams.products}
                productSales={productSales}
                currency={project.currency}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 