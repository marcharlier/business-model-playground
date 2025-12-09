'use client';

import { useMemo } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { useProject } from '@/lib/context/ProjectContext';
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { costIdeasSchema, type CostIdea } from '@/app/api/ai/cost-ideas/schema';
import { useDailyRateLimit, DAILY_AI_LIMIT } from '@/hooks/use-daily-rate-limit';
import { CheckCircle2, Circle, FileText, LayoutGrid } from 'lucide-react';

interface CanvasAISuggestionsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddCost?: (data: {
    name: string;
    costType: 'upfront' | 'operating';
    categoryId?: string;
    amount?: number;
    frequency?: 'monthly' | 'annual';
  }) => void;
}

interface ContextCheckResult {
  hasDescription: boolean;
  hasValueProposition: boolean;
  hasCustomerSegments: boolean;
  hasActivities: boolean;
  hasResources: boolean;
  canvasItemCount: number;
  isReady: boolean;
}

function useContextCheck(project: ReturnType<typeof useProject>['project']): ContextCheckResult {
  return useMemo(() => {
    if (!project) {
      return {
        hasDescription: false,
        hasValueProposition: false,
        hasCustomerSegments: false,
        hasActivities: false,
        hasResources: false,
        canvasItemCount: 0,
        isReady: false,
      };
    }

    const hasDescription = !!(project.description && project.description.trim().length > 10);
    const hasValueProposition = (project.valueProposition ?? []).length > 0;
    const hasCustomerSegments = (project.customerSegments ?? []).length > 0;
    const hasActivities = (project.activities ?? []).length > 0;
    const hasResources = (project.resources ?? []).length > 0;

    const canvasItemCount = [
      project.partnerships ?? [],
      project.activities ?? [],
      project.valueProposition ?? [],
      project.customerRelationships ?? [],
      project.customerSegments ?? [],
      project.resources ?? [],
      project.channels ?? [],
    ].reduce((sum, arr) => sum + arr.length, 0);

    // Ready if: has description OR has at least 2 canvas items
    const isReady = hasDescription || canvasItemCount >= 2;

    return {
      hasDescription,
      hasValueProposition,
      hasCustomerSegments,
      hasActivities,
      hasResources,
      canvasItemCount,
      isReady,
    };
  }, [project]);
}

export function CanvasAISuggestionsSheet({
  open,
  onOpenChange,
  onAddCost,
}: CanvasAISuggestionsSheetProps) {
  const { project, isLoading: isProjectLoading } = useProject();
  const usage = useDailyRateLimit('ai-features', DAILY_AI_LIMIT);
  const contextCheck = useContextCheck(project);

  const { object, submit, isLoading, error, stop } = useObject({
    api: '/api/ai/cost-ideas',
    schema: costIdeasSchema,
  });

  function buildProjectPayload() {
    if (!project) return null;
    return {
      name: project.name,
      description: project.description ?? '',
      currency: project.currency,
      fixedCosts: project.costStructure.fixedRunningCosts.map((c) => ({
        name: c.name,
        amount: c.amount,
        frequency: c.frequency,
        category: c.category,
      })),
      upfrontCosts: project.costStructure.upfrontCosts.map((c) => ({
        name: c.name,
        amount: c.amount,
      })),
      products: project.revenueStreams.products.map((p) => ({
        name: p.name,
        price: p.price,
        salesVolume: p.sales?.volume,
        salesPeriod: p.sales?.period,
      })),
      // Include all canvas sections
      partnerships: project.partnerships ?? [],
      activities: project.activities ?? [],
      valueProposition: project.valueProposition ?? [],
      customerRelationships: project.customerRelationships ?? [],
      customerSegments: project.customerSegments ?? [],
      resources: project.resources ?? [],
      channels: project.channels ?? [],
    };
  }

  const items: Array<Partial<CostIdea>> = Array.isArray(object?.costIdeas)
    ? (object!.costIdeas as Array<Partial<CostIdea>>)
    : [];

  // Checklist items for when context is insufficient
  const checklistItems = [
    {
      label: 'Add a project description',
      hint: 'Describe what your business does in a few sentences',
      checked: contextCheck.hasDescription,
      icon: FileText,
    },
    {
      label: 'Define your value proposition',
      hint: 'What unique value do you offer to customers?',
      checked: contextCheck.hasValueProposition,
      icon: LayoutGrid,
    },
    {
      label: 'Identify customer segments',
      hint: 'Who are your target customers?',
      checked: contextCheck.hasCustomerSegments,
      icon: LayoutGrid,
    },
    {
      label: 'List key activities',
      hint: 'What activities are essential to deliver your value?',
      checked: contextCheck.hasActivities,
      icon: LayoutGrid,
    },
    {
      label: 'Identify key resources',
      hint: 'What resources do you need to operate?',
      checked: contextCheck.hasResources,
      icon: LayoutGrid,
    },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[520px]">
        <SheetHeader className="pb-2 border-b">
          <SheetTitle>AI cost suggestions</SheetTitle>
          <SheetDescription>
            {contextCheck.isReady
              ? 'Identify costs you might want to consider for launching your business.'
              : 'Help the AI understand your business idea first.'}
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-6rem)] sm:pr-4">
          <div className="space-y-4 py-4">
            {!contextCheck.isReady ? (
              // Show checklist when context is insufficient
              <div className="space-y-4">
                <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/50 p-4">
                  <p className="text-sm text-amber-800 dark:text-amber-200 font-medium mb-2">
                    Add more to your business idea
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    To generate useful cost suggestions, please add a description or fill out more of the business model canvas. This helps the AI understand your specific business context.
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground mb-3">
                    Complete at least one of these:
                  </p>
                  {checklistItems.map((item, index) => {
                    const Icon = item.checked ? CheckCircle2 : Circle;
                    return (
                      <div
                        key={index}
                        className={`flex items-start gap-3 rounded-lg p-3 transition-colors ${
                          item.checked
                            ? 'bg-green-50 dark:bg-green-950/30'
                            : 'bg-muted/50'
                        }`}
                      >
                        <Icon
                          className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                            item.checked
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-muted-foreground'
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-medium ${
                              item.checked
                                ? 'text-green-700 dark:text-green-300'
                                : 'text-foreground'
                            }`}
                          >
                            {item.label}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {item.hint}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <p className="text-xs text-muted-foreground text-center pt-2">
                  Close this panel and add more context to your project, then come back.
                </p>
              </div>
            ) : (
              // Show AI generation UI when context is sufficient
              <>
                <div className="text-xs text-muted-foreground">
                  {usage.count}/{usage.limit} today • {usage.remaining} left • resets{' '}
                  {usage.resetIn}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => {
                      const payload = buildProjectPayload();
                      if (!payload) return;
                      if (!usage.canUse) return;
                      usage.increment();
                      submit({ project: payload });
                    }}
                    disabled={isLoading || isProjectLoading || !usage.canUse}
                  >
                    Generate suggestions
                  </Button>
                  {isLoading ? (
                    <Button variant="outline" onClick={() => stop?.()}>
                      Stop
                    </Button>
                  ) : null}
                  {!usage.canUse ? (
                    <div className="text-xs text-red-600 ml-2">
                      Daily limit reached. Resets {usage.resetIn}.
                    </div>
                  ) : null}
                  {error ? (
                    <div className="text-sm text-red-600 ml-2">
                      Something went wrong. Please try again.
                    </div>
                  ) : null}
                </div>

                {isLoading ? (
                  <TextShimmer className="text-sm">
                    Analyzing your project and generating ideas…
                  </TextShimmer>
                ) : null}

                {typeof object?.reasoning === 'string' && object.reasoning.trim() ? (
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {object.reasoning}
                  </div>
                ) : null}

                <div className="grid grid-cols-1 gap-3">
                  {items.map((ci, idx) => (
                    <Card key={idx} className="p-1 gap-0 rounded-sm">
                      <CardHeader className="p-2 text-sm">
                        <CardTitle>{ci?.title ?? 'Untitled'}</CardTitle>
                        <CardDescription>
                          {(ci?.category ?? 'uncategorized').toString()} •{' '}
                          {(ci?.kind ?? 'one-time').toString()} •{' '}
                          {ci?.estimate?.currency ?? 'USD'}{' '}
                          {typeof ci?.estimate?.amount === 'number'
                            ? ci.estimate.amount
                            : '-'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-2">
                        <div className="text-sm leading-relaxed mb-2">
                          {ci?.description ?? ''}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              if (!onAddCost) return;
                              const name = (ci?.title ?? '').toString();
                              const amount =
                                typeof ci?.estimate?.amount === 'number'
                                  ? ci.estimate.amount
                                  : undefined;
                              const categoryId = (ci?.category ?? 'other').toString();
                              const costType =
                                ci?.kind === 'monthly' ? 'operating' : 'upfront';
                              const frequency =
                                ci?.kind === 'monthly' ? 'monthly' : undefined;

                              onAddCost({
                                name,
                                costType,
                                categoryId:
                                  costType === 'operating' ? categoryId : undefined,
                                amount,
                                frequency: frequency as 'monthly' | 'annual' | undefined,
                              });
                            }}
                            disabled={isProjectLoading}
                          >
                            {ci?.kind === 'monthly'
                              ? 'Add as operating cost'
                              : 'Add as upfront cost'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
