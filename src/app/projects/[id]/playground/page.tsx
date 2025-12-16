'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Pencil, Plus, PanelLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProject } from '@/lib/context/ProjectContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MonthlyProjectionChart } from '@/components/dashboard/MonthlyProjectionChart';
import { BusinessStatusSummary } from '@/components/dashboard/BusinessStatusSummary';
import { CostDialog } from '@/components/costs/CostDialog';
import { RevenueStreamDialog } from '@/components/revenue/RevenueStreamDialog';
import type { RevenueStreamInput } from '@/components/revenue/RevenueStreamForm';
import { formatCurrency } from '@/lib/utils/currency';
import { formatProfitMargin, getSubscriptionMonthlyPrice } from '@/lib/utils/financial';
import { calculateBreakEven, type BreakEvenResult } from '@/lib/utils/break-even';
import { fixedCostStorage } from '@/lib/storage/fixedCostStorage';
import { upfrontCostStorage } from '@/lib/storage/upfrontCostStorage';
import { revenueStreamStorage } from '@/lib/storage/revenueStreamStorage';
import type { FixedCost, UpfrontCost, RevenueStream, ProductRevenueStream, SubscriptionRevenueStream, ProductSales } from '@/lib/storage/types';
import type { CostFormData } from '@/components/costs/CostForm';

export default function PlaygroundPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.id as string | undefined;
  const { project, refreshProject } = useProject();

  // Derive products and subscriptions from revenue stream items
  const { products, subscriptions, productSales } = useMemo(() => {
    if (!project) return { products: [], subscriptions: [], productSales: {} };
    
    const items = project.revenueStreams.items || [];
    const products = items.filter((r): r is ProductRevenueStream => r.type === 'product');
    const subscriptions = items.filter((r): r is SubscriptionRevenueStream => r.type === 'subscription');
    
    const sales: Record<string, ProductSales> = {};
    for (const product of products) {
      sales[product.id] = product.sales || { volume: 1, period: 'monthly' };
    }
    
    return { products, subscriptions, productSales: sales };
  }, [project]);

  // Cost dialog state
  const [costDialogOpen, setCostDialogOpen] = useState(false);
  const [editingCost, setEditingCost] = useState<FixedCost | UpfrontCost | undefined>();
  const [costDialogType, setCostDialogType] = useState<'upfront' | 'operating'>('operating');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Revenue stream dialog state (unified)
  const [revenueDialogOpen, setRevenueDialogOpen] = useState(false);
  const [editingRevenueStream, setEditingRevenueStream] = useState<RevenueStream | undefined>();
  const [isRevenueSubmitting, setIsRevenueSubmitting] = useState(false);

  // Chart projection state
  const [projectionMonths, setProjectionMonths] = useState<number>(12);

  // Calculate metrics
  const metrics = useMemo(() => {
    if (!project) {
      return {
        totalMonthlyRevenue: 0,
        totalMonthlyRunningCosts: 0,
        totalMonthlyVariableCosts: 0,
        totalMonthlyOperatingCosts: 0,
        totalMonthlyProfit: 0,
        profitMargin: 0,
        fixedCosts: { monthly: 0, annual: 0, upfront: 0 },
        breakEven: { months: null, isImmediateProfitable: false, hasRevenue: false, hasPositiveMargin: false } as BreakEvenResult,
      };
    }

    // Calculate monthly fixed costs (only true monthly costs)
    const totalMonthlyFixedCosts = project.costStructure.fixedRunningCosts.reduce((total, cost) => {
      const amount = cost.amount ?? 0;
      return cost.frequency === 'monthly' ? total + amount : total;
    }, 0);

    // Calculate annual fixed costs
    const totalAnnualFixedCosts = project.costStructure.fixedRunningCosts.reduce((total, cost) => {
      const amount = cost.amount ?? 0;
      return cost.frequency === 'annual' ? total + amount : total;
    }, 0);

    // Calculate upfront costs
    const totalUpfrontCosts = (project.costStructure.upfrontCosts || []).reduce((sum, c) => sum + (c?.amount ?? 0), 0);

    // Calculate total monthly running costs (includes annual amortized)
    const totalMonthlyRunningCosts = project.costStructure.fixedRunningCosts.reduce((total, cost) => {
      const amount = cost.amount ?? 0;
      const monthlyAmount = cost.frequency === 'annual' ? amount / 12 : amount;
      return total + monthlyAmount;
    }, 0);

    // Calculate variable costs from products
    const productVariableCosts = products.reduce((total, product) => {
      const productCost = product.associatedCosts.reduce((sum, cost) => sum + cost.amount, 0);
      const sales = productSales[product.id] || product.sales || { volume: 0, period: 'monthly' };
      const volume = sales.volume ?? 0;
      const monthlyVolume = sales.period === 'monthly' ? volume : volume * 30;
      return total + (productCost * monthlyVolume);
    }, 0);

    // Calculate variable costs from subscriptions
    const subscriptionVariableCosts = subscriptions.reduce((total, subscription) => {
      const subscriptionCost = subscription.associatedCosts.reduce((sum, cost) => sum + cost.amount, 0);
      const subscribers = subscription.subscribers ?? 0;
      return total + (subscriptionCost * subscribers);
    }, 0);

    const totalMonthlyVariableCosts = productVariableCosts + subscriptionVariableCosts;

    // Calculate revenue from products
    const productRevenue = products.reduce((total, product) => {
      const sales = productSales[product.id] || product.sales || { volume: 0, period: 'monthly' };
      const volume = sales.volume ?? 0;
      const monthlyVolume = sales.period === 'monthly' ? volume : volume * 30;
      const price = product.price ?? 0;
      return total + (price * monthlyVolume);
    }, 0);

    // Calculate revenue from subscriptions
    const subscriptionRevenue = subscriptions.reduce((total, subscription) => {
      const monthlyPrice = getSubscriptionMonthlyPrice(subscription);
      const subscribers = subscription.subscribers ?? 0;
      return total + (monthlyPrice * subscribers);
    }, 0);

    const totalMonthlyRevenue = productRevenue + subscriptionRevenue;

    const totalMonthlyOperatingCosts = totalMonthlyRunningCosts + totalMonthlyVariableCosts;
    const totalMonthlyProfit = totalMonthlyRevenue - totalMonthlyOperatingCosts;
    const profitMargin = totalMonthlyRevenue > 0 ? (totalMonthlyProfit / totalMonthlyRevenue) * 100 : 0;

    const fixedCosts = {
      monthly: totalMonthlyFixedCosts,
      annual: totalAnnualFixedCosts,
      upfront: totalUpfrontCosts,
    };

    const breakEven = calculateBreakEven(
      products, 
      productSales, 
      fixedCosts,
      subscriptions
    );

    return {
      totalMonthlyRevenue,
      totalMonthlyRunningCosts,
      totalMonthlyVariableCosts,
      totalMonthlyOperatingCosts,
      totalMonthlyProfit,
      profitMargin,
      fixedCosts,
      breakEven,
    };
  }, [project, products, subscriptions, productSales]);

  const handleTabChange = (value: string) => {
    if (value === 'business-model' && projectId) {
      router.push(`/projects/${projectId}/canvas-view`);
    }
  };

  // Cost handlers
  const handleAddCost = () => {
    setEditingCost(undefined);
    setCostDialogType('operating');
    setCostDialogOpen(true);
  };

  const handleEditCost = (cost: FixedCost | UpfrontCost, type: 'upfront' | 'operating') => {
    setEditingCost(cost);
    setCostDialogType(type);
    setCostDialogOpen(true);
  };

  const handleSaveCost = (data: CostFormData) => {
    if (!projectId) return;

    setIsSubmitting(true);
    try {
      const isEditMode = !!editingCost;
      const wasUpfront = editingCost && !('category' in editingCost);
      const isUpfront = data.costType === 'upfront';

      if (isEditMode && wasUpfront !== isUpfront) {
        if (wasUpfront && !isUpfront) {
          upfrontCostStorage.deleteUpfrontCost(projectId, editingCost.id);
          fixedCostStorage.createFixedCost(projectId, data.name, data.amount, data.frequency!, data.category!);
        } else {
          fixedCostStorage.deleteFixedCost(projectId, editingCost.id);
          upfrontCostStorage.createUpfrontCost(projectId, data.name, data.amount);
        }
      } else if (isEditMode) {
        if (isUpfront) {
          const updatedCost: UpfrontCost = {
            ...(editingCost as UpfrontCost),
            name: data.name,
            amount: data.amount,
          };
          upfrontCostStorage.updateUpfrontCost(projectId, updatedCost);
        } else {
          const updatedCost: FixedCost = {
            ...(editingCost as FixedCost),
            name: data.name,
            amount: data.amount,
            frequency: data.frequency!,
            category: data.category!,
          };
          fixedCostStorage.updateFixedCost(projectId, updatedCost);
        }
      } else {
        if (isUpfront) {
          upfrontCostStorage.createUpfrontCost(projectId, data.name, data.amount);
        } else {
          fixedCostStorage.createFixedCost(projectId, data.name, data.amount, data.frequency!, data.category!);
        }
      }

      refreshProject();
      setCostDialogOpen(false);
      setEditingCost(undefined);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCost = () => {
    if (!editingCost || !projectId) return;

    const isUpfront = !('category' in editingCost);
    if (isUpfront) {
      upfrontCostStorage.deleteUpfrontCost(projectId, editingCost.id);
    } else {
      fixedCostStorage.deleteFixedCost(projectId, editingCost.id);
    }

    refreshProject();
    setCostDialogOpen(false);
    setEditingCost(undefined);
  };

  // Revenue stream handlers (unified)
  const handleAddRevenueStream = () => {
    setEditingRevenueStream(undefined);
    setRevenueDialogOpen(true);
  };

  const handleEditRevenueStream = (item: RevenueStream) => {
    setEditingRevenueStream(item);
    setRevenueDialogOpen(true);
  };

  const handleSaveRevenueStream = (input: RevenueStreamInput) => {
    if (!projectId) return;

    setIsRevenueSubmitting(true);
    try {
      // Build the full revenue stream object
      const item: RevenueStream = {
        ...input,
        id: input.id || crypto.randomUUID(),
        projectId,
        associatedCosts: input.associatedCosts.map(cost => ({
          ...cost,
          revenueStreamId: input.id || '',
          projectId,
        })),
      } as RevenueStream;

      if (editingRevenueStream) {
        // Update existing - this handles type changes seamlessly
        revenueStreamStorage.updateRevenueStream(item, projectId);
      } else {
        // Create new
        revenueStreamStorage.createRevenueStream(item, projectId);
      }

      refreshProject();
      setRevenueDialogOpen(false);
      setEditingRevenueStream(undefined);
    } finally {
      setIsRevenueSubmitting(false);
    }
  };

  const handleDeleteRevenueStream = () => {
    if (!editingRevenueStream || !projectId) return;

    revenueStreamStorage.deleteRevenueStream(editingRevenueStream.id, projectId);
    refreshProject();
    setRevenueDialogOpen(false);
    setEditingRevenueStream(undefined);
  };

  if (!project) {
    return <div>Loading...</div>;
  }

  return (
    <section className="relative h-full min-h-0 flex flex-col">
      <div className="mx-auto flex w-full flex-col gap-6 pb-8 lg:flex-1 lg:min-h-0">
        <Tabs
          value="profitability"
          onValueChange={handleTabChange}
          className="self-center items-center w-full lg:h-full"
        >
          <div className="relative flex flex-col md:flex-row md:items-center pt-2 md:pt-0 w-full gap-3 md:gap-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-block w-full md:w-auto">
                    <Button
                      disabled
                      className="h-8 w-full md:w-auto rounded-lg bg-blue-700 text-white font-hero font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <PanelLeft className="h-4 w-4" />
                      AI Assistant
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Only on canvas page right now</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="w-full md:absolute md:left-1/2 md:-translate-x-1/2 flex justify-center">
              <TabsList className="grid min-w-[280px] grid-cols-2 rounded-full bg-background shadow-sm">
                <TabsTrigger value="business-model" className="rounded-full text-sm font-medium">
                  Business Model
                </TabsTrigger>
                <TabsTrigger value="profitability" className="rounded-full text-sm font-medium">
                  Profitability Playground
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
          <TabsContent value="profitability" className="mt-6 outline-none w-full flex flex-col lg:flex-1 lg:min-h-0">
            {/* 2-column layout: fills remaining viewport height */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:flex-1 lg:min-h-0">
              {/* Left Column - Charts and Metrics flowing from top */}
              <div className="flex flex-col space-y-2 min-h-0 lg:flex-1 lg:h-full">
                {/* Monthly Projection Chart */}
                <Card className="flex flex-col flex-1">
                  <CardHeader className="pb-2 flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-4">
                      <CardTitle>Revenue Projection</CardTitle>
                      <Select value={String(projectionMonths)} onValueChange={(v) => setProjectionMonths(Number(v))}>
                        <SelectTrigger className="h-8 w-[100px]">
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
                    <CardDescription>Cumulative revenue and costs over time</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 min-h-0">
                    <MonthlyProjectionChart
                      products={products}
                      productSales={productSales}
                      fixedCosts={metrics.fixedCosts}
                      currency={project.currency}
                      lengthMonths={projectionMonths}
                      subscriptions={subscriptions}
                    />
                  </CardContent>
                </Card>

                {/* Metric Cards */}
                <div className="grid grid-cols-6 gap-2">
                  {/* Top Left: Operating Profit */}
                  <Card className="p-2 gap-0 col-span-2">
                    <CardHeader className="p-2 gap-0">
                      <CardTitle className="text-sm text-foreground">Operating profit </CardTitle>
                      <CardDescription className="text-sm">Per Month</CardDescription>
                    </CardHeader>
                    <CardContent className="p-2">
                      <p className={cn('text-sm md:text-2xl font-bold', metrics.totalMonthlyProfit >= 0 ? 'text-green-600' : 'text-red-600')}>
                        {formatCurrency(metrics.totalMonthlyProfit, project.currency)}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="p-2 gap-0 col-span-2">
                    <CardHeader className="p-2 gap-0">
                      <CardTitle className="text-sm text-foreground">Operating margin </CardTitle>
                      <CardDescription className="text-sm">Revenue / Costs</CardDescription>
                    </CardHeader>
                    <CardContent className="p-2">
                      <p className={cn('text-sm md:text-2xl font-bold', metrics.totalMonthlyProfit >= 0 ? 'text-green-600' : 'text-red-600')}>
                      {formatProfitMargin(metrics.profitMargin)}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Top Right: Break Even */}
                  <Card className="p-2 gap-0 col-span-2">
                    <CardHeader className="p-2 gap-0">
                      <CardTitle className="text-sm text-foreground">Break even</CardTitle>
                      <CardDescription className="text-sm">&nbsp;</CardDescription>
                    </CardHeader>
                    <CardContent className="p-2">
                      <p className="text-sm md:text-2xl font-bold">
                        {metrics.breakEven.isImmediateProfitable
                          ? 'Day 1'
                          : !metrics.breakEven.hasRevenue
                            ? 'No revenue'
                            : !metrics.breakEven.hasPositiveMargin
                              ? 'Never'
                              : metrics.breakEven.months === null
                                ? '10+ Years'
                                : metrics.breakEven.months === 1
                                  ? '1 Month'
                                  : `${metrics.breakEven.months} Months`}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Bottom Left: Revenue */}
                  <Card className="p-2 gap-0 col-span-3">
                    <CardHeader className="p-2 gap-0">
                      <CardTitle className="text-sm text-foreground">Revenue</CardTitle>
                      <CardDescription className="text-sm">Per Month</CardDescription>
                    </CardHeader>
                    <CardContent className="p-2">
                      <p className="text-sm md:text-2xl font-bold">{formatCurrency(metrics.totalMonthlyRevenue, project.currency)}</p>
                    </CardContent>
                  </Card>

                  {/* Bottom Right: Operating Costs */}
                  <Card className="p-2 gap-0 col-span-3">
                    <CardHeader className="p-2 gap-0">
                      <CardTitle className="text-sm text-foreground">Costs</CardTitle>
                      <CardDescription className="text-sm">Per Month (Operating + COGS)</CardDescription>
                    </CardHeader>
                    <CardContent className="p-2">
                      <p className="text-sm md:text-2xl font-bold">
                        {formatCurrency(metrics.totalMonthlyOperatingCosts, project.currency)}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Right Column - Single card filling full available height */}
              <Card className="flex flex-col h-full min-h-0 gap-4">
                <CardHeader className="flex-shrink-0">
                  <BusinessStatusSummary project={project} productSales={productSales} showTitle={true} />
                </CardHeader>
                <CardContent className="flex-1 min-h-0 p-0 border-t border-border/20 overflow-hidden">
                  <ScrollArea className="h-full w-full">
                    <div className="p-6 space-y-6">
                      {/* Revenue Streams Section */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-sm">Revenue Streams</h3>
                          <Button variant="ghost" size="sm" onClick={handleAddRevenueStream} className="h-7 gap-1 text-xs">
                            <Plus className="h-3.5 w-3.5" />
                            Add
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {products.length === 0 && subscriptions.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-border/60 px-3 py-4 text-center text-sm text-muted-foreground">
                              No revenue streams yet
                            </div>
                          ) : (
                            <>
                              {products.map((product) => {
                                const isIncomplete = product.price === undefined || product.price === null;
                                const sales = productSales[product.id] || product.sales || { volume: 0, period: 'monthly' };
                                const volume = sales.volume ?? 0;
                                const monthlyVolume = sales.period === 'monthly' ? volume : volume * 30;
                                const monthlyRevenue = (product.price ?? 0) * monthlyVolume;
                                return (
                                  <div
                                    key={product.id}
                                    className="flex items-center justify-between rounded-lg bg-muted/80 px-3 py-2 cursor-pointer hover:bg-muted transition-colors"
                                    onClick={() => handleEditRevenueStream(product)}
                                  >
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">{product.name}</p>
                                      {isIncomplete ? (
                                        <p className="text-xs text-muted-foreground italic">Click to set price and sales</p>
                                      ) : (
                                        <p className="text-xs text-muted-foreground">
                                          {formatCurrency(product.price!, project.currency)} × {volume} {sales.period} = {formatCurrency(monthlyRevenue, project.currency)}/mo
                                        </p>
                                      )}
                                    </div>
                                    {isIncomplete ? (
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-7 shrink-0 w-fit p-2 bg-blue-100 text-blue-700"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditRevenueStream(product);
                                      }}
                                    >
                                      <Pencil className="h-3.5 w-3.5" /> Set price
                                    </Button>
                                    ) : (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 shrink-0"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEditRevenueStream(product);
                                        }}
                                      >
                                        <Pencil className="h-3.5 w-3.5" />
                                      </Button>
                                    )}
                                  </div>
                                );
                              })}
                              {subscriptions.map((subscription) => {
                                const isIncomplete = 
                                  (subscription.price === undefined || subscription.price === null) ||
                                  (subscription.subscribers === undefined || subscription.subscribers === null);
                                const monthlyPrice = getSubscriptionMonthlyPrice(subscription);
                                const monthlyRevenue = monthlyPrice * (subscription.subscribers ?? 0);
                                const pricePeriod = subscription.pricePeriod || 'monthly';
                                const periodLabel = pricePeriod === 'annual' ? '/yr' : '/mo';
                                return (
                                  <div
                                    key={subscription.id}
                                    className="flex items-center justify-between rounded-lg bg-muted/80 px-3 py-2 cursor-pointer hover:bg-muted transition-colors"
                                    onClick={() => handleEditRevenueStream(subscription)}
                                  >
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">{subscription.name}</p>
                                      {isIncomplete ? (
                                        <p className="text-xs text-muted-foreground italic">Click to set price and subscribers</p>
                                      ) : (
                                        <p className="text-xs text-muted-foreground">
                                          {formatCurrency(subscription.price!, project.currency)}{periodLabel} × {subscription.subscribers} subscribers = {formatCurrency(monthlyRevenue, project.currency)}/mo
                                        </p>
                                      )}
                                    </div>
                                    {isIncomplete ? (
                                    <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-7 shrink-0 w-fit p-2 bg-blue-100 text-blue-700"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditRevenueStream(subscription);
                                    }}
                                  >
                                    <Pencil className="h-3.5 w-3.5" /> Set price
                                  </Button>
                                    ) : (
                                      <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 shrink-0"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditRevenueStream(subscription);
                                      }}
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                    )}
                                  </div>
                                );
                              })}
                            </>
                          )}
                        </div>
                      </div>

                      <Separator />

                      {/* Operating Costs Section */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-sm">Operating Costs</h3>
                          <Button variant="ghost" size="sm" onClick={handleAddCost} className="h-7 gap-1 text-xs">
                            <Plus className="h-3.5 w-3.5" />
                            Add
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {project.costStructure.fixedRunningCosts.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-border/60 px-3 py-4 text-center text-sm text-muted-foreground">
                              No operating costs yet
                            </div>
                          ) : (
                            project.costStructure.fixedRunningCosts.map((cost) => {
                              const isIncomplete = cost.amount === undefined || cost.amount === null;
                              const cadence = cost.frequency === 'monthly' ? '/mo' : '/yr';
                              return (
                                <div
                                  key={cost.id}
                                  className="flex items-center justify-between rounded-lg bg-muted/80 px-3 py-2 cursor-pointer hover:bg-muted transition-colors"
                                  onClick={() => handleEditCost(cost, 'operating')}
                                >
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{cost.name}</p>
                                    {isIncomplete ? (
                                      <p className="text-xs text-muted-foreground italic">Click to set amount</p>
                                    ) : (
                                      <p className="text-xs text-muted-foreground">
                                        {formatCurrency(cost.amount!, project.currency)}{cadence}
                                      </p>
                                    )}
                                  </div>
                                  {isIncomplete ? (
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-7 shrink-0 w-fit p-2 bg-blue-100 text-blue-700"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditCost(cost, 'operating');
                                      }}
                                    >
                                      <Pencil className="h-3.5 w-3.5" /> Set amount
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 shrink-0"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditCost(cost, 'operating');
                                      }}
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>

                      <Separator />

                      {/* Upfront Costs Section */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-sm">Upfront Costs</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingCost(undefined);
                              setCostDialogType('upfront');
                              setCostDialogOpen(true);
                            }}
                            className="h-7 gap-1 text-xs"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Add
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {(project.costStructure.upfrontCosts ?? []).length === 0 ? (
                            <div className="rounded-lg border border-dashed border-border/60 px-3 py-4 text-center text-sm text-muted-foreground">
                              No upfront costs yet
                            </div>
                          ) : (
                            (project.costStructure.upfrontCosts ?? []).map((cost) => {
                              const isIncomplete = cost.amount === undefined || cost.amount === null;
                              return (
                                <div
                                  key={cost.id}
                                  className="flex items-center justify-between rounded-lg bg-muted/80 px-3 py-2 cursor-pointer hover:bg-muted transition-colors"
                                  onClick={() => handleEditCost(cost, 'upfront')}
                                >
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{cost.name}</p>
                                    {isIncomplete ? (
                                      <p className="text-xs text-muted-foreground italic">Click to set amount</p>
                                    ) : (
                                      <p className="text-xs text-muted-foreground">
                                        {formatCurrency(cost.amount!, project.currency)} one-time
                                      </p>
                                    )}
                                  </div>
                                  {isIncomplete ? (
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-7 shrink-0 w-fit p-2 bg-blue-100 text-blue-700"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditCost(cost, 'upfront');
                                      }}
                                    >
                                      <Pencil className="h-3.5 w-3.5" /> Set amount
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 shrink-0"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditCost(cost, 'upfront');
                                      }}
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Cost Dialog */}
      {project && (
        <CostDialog
          open={costDialogOpen}
          onOpenChange={setCostDialogOpen}
          cost={editingCost}
          costType={costDialogType}
          currency={project.currency}
          onSave={handleSaveCost}
          isSubmitting={isSubmitting}
          onDelete={editingCost ? handleDeleteCost : undefined}
          toggleEnabled={true}
        />
      )}

      {/* Revenue Stream Dialog (unified) */}
      {project && (
        <RevenueStreamDialog
          open={revenueDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              setRevenueDialogOpen(false);
              setEditingRevenueStream(undefined);
            }
          }}
          revenueStream={editingRevenueStream}
          currency={project.currency}
          onSave={handleSaveRevenueStream}
          isSubmitting={isRevenueSubmitting}
          onDelete={editingRevenueStream ? handleDeleteRevenueStream : undefined}
        />
      )}
    </section>
  );
}
