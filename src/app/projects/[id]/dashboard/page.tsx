'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useProject } from '@/lib/context/ProjectContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CostBreakdownChart } from '@/components/dashboard/CostBreakdownChart';
import { RevenueBreakdownChart } from '@/components/dashboard/RevenueBreakdownChart';
import { ProfitabilityChart } from '@/components/dashboard/ProfitabilityChart';
import { ProductControls } from '@/components/dashboard/ProductControls';
import { formatCurrency } from '@/lib/utils/currency';
import { formatProfitMargin } from '@/lib/utils/financial';
import { calculateProductTotalCost } from '@/lib/utils/financial';
import type { Product, ProductSales } from '@/lib/storage/types';
import { projectStorage } from '@/lib/storage/projectStorage';
import { productStorage } from '@/lib/storage/productStorage';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';

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

  // Initialize product sales only once when project is loaded
  useEffect(() => {
    if (project && !initialized) {
      // Initialize product sales from project data or defaults
      const initialSales: Record<string, ProductSales> = {};
      
      for (const product of project.products) {
        // Use stored values if available, otherwise default to 1 unit monthly
        initialSales[product.id] = project.productSales?.[product.id] || {
          volume: 1,
          period: 'monthly'
        };
      }
      
      setProductSales(initialSales);
      setInitialized(true);
    }
  }, [project, initialized]);

  // Save sales volumes to localStorage when they change
  useEffect(() => {
    if (project && initialized) {
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
                <p className="lg:text-2xl text-lg font-bold">{formatCurrency(totalMonthlyRevenue, project.currency)}</p>
                <p className="text-sm text-muted-foreground">Monthly</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Costs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="lg:text-2xl text-lg font-bold">{formatCurrency(totalMonthlyFixedCosts + totalMonthlyVariableCosts, project.currency)}</p>
                <p className="text-sm text-muted-foreground">Monthly</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Profit</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`lg:text-2xl text-lg font-bold ${totalMonthlyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(totalMonthlyProfit, project.currency)}
                </p>
                <p className="text-sm text-muted-foreground">Monthly</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Margin</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`lg:text-2xl text-lg font-bold ${profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatProfitMargin(profitMargin)}
                </p>
                <p className="text-sm text-muted-foreground">Monthly</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
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
              <CardHeader>
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
        </div>
        
        {/* Right Column - Product Controls and Revenue Breakdown */}
        <div className="space-y-6">
          <ProductControls 
            products={project.products}
            productSales={productSales}
            currency={project.currency}
            onSalesVolumeChange={handleSalesVolumeChange}
            onSalesPeriodChange={handleSalesPeriodChange}
            onPriceChange={handlePriceChange}
            totalMonthlyFixedCosts={totalMonthlyFixedCosts}
          />

          <Card>
            <CardHeader>
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
        </div>
      </div>
    </div>
  );
} 