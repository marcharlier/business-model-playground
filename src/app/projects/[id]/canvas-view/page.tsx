'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import {
  Link,
  Zap,
  Gift,
  Heart,
  SquareUserRound,
  Factory,
  Truck,
  CircleDollarSign,
  HandCoins,
  Pencil,
  PanelLeft,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils/currency';
import { calculateProfitMargin, calculateSubscriptionProfitMargin, formatProfitMargin } from '@/lib/utils/financial';
import { useProject } from '@/lib/context/ProjectContext';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CanvasSectionEditableCard } from '@/components/canvas/CanvasSectionEditableCard';
import { CostStructureCard } from '@/components/canvas/CostStructureCard';
import { RevenueStreamsCard } from '@/components/canvas/RevenueStreamsCard';
import { CanvasAISuggestionsSheet } from '@/components/canvas/CanvasAISuggestionsSheet';
import { CanvasGenerationSheet } from '@/components/canvas/CanvasGenerationSheet';
import { CostDialog } from '@/components/costs/CostDialog';
import { RevenueStreamDialog } from '@/components/revenue/RevenueStreamDialog';
import { projectStorage } from '@/lib/storage/projectStorage';
import { fixedCostStorage } from '@/lib/storage/fixedCostStorage';
import { upfrontCostStorage } from '@/lib/storage/upfrontCostStorage';
import { productStorage } from '@/lib/storage/productStorage';
import { subscriptionStorage } from '@/lib/storage/subscriptionStorage';
import { chatHistoryStorage, type StoredChatMessage } from '@/lib/storage/chatHistoryStorage';
import type { CanvasItem } from '@/lib/domain/types';
import type { FixedCost, UpfrontCost, Product, Subscription, AssociatedCost, ProductSales } from '@/lib/storage/types';
import type { CostFormData } from '@/components/costs/CostForm';
import { useMediaQuery } from '@/hooks/use-media-query';

type CanvasSection = {
  id: string;
  title: string;
  icon: LucideIcon;
  items: string[];
};

const createCanvasSections = (placeholder: string): CanvasSection[] => [
  { id: 'partnerships', title: 'Partnerships', icon: Link, items: [placeholder,placeholder,placeholder] },
  { id: 'activities', title: 'Activities', icon: Zap, items: [placeholder] },
  { id: 'value-proposition', title: 'Value Proposition', icon: Gift, items: [placeholder] },
  { id: 'customer-relationships', title: 'Customer Relationships', icon: Heart, items: [placeholder] },
  { id: 'customer-segments', title: 'Customer Segments', icon: SquareUserRound, items: [placeholder] },
  { id: 'resources', title: 'Resources', icon: Factory, items: [placeholder] },
  { id: 'channels', title: 'Channels', icon: Truck, items: [placeholder] },
  { id: 'cost-structure', title: 'Cost Structure', icon: CircleDollarSign, items: [placeholder] },
  { id: 'revenue-streams', title: 'Revenue Streams', icon: HandCoins, items: [placeholder] },
];

type CanvasSectionCardProps = {
  section: CanvasSection;
  className?: string;
};

function CanvasSectionCard({ section, className }: CanvasSectionCardProps) {
  const Icon = section.icon;

  return (
    <Card
      className={cn(
        'flex h-full flex-col rounded-lg gap-0 border-black/5 bg-background p-1 shadow-md',
        className,
      )}
    >
      <CardHeader className="space-y-2 px-2 py-2">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base font-medium text-foreground">{section.title}</CardTitle>
          <div className="">
            <Icon className="h-4 w-4 text-muted-foreground/80" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 min-h-0 flex-col px-2 pt-0">
        <ScrollArea className="flex-1 min-h-0">
          <div className="flex flex-col gap-2 pr-2">
            {section.items.length > 0 ? (
              section.items.map((item, index) => (
                <div
                  key={`${section.id}-${index}`}
                  className="flex min-w-0 items-center justify-between gap-2 rounded-lg bg-muted/80 px-1 py-1 text-xs font-medium text-muted-foreground"
                >
                  <span className="min-w-0 truncate">{item}</span>
                  <Pencil className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-border/60 px-3 py-6 text-center text-sm text-muted-foreground">
                Nothing captured yet
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="mt-auto flex w-full flex-col gap-2 px-2 pb-2 pt-0">
        <Separator className="bg-border/70" />
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-full justify-center rounded-lg border border-border bg-background text-xs font-medium text-foreground shadow-none"
        >
          Add more
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function CanvasViewPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const projectId = params?.id as string | undefined;
  const { project, refreshProject } = useProject();

  // AI chat state
  const isGenerating = searchParams.get('generating') === 'true';
  const generationPromptFromUrl = searchParams.get('prompt') ?? '';
  const [showGenerationSheet, setShowGenerationSheet] = useState(false);
  const [initialPrompt, setInitialPrompt] = useState<string>('');
  const [isInitialGeneration, setIsInitialGeneration] = useState(false);
  const [chatHistory, setChatHistory] = useState<StoredChatMessage[]>([]);
  const [chatHistoryLoaded, setChatHistoryLoaded] = useState(false);

  // Load chat history from Supabase on mount
  useEffect(() => {
    if (!projectId || chatHistoryLoaded) return;

    const loadChatHistory = async () => {
      try {
        const history = await chatHistoryStorage.fetchChatHistory(projectId);
        setChatHistory(history);
      } catch (err) {
        console.error('Failed to load chat history:', err);
      } finally {
        setChatHistoryLoaded(true);
      }
    };

    loadChatHistory();
  }, [projectId, chatHistoryLoaded]);

  // Initialize generation sheet when URL params are present (for initial generation)
  useEffect(() => {
    if (isGenerating && generationPromptFromUrl && !showGenerationSheet) {
      const decodedPrompt = decodeURIComponent(generationPromptFromUrl);
      setInitialPrompt(decodedPrompt);
      setIsInitialGeneration(true);
      setShowGenerationSheet(true);
      // Clear URL params to prevent re-triggering on refresh
      router.replace(`/projects/${projectId}/canvas-view`, { scroll: false });
    }
  }, [isGenerating, generationPromptFromUrl, showGenerationSheet, router, projectId]);

  // Handle project changes from AI tools
  const handleProjectChange = useCallback(() => {
    refreshProject();
  }, [refreshProject]);

  // Cost dialog state
  const [costDialogOpen, setCostDialogOpen] = useState(false);
  const [editingCost, setEditingCost] = useState<FixedCost | UpfrontCost | undefined>();
  const [costDialogType, setCostDialogType] = useState<'upfront' | 'operating'>('operating');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // AI suggestions sheet state
  const [aiSuggestionsOpen, setAiSuggestionsOpen] = useState(false);
  
  // Prefill values for cost dialog (from AI suggestions)
  const [prefillName, setPrefillName] = useState<string | undefined>();
  const [prefillAmount, setPrefillAmount] = useState<string | undefined>();
  const [prefillFrequency, setPrefillFrequency] = useState<'monthly' | 'annual' | undefined>();
  const [prefillCategory, setPrefillCategory] = useState<string | undefined>();

  // Product dialog state
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [isProductSubmitting, setIsProductSubmitting] = useState(false);

  // Subscription dialog state
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | undefined>();
  const [isSubscriptionSubmitting, setIsSubscriptionSubmitting] = useState(false);

  const placeholder = 'Coming soon...';
  const costStructureItems = useMemo(() => {
    if (!project) return [];

    const { costStructure, currency } = project;
    const operatingCosts = costStructure.fixedRunningCosts.map((cost) => {
      const cadence = cost.frequency === 'monthly' ? 'per month' : 'per year';
      return `${cost.name} - ${formatCurrency(cost.amount, currency)} ${cadence}`;
    });
    const upfrontCosts = (costStructure.upfrontCosts ?? []).map(
      (cost) => `${cost.name} - ${formatCurrency(cost.amount, currency)} upfront`,
    );

    return [...operatingCosts, ...upfrontCosts];
  }, [project]);

  const revenueStreamsItems = useMemo(() => {
    if (!project) return [];

    const { revenueStreams, currency } = project;
    const items: string[] = [];

    // Add products
    revenueStreams.products.forEach((product) => {
      const priceText = product.price === 0 ? 'Free' : formatCurrency(product.price, currency);
      const salesText = product.sales
        ? `${product.sales.volume} ${product.sales.period === 'monthly' ? 'monthly' : 'daily'} sales`
        : 'No sales data';
      const margin = formatProfitMargin(calculateProfitMargin(product));

      items.push(`${product.name} • ${priceText} • ${salesText} • ${margin} margin`);
    });

    // Add subscriptions
    (revenueStreams.subscriptions || []).forEach((subscription) => {
      const priceText = subscription.price === 0 ? 'Free' : formatCurrency(subscription.price, currency);
      const subscribersText = `${subscription.subscribers} subscriber${subscription.subscribers !== 1 ? 's' : ''}`;
      const margin = formatProfitMargin(calculateSubscriptionProfitMargin(subscription));

      items.push(`${subscription.name} • ${priceText}/mo • ${subscribersText} • ${margin} margin`);
    });

    return items;
  }, [project]);

  const sections = useMemo(() => {
    const baseSections = createCanvasSections(placeholder);
    if (!project) {
      return baseSections;
    }

    return baseSections.map((section) => {
      if (section.id === 'cost-structure') {
        return { ...section, items: costStructureItems };
      }
      if (section.id === 'revenue-streams') {
        return { ...section, items: revenueStreamsItems };
      }
      return section;
    });
  }, [placeholder, project, costStructureItems, revenueStreamsItems]);
  const sectionMap = useMemo(() => {
    return sections.reduce<Record<string, CanvasSection>>((acc, section) => {
      acc[section.id] = section;
      return acc;
    }, {});
  }, [sections]);

  const handleTabChange = (value: string) => {
    if (value === 'profitability' && projectId) {
      router.push(`/projects/${projectId}/playground`);
    }
  };

  const handleUpdateSection = (
    sectionId:
      | 'partnerships'
      | 'activities'
      | 'resources'
      | 'valueProposition'
      | 'customerRelationships'
      | 'channels'
      | 'customerSegments',
    items: CanvasItem[],
  ) => {
    if (!project) return;

    const updatedProject = {
      ...project,
      [sectionId]: items,
    };
    projectStorage.updateProject(updatedProject);
    refreshProject();
  };

  // Cost handlers
  const handleAddCost = () => {
    setEditingCost(undefined);
    setCostDialogType('operating');
    // Clear any prefill values
    setPrefillName(undefined);
    setPrefillAmount(undefined);
    setPrefillFrequency(undefined);
    setPrefillCategory(undefined);
    setCostDialogOpen(true);
  };

  const handleAISuggestions = () => {
    setAiSuggestionsOpen(true);
  };

  const handleAddCostFromAI = (data: {
    name: string;
    costType: 'upfront' | 'operating';
    categoryId?: string;
    amount?: number;
    frequency?: 'monthly' | 'annual';
  }) => {
    setEditingCost(undefined);
    setCostDialogType(data.costType);
    setPrefillName(data.name);
    setPrefillAmount(data.amount !== undefined ? String(data.amount) : undefined);
    setPrefillFrequency(data.frequency);
    setPrefillCategory(data.categoryId);
    setCostDialogOpen(true);
  };

  const handleEditCost = (cost: FixedCost | UpfrontCost, type: 'upfront' | 'operating') => {
    setEditingCost(cost);
    setCostDialogType(type);
    // Clear prefill values when editing
    setPrefillName(undefined);
    setPrefillAmount(undefined);
    setPrefillFrequency(undefined);
    setPrefillCategory(undefined);
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
        // Cost type changed - delete from old, create in new
        if (wasUpfront && !isUpfront) {
          upfrontCostStorage.deleteUpfrontCost(projectId, editingCost.id);
          fixedCostStorage.createFixedCost(
            projectId,
            data.name,
            data.amount,
            data.frequency!,
            data.category!
          );
        } else {
          fixedCostStorage.deleteFixedCost(projectId, editingCost.id);
          upfrontCostStorage.createUpfrontCost(projectId, data.name, data.amount);
        }
      } else if (isEditMode) {
        // Same type - update
        if (isUpfront) {
          const updatedCost: UpfrontCost = {
            ...editingCost as UpfrontCost,
            name: data.name,
            amount: data.amount,
          };
          upfrontCostStorage.updateUpfrontCost(projectId, updatedCost);
        } else {
          const updatedCost: FixedCost = {
            ...editingCost as FixedCost,
            name: data.name,
            amount: data.amount,
            frequency: data.frequency!,
            category: data.category!,
          };
          fixedCostStorage.updateFixedCost(projectId, updatedCost);
        }
      } else {
        // Create new
        if (isUpfront) {
          upfrontCostStorage.createUpfrontCost(projectId, data.name, data.amount);
        } else {
          fixedCostStorage.createFixedCost(
            projectId,
            data.name,
            data.amount,
            data.frequency!,
            data.category!
          );
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

  // Product handlers
  const handleAddProduct = () => {
    setEditingProduct(undefined);
    setEditingSubscription(undefined);
    setProductDialogOpen(true);
    setSubscriptionDialogOpen(false); // Ensure subscription dialog is closed
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setEditingSubscription(undefined); // Clear subscription when editing product
    setProductDialogOpen(true);
    setSubscriptionDialogOpen(false); // Ensure subscription dialog is closed
  };

  const handleSaveProduct = (name: string, price: number, associatedCosts: AssociatedCost[], sales: ProductSales) => {
    if (!projectId) return;

    setIsProductSubmitting(true);
    try {
      if (editingProduct) {
        // Update existing product
        const updatedProduct: Product = {
          ...editingProduct,
          name,
          price,
          associatedCosts,
          sales,
        };
        productStorage.updateProduct(updatedProduct, projectId);
      } else {
        // Create new product
        const newProduct: Product = {
          id: crypto.randomUUID(),
          name,
          price,
          associatedCosts,
          sales,
          projectId,
        };
        productStorage.createProduct(newProduct, projectId);
      }

      refreshProject();
      setProductDialogOpen(false);
      setSubscriptionDialogOpen(false);
      setEditingProduct(undefined);
    } finally {
      setIsProductSubmitting(false);
    }
  };

  const handleDeleteProduct = () => {
    if (!editingProduct || !projectId) return;

    productStorage.deleteProduct(editingProduct.id, projectId);
    refreshProject();
    setProductDialogOpen(false);
    setEditingProduct(undefined);
  };

  // Subscription handlers
  const handleEditSubscription = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setEditingProduct(undefined); // Clear product when editing subscription
    setSubscriptionDialogOpen(true);
    setProductDialogOpen(false); // Ensure product dialog is closed
  };

  const handleSaveSubscription = (name: string, price: number, pricePeriod: 'monthly' | 'annual', subscribers: number, associatedCosts: AssociatedCost[]) => {
    if (!projectId) return;

    setIsSubscriptionSubmitting(true);
    try {
      if (editingSubscription) {
        const updatedSubscription: Subscription = {
          ...editingSubscription,
          name,
          price,
          pricePeriod,
          subscribers,
          associatedCosts,
        };
        subscriptionStorage.updateSubscription(updatedSubscription, projectId);
      } else {
        const newSubscription: Subscription = {
          id: crypto.randomUUID(),
          name,
          price,
          pricePeriod,
          subscribers,
          associatedCosts,
          projectId,
        };
        subscriptionStorage.createSubscription(newSubscription, projectId);
      }

      refreshProject();
      setProductDialogOpen(false);
      setSubscriptionDialogOpen(false);
      setEditingSubscription(undefined);
    } finally {
      setIsSubscriptionSubmitting(false);
    }
  };

  const handleDeleteSubscription = () => {
    if (!editingSubscription || !projectId) return;

    subscriptionStorage.deleteSubscription(editingSubscription.id, projectId);
    refreshProject();
    setSubscriptionDialogOpen(false);
    setEditingSubscription(undefined);
  };

  const isMobile = useMediaQuery('(max-width: 768px)');

  // Track if the generation panel is actually expanded (for layout purposes)
  const isPanelExpanded = showGenerationSheet && !isMobile;

  return (
    <section className="relative h-full flex flex-col">
      {/* AI Chat Side Panel - Fixed position */}
      {project && projectId && chatHistoryLoaded && (
        <CanvasGenerationSheet
          projectId={projectId}
          project={project}
          currency={project.currency}
          initialPrompt={initialPrompt}
          isInitialGeneration={isInitialGeneration}
          onProjectChange={handleProjectChange}
          onClose={() => {
            setShowGenerationSheet(false);
            setIsInitialGeneration(false);
          }}
          isOpen={showGenerationSheet}
          onOpenChange={(open) => {
            if (!open) {
              setShowGenerationSheet(false);
              setIsInitialGeneration(false);
            }
          }}
          initialMessages={chatHistory}
        />
      )}
        
      {/* Main Content Area - shifts right when panel is open */}
      <div className={cn(
        "transition-all duration-300 ease-in-out flex-1 min-h-0 flex flex-col",
        isPanelExpanded && "ml-[360px]"
      )}>
          <div className="mx-auto flex flex-1 min-h-0 flex-col gap-6 pb-8 md:w-full">
            <Tabs value="business-model" onValueChange={handleTabChange} className="self-center items-center w-full lg:h-full">
              <div className="relative flex flex-col md:flex-row md:items-center pt-2 md:pt-0 w-full gap-3 md:gap-0">
                <Button className="h-8 w-full md:w-auto rounded-lg bg-blue-700 text-white font-hero font-semibold relative z-10" onClick={() => setShowGenerationSheet(!showGenerationSheet)}>
                  <PanelLeft className="h-4 w-4" />
                  AI Assistant
                </Button>
                <div className="w-full md:absolute md:left-1/2 md:-translate-x-1/2 flex justify-center md:z-0">
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
            <TabsContent value="business-model" className="mt-6 outline-none w-full flex-1 min-h-[600px] flex flex-col">
                {/* 10-column, 3-row grid layout matching CanvasPreview on desktop, 1 column stack on mobile */}
                {/* Height constraint: flex-1 min-h-0 makes this fill available height from parent TabsContent */}
                {/* Grid rows derive equal height from the constrained grid container via grid-rows-3 */}
                <div className="grid grid-cols-1 lg:grid-cols-10 lg:grid-rows-3 gap-1 flex-1 auto-rows-fr min-h-[1400px] lg:min-h-0">
                  {/* Row 1-2: Partnerships - col 1-2, row 1-2 (double height) */}
                  <div className="lg:col-start-1 lg:col-span-2 lg:row-start-1 lg:row-span-2">
                    {project ? (
                      <CanvasSectionEditableCard
                        title="Partnerships"
                        icon={Link}
                        items={project.partnerships ?? []}
                        onUpdate={(items) => handleUpdateSection('partnerships', items)}
                        className="h-[300px] lg:h-full min-h-[200px]"
                        itemLabel="partnership"
                      />
                    ) : (
                      <CanvasSectionCard section={sectionMap['partnerships']!} className="h-[300px] lg:h-full min-h-[200px]" />
                    )}
                  </div>
                  
                  {/* Row 1: Activities - col 3-4, row 1 */}
                  <div className="lg:col-start-3 lg:col-span-2 lg:row-start-1">
                    {project ? (
                      <CanvasSectionEditableCard
                        title="Activities"
                        icon={Zap}
                        items={project.activities ?? []}
                        onUpdate={(items) => handleUpdateSection('activities', items)}
                        className="h-[300px] lg:h-full min-h-[200px]"
                        itemLabel="activity"
                      />
                    ) : (
                      <CanvasSectionCard section={sectionMap['activities']!} className="h-[300px] lg:h-full min-h-[200px]" />
                    )}
                  </div>
                  
                  {/* Row 2: Resources - col 3-4, row 2 */}
                  <div className="lg:col-start-3 lg:col-span-2 lg:row-start-2">
                    {project ? (
                      <CanvasSectionEditableCard
                        title="Resources"
                        icon={Factory}
                        items={project.resources ?? []}
                        onUpdate={(items) => handleUpdateSection('resources', items)}
                        className="h-[300px] lg:h-full min-h-[200px]"
                        itemLabel="resource"
                      />
                    ) : (
                      <CanvasSectionCard section={sectionMap['resources']!} className="h-[300px] lg:h-full min-h-[200px]" />
                    )}
                  </div>
                  
                  {/* Row 1-2: Value Proposition - col 5-6, row 1-2 (double height) */}
                  <div className="lg:col-start-5 lg:col-span-2 lg:row-start-1 lg:row-span-2">
                    {project ? (
                      <CanvasSectionEditableCard
                        title="Value Proposition"
                        icon={Gift}
                        items={project.valueProposition ?? []}
                        onUpdate={(items) => handleUpdateSection('valueProposition', items)}
                        className="h-[300px] lg:h-full min-h-[200px]"
                        itemLabel="value proposition"
                      />
                    ) : (
                      <CanvasSectionCard section={sectionMap['value-proposition']!} className="h-[300px] lg:h-full min-h-[200px]" />
                    )}
                  </div>
                  
                  {/* Row 1: Customer Relationships - col 7-8, row 1 */}
                  <div className="lg:col-start-7 lg:col-span-2 lg:row-start-1">
                    {project ? (
                      <CanvasSectionEditableCard
                        title="Customer Relationships"
                        icon={Heart}
                        items={project.customerRelationships ?? []}
                        onUpdate={(items) => handleUpdateSection('customerRelationships', items)}
                        className="h-[300px] lg:h-full min-h-[200px]"
                        itemLabel="customer relationship"
                      />
                    ) : (
                      <CanvasSectionCard section={sectionMap['customer-relationships']!} className="h-[300px] lg:h-full min-h-[200px]" />
                    )}
                  </div>
                  
                  {/* Row 2: Channels - col 7-8, row 2 */}
                  <div className="lg:col-start-7 lg:col-span-2 lg:row-start-2">
                    {project ? (
                      <CanvasSectionEditableCard
                        title="Channels"
                        icon={Truck}
                        items={project.channels ?? []}
                        onUpdate={(items) => handleUpdateSection('channels', items)}
                        className="h-[300px] lg:h-full min-h-[200px]"
                        itemLabel="channel"
                      />
                    ) : (
                      <CanvasSectionCard section={sectionMap['channels']!} className="h-[300px] lg:h-full min-h-[200px]" />
                    )}
                  </div>
                  
                  {/* Row 1-2: Customer Segments - col 9-10, row 1-2 (double height) */}
                  <div className="lg:col-start-9 lg:col-span-2 lg:row-start-1 lg:row-span-2">
                    {project ? (
                      <CanvasSectionEditableCard
                        title="Customer Segments"
                        icon={SquareUserRound}
                        items={project.customerSegments ?? []}
                        onUpdate={(items) => handleUpdateSection('customerSegments', items)}
                        className="h-[300px] lg:h-full min-h-[200px]"
                        itemLabel="customer segment"
                      />
                    ) : (
                      <CanvasSectionCard section={sectionMap['customer-segments']!} className="h-[300px] lg:h-full min-h-[200px]" />
                    )}
                  </div>
                  
                  {/* Row 3: Cost Structure - col 1-5 */}
                  <div className="lg:col-start-1 lg:col-span-5 lg:row-start-3">
                    {project ? (
                      <CostStructureCard
                        className="h-[300px] lg:h-full min-h-[200px]"
                        operatingCosts={project.costStructure.fixedRunningCosts}
                        upfrontCosts={project.costStructure.upfrontCosts ?? []}
                        currency={project.currency}
                        onEditCost={handleEditCost}
                        onAddCost={handleAddCost}
                        onAISuggestions={handleAISuggestions}
                      />
                    ) : (
                      <CanvasSectionCard section={sectionMap['cost-structure']!} className="h-[300px] lg:h-full min-h-[200px]" />
                    )}
                  </div>
                  
                  {/* Row 3: Revenue Streams - col 6-10 */}
                  <div className="lg:col-start-6 lg:col-span-5 lg:row-start-3">
                    {project ? (
                      <RevenueStreamsCard
                        className="h-[300px] lg:h-full min-h-[200px]"
                        products={project.revenueStreams.products}
                        subscriptions={project.revenueStreams.subscriptions || []}
                        currency={project.currency}
                        onEditProduct={handleEditProduct}
                        onEditSubscription={handleEditSubscription}
                        onAddProduct={handleAddProduct}
                      />
                    ) : (
                      <CanvasSectionCard section={sectionMap['revenue-streams']!} className="h-[300px] lg:h-full min-h-[200px]" />
                    )}
                  </div>
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
            prefillName={prefillName}
            prefillAmount={prefillAmount}
            prefillFrequency={prefillFrequency}
            categoryPreselected={prefillCategory}
          />
        )}

        {/* AI Suggestions Sheet */}
        <CanvasAISuggestionsSheet
          open={aiSuggestionsOpen}
          onOpenChange={setAiSuggestionsOpen}
          onAddCost={handleAddCostFromAI}
        />

        {/* Revenue Stream Dialog - handles both products and subscriptions */}
        {project && (
          <RevenueStreamDialog
            open={productDialogOpen || subscriptionDialogOpen}
            onOpenChange={(open) => {
              if (!open) {
                setProductDialogOpen(false);
                setSubscriptionDialogOpen(false);
              }
            }}
            product={editingProduct}
            subscription={editingSubscription}
            currency={project.currency}
            onSaveProduct={handleSaveProduct}
            onSaveSubscription={handleSaveSubscription}
            isSubmitting={isProductSubmitting || isSubscriptionSubmitting}
            onDelete={
              editingProduct ? handleDeleteProduct : 
              editingSubscription ? handleDeleteSubscription : 
              undefined
            }
          />
        )}
      </div>
    </section>
  );
}

