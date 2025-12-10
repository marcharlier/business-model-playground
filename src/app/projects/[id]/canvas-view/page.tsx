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
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils/currency';
import { calculateProfitMargin, formatProfitMargin } from '@/lib/utils/financial';
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
import type { CanvasGeneration } from '@/app/api/ai/generate-canvas/schema';
import { generateUUID } from '@/lib/utils';
import { CostDialog } from '@/components/costs/CostDialog';
import { ProductDialog } from '@/components/products/ProductDialog';
import { projectStorage } from '@/lib/storage/projectStorage';
import { fixedCostStorage } from '@/lib/storage/fixedCostStorage';
import { upfrontCostStorage } from '@/lib/storage/upfrontCostStorage';
import { productStorage } from '@/lib/storage/productStorage';
import type { CanvasItem } from '@/lib/domain/types';
import type { FixedCost, UpfrontCost, Product, AssociatedCost, ProductSales } from '@/lib/storage/types';
import type { CostFormData } from '@/components/costs/CostForm';

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
                  className="flex items-center justify-between rounded-lg bg-muted/80 px-1 py-1 text-xs font-medium text-muted-foreground"
                >
                  <span className="truncate">{item}</span>
                  <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
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

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export default function CanvasViewPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const projectId = params?.id as string | undefined;
  const { project, refreshProject } = useProject();

  // AI generation state from URL params
  const isGenerating = searchParams.get('generating') === 'true';
  const generationPromptFromUrl = searchParams.get('prompt') ?? '';
  const [showGenerationSheet, setShowGenerationSheet] = useState(false);
  const [storedPrompt, setStoredPrompt] = useState<string>('');
  // Track if we just completed generation (to prevent immediate switch to viewOnly)
  const [justCompletedGeneration, setJustCompletedGeneration] = useState(false);

  // Initialize generation sheet when URL params are present
  useEffect(() => {
    if (isGenerating && generationPromptFromUrl && !showGenerationSheet) {
      const decodedPrompt = decodeURIComponent(generationPromptFromUrl);
      setStoredPrompt(decodedPrompt);
      setShowGenerationSheet(true);
      setJustCompletedGeneration(false); // Reset when starting new generation
      // Clear URL params to prevent re-triggering on refresh
      router.replace(`/projects/${projectId}/canvas-view`, { scroll: false });
    }
  }, [isGenerating, generationPromptFromUrl, showGenerationSheet, router, projectId]);

  // Check if project was AI-generated
  const aiGeneratedPrompt = project?.aiGeneratedFromPrompt ?? null;

  // Handle streaming updates from AI generation
  const handleGenerationUpdate = useCallback((data: DeepPartial<CanvasGeneration>) => {
    if (!project || !projectId) return;

    // Convert string arrays to CanvasItem arrays, filtering out undefined values
    const toCanvasItems = (items: (string | undefined)[] | undefined) => 
      items?.filter((text): text is string => typeof text === 'string').map(text => ({ id: generateUUID(), text })) ?? [];

    const updatedProject = {
      ...project,
      partnerships: data.partnerships ? toCanvasItems(data.partnerships) : project.partnerships,
      activities: data.activities ? toCanvasItems(data.activities) : project.activities,
      resources: data.resources ? toCanvasItems(data.resources) : project.resources,
      valueProposition: data.valueProposition ? toCanvasItems(data.valueProposition) : project.valueProposition,
      customerRelationships: data.customerRelationships ? toCanvasItems(data.customerRelationships) : project.customerRelationships,
      channels: data.channels ? toCanvasItems(data.channels) : project.channels,
      customerSegments: data.customerSegments ? toCanvasItems(data.customerSegments) : project.customerSegments,
    };

    projectStorage.updateProject(updatedProject);
    refreshProject();
  }, [project, projectId, refreshProject]);

  // Handle generation completion
  const handleGenerationComplete = useCallback((data: CanvasGeneration) => {
    if (!project || !projectId) return;

    // Convert string arrays to CanvasItem arrays
    const toCanvasItems = (items: string[]) => 
      items.map(text => ({ id: generateUUID(), text }));

    // Convert generated upfront costs to the correct format
    const upfrontCosts: UpfrontCost[] = (data.upfrontCosts ?? []).map(cost => ({
      id: generateUUID(),
      name: cost.name,
      amount: cost.amount,
      projectId,
    }));

    // Convert generated running costs to the correct format
    const fixedRunningCosts: FixedCost[] = (data.runningCosts ?? []).map(cost => ({
      id: generateUUID(),
      name: cost.name,
      amount: cost.amount,
      frequency: cost.frequency,
      category: cost.category,
      projectId,
    }));

    // Convert generated products to the correct format
    const products: Product[] = (data.products ?? []).map(product => ({
      id: generateUUID(),
      name: product.name,
      price: product.price,
      associatedCosts: [],
      projectId,
      sales: {
        volume: product.salesVolume,
        period: product.salesPeriod,
      },
    }));

    const updatedProject = {
      ...project,
      name: data.projectName,
      // Store the original prompt in description (user-typed content, no marker needed)
      description: storedPrompt || project.description,
      // Track that this project was AI-generated and store the original prompt
      aiGeneratedFromPrompt: storedPrompt || undefined,
      partnerships: toCanvasItems(data.partnerships),
      activities: toCanvasItems(data.activities),
      resources: toCanvasItems(data.resources),
      valueProposition: toCanvasItems(data.valueProposition),
      customerRelationships: toCanvasItems(data.customerRelationships),
      channels: toCanvasItems(data.channels),
      customerSegments: toCanvasItems(data.customerSegments),
      // Add the generated costs and products
      costStructure: {
        fixedRunningCosts,
        upfrontCosts,
      },
      revenueStreams: {
        products,
      },
    };

    projectStorage.updateProject(updatedProject);
    refreshProject();
    // Mark that we just completed generation (prevents immediate switch to viewOnly)
    setJustCompletedGeneration(true);
  }, [project, projectId, refreshProject, storedPrompt]);

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

    return revenueStreams.products.map((product) => {
      const priceText = product.price === 0 ? 'Free' : formatCurrency(product.price, currency);
      const salesText = product.sales
        ? `${product.sales.volume} ${product.sales.period === 'monthly' ? 'monthly' : 'daily'} sales`
        : 'No sales data';
      const margin = formatProfitMargin(calculateProfitMargin(product));

      return `${product.name} • ${priceText} • ${salesText} • ${margin} margin`;
    });
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
    setProductDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductDialogOpen(true);
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

  // Track if the generation panel is actually expanded (for layout purposes)
  const isPanelExpanded = showGenerationSheet;

  return (
    <section className="relative h-full flex flex-col">
      {/* AI Canvas Generation Side Panel - Fixed position */}
      {project && (
        <CanvasGenerationSheet
          prompt={storedPrompt}
          currency={project.currency}
          onUpdate={handleGenerationUpdate}
          onComplete={handleGenerationComplete}
          viewOnly={!!aiGeneratedPrompt && !isGenerating && !justCompletedGeneration}
          onClose={() => {
            setShowGenerationSheet(false);
            setJustCompletedGeneration(false);
          }}
          isOpen={showGenerationSheet}
          onOpenChange={(open) => {
            if (!open) {
              setShowGenerationSheet(false);
              setJustCompletedGeneration(false);
            }
          }}
        />
      )}
        
      {/* Main Content Area - shifts right when panel is open */}
      <div className={cn(
        "transition-all duration-300 ease-in-out flex-1 min-h-0 flex flex-col",
        isPanelExpanded && "ml-[360px]"
      )}>
          <div className="mx-auto flex flex-1 min-h-0 flex-col gap-6 pb-8">
            <Tabs value="business-model" onValueChange={handleTabChange} className="self-center items-center w-full lg:h-full">
              <div className="flex items-center justify-center gap-4">
                <TabsList className="grid min-w-[280px] grid-cols-2 rounded-full bg-background shadow-sm">
                  <TabsTrigger value="business-model" className="rounded-full text-sm font-medium">
                    Business Model
                  </TabsTrigger>
                  <TabsTrigger value="profitability" className="rounded-full text-sm font-medium">
                    Profitability Playground
                  </TabsTrigger>
                </TabsList>
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
                        currency={project.currency}
                        onEditProduct={handleEditProduct}
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

        {/* Product Dialog */}
        {project && (
          <ProductDialog
            open={productDialogOpen}
            onOpenChange={setProductDialogOpen}
            product={editingProduct}
            currency={project.currency}
            onSave={handleSaveProduct}
            isSubmitting={isProductSubmitting}
            onDelete={editingProduct ? handleDeleteProduct : undefined}
          />
        )}
      </div>
    </section>
  );
}

