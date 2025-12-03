'use client';

import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
import { projectStorage } from '@/lib/storage/projectStorage';
import type { CanvasItem } from '@/lib/domain/types';

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

export default function CanvasViewPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.id as string | undefined;
  const { project, refreshProject } = useProject();

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
      router.push(`/projects/${projectId}/dashboard`);
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

  return (
    <section className="relative">
      <div className="rounded-sm border border-border/60 bg-secondary px-4 py-6 shadow-sm sm:px-6 lg:px-10">
        <div className="mx-auto flex w-full flex-col gap-6">
          <Tabs value="business-model" onValueChange={handleTabChange} className="self-center items-center w-full">
            <TabsList className="grid min-w-[280px] grid-cols-2 rounded-full bg-background shadow-sm">
              <TabsTrigger value="business-model" className="rounded-full text-sm font-medium">
                Business Model
              </TabsTrigger>
              <TabsTrigger value="profitability" className="rounded-full text-sm font-medium">
                Profitability Playground
              </TabsTrigger>
            </TabsList>
            <TabsContent value="business-model" className="mt-6 outline-none w-full">
                <div className="space-y-4">
                 <div className="grid grid-cols-1 gap-4 lg:h-96 lg:grid-cols-5 lg:auto-rows-[minmax(0,1fr)]">
                  <div className="row-span-2 h-full">
                    {project ? (
                      <CanvasSectionEditableCard
                        title="Partnerships"
                        icon={Link}
                        items={project.partnerships ?? []}
                        onUpdate={(items) => handleUpdateSection('partnerships', items)}
                        className="h-full"
                        itemLabel="partnership"
                      />
                    ) : (
                      <CanvasSectionCard section={sectionMap['partnerships']!} className="h-full" />
                    )}
                  </div>
                  <div className="flex lg:h-96 flex-col gap-4">
                    {project ? (
                      <CanvasSectionEditableCard
                        title="Activities"
                        icon={Zap}
                        items={project.activities ?? []}
                        onUpdate={(items) => handleUpdateSection('activities', items)}
                        className="flex-1 min-h-0"
                        itemLabel="activity"
                      />
                    ) : (
                      <CanvasSectionCard section={sectionMap['activities']!} className="flex-1 min-h-0" />
                    )}
                    {project ? (
                      <CanvasSectionEditableCard
                        title="Resources"
                        icon={Factory}
                        items={project.resources ?? []}
                        onUpdate={(items) => handleUpdateSection('resources', items)}
                        className="flex-1 min-h-0"
                        itemLabel="resource"
                      />
                    ) : (
                      <CanvasSectionCard section={sectionMap['resources']!} className="flex-1 min-h-0" />
                    )}
                  </div>
                  <div className="row-span-2 h-full">
                    {project ? (
                      <CanvasSectionEditableCard
                        title="Value Proposition"
                        icon={Gift}
                        items={project.valueProposition ?? []}
                        onUpdate={(items) => handleUpdateSection('valueProposition', items)}
                        className="h-full"
                        itemLabel="value proposition"
                      />
                    ) : (
                      <CanvasSectionCard section={sectionMap['value-proposition']!} className="h-full" />
                    )}
                  </div>
                  <div className="flex h-96 flex-col gap-4">
                    {project ? (
                      <CanvasSectionEditableCard
                        title="Customer Relationships"
                        icon={Heart}
                        items={project.customerRelationships ?? []}
                        onUpdate={(items) => handleUpdateSection('customerRelationships', items)}
                        className="flex-1 min-h-0"
                        itemLabel="customer relationship"
                      />
                    ) : (
                      <CanvasSectionCard section={sectionMap['customer-relationships']!} className="flex-1 min-h-0" />
                    )}
                    {project ? (
                      <CanvasSectionEditableCard
                        title="Channels"
                        icon={Truck}
                        items={project.channels ?? []}
                        onUpdate={(items) => handleUpdateSection('channels', items)}
                        className="flex-1 min-h-0"
                        itemLabel="channel"
                      />
                    ) : (
                      <CanvasSectionCard section={sectionMap['channels']!} className="flex-1 min-h-0" />
                    )}
                  </div>
                  <div className="row-span-2 h-full">
                    {project ? (
                      <CanvasSectionEditableCard
                        title="Customer Segments"
                        icon={SquareUserRound}
                        items={project.customerSegments ?? []}
                        onUpdate={(items) => handleUpdateSection('customerSegments', items)}
                        className="h-full"
                        itemLabel="customer segment"
                      />
                    ) : (
                      <CanvasSectionCard section={sectionMap['customer-segments']!} className="h-full" />
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <CanvasSectionCard section={sectionMap['cost-structure']!} className="h-72" />
                  <CanvasSectionCard section={sectionMap['revenue-streams']!} />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
}

