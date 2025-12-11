'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { Textarea } from '@/components/ui/textarea';
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { canvasGenerationSchema, type CanvasGeneration } from '@/app/api/ai/generate-canvas/schema';
import { useDailyRateLimit, DAILY_AI_LIMIT } from '@/hooks/use-daily-rate-limit';
import {
  CheckCircle2,
  Loader2,
  Sparkles,
  AlertCircle,
  Info,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

interface CanvasGenerationSheetProps {
  prompt: string;
  currency: string;
  onUpdate: (data: DeepPartial<CanvasGeneration>) => void;
  onComplete: (data: CanvasGeneration) => void;
  onError?: (error: Error) => void;
  /** If true, the panel is in view-only mode (showing stored generation info) */
  viewOnly?: boolean;
  /** Callback when panel is closed */
  onClose?: () => void;
  /** Whether the panel is open (controlled externally) */
  isOpen?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
}

type GenerationStatus = 'idle' | 'generating' | 'complete' | 'error';

export function CanvasGenerationSheet({
  prompt,
  currency,
  onUpdate,
  onComplete,
  onError,
  viewOnly = false,
  onClose,
  isOpen: controlledIsOpen,
  onOpenChange,
}: CanvasGenerationSheetProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(true);
  const [status, setStatus] = useState<GenerationStatus>(viewOnly ? 'complete' : 'idle');
  const hasStartedRef = useRef(false);
  const lastObjectRef = useRef<DeepPartial<CanvasGeneration> | undefined>(undefined);

  // Use controlled state if provided, otherwise use internal state
  const isOpen = controlledIsOpen ?? internalIsOpen;

  const usage = useDailyRateLimit('ai-features', DAILY_AI_LIMIT);

  const { object, submit, isLoading, error, stop } = useObject({
    api: '/api/ai/generate-canvas',
    schema: canvasGenerationSchema,
    onFinish: (event) => {
      if (event.object) {
        setStatus('complete');
        onComplete(event.object);
        // Panel stays open to show results - user can close it manually
      } else if (event.error) {
        setStatus('error');
        onError?.(event.error);
      }
    },
    onError: (err) => {
      setStatus('error');
      onError?.(err);
    },
  });

  // Start generation on mount (only if not in viewOnly mode)
  useEffect(() => {
    if (viewOnly) return;
    if (hasStartedRef.current) return;
    if (!prompt || prompt.trim().length < 10) return;
    if (!usage.canUse) {
      // Use setTimeout to avoid synchronous setState in effect
      setTimeout(() => setStatus('error'), 0);
      return;
    }

    hasStartedRef.current = true;
    // Use setTimeout to avoid synchronous setState in effect
    setTimeout(() => setStatus('generating'), 0);
    usage.increment();
    submit({ prompt, currency });
  }, [prompt, currency, submit, usage, viewOnly]);

  // Stream updates to parent
  useEffect(() => {
    if (object && object !== lastObjectRef.current) {
      lastObjectRef.current = object;
      onUpdate(object);
    }
  }, [object, onUpdate]);

  // Update status based on loading state
  useEffect(() => {
    if (isLoading && status !== 'generating') {
      // Use setTimeout to avoid synchronous setState in effect
      setTimeout(() => setStatus('generating'), 0);
    }
  }, [isLoading, status]);

  const handleClose = useCallback(() => {
    if (isLoading) {
      stop?.();
    }
    if (controlledIsOpen !== undefined) {
      // Controlled component - only call onOpenChange
      onOpenChange?.(false);
    } else {
      // Uncontrolled component - update internal state
      setInternalIsOpen(false);
    }
    onClose?.();
  }, [isLoading, stop, onClose, onOpenChange, controlledIsOpen]);

  // Count generated items - canvas sections
  const canvasItemCounts = {
    partnerships: object?.partnerships?.length ?? 0,
    activities: object?.activities?.length ?? 0,
    resources: object?.resources?.length ?? 0,
    valueProposition: object?.valueProposition?.length ?? 0,
    customerRelationships: object?.customerRelationships?.length ?? 0,
    channels: object?.channels?.length ?? 0,
    customerSegments: object?.customerSegments?.length ?? 0,
  };
  
  // Count generated items - costs and revenues
  const financialItemCounts = {
    upfrontCosts: object?.upfrontCosts?.length ?? 0,
    runningCosts: object?.runningCosts?.length ?? 0,
    products: object?.products?.length ?? 0,
  };
  
  const totalCanvasItems = Object.values(canvasItemCounts).reduce((a, b) => a + b, 0);
  const totalFinancialItems = Object.values(financialItemCounts).reduce((a, b) => a + b, 0);
  
  // Check if revenue model doesn't fit product sales
  const hasRevenueModelNote = !!object?.revenueModelNote;

  const activityLog = [
    {
      id: 'idea',
      label: 'Understanding your idea',
      detail: 'Parsing your request and goals.',
      done: status !== 'idle',
    },
    {
      id: 'canvas',
      label: 'Drafting business model canvas',
      detail: 'Partners, activities, resources, relationships, and channels.',
      done: totalCanvasItems > 0,
    },
    {
      id: 'financials',
      label: 'Exploring costs and revenue',
      detail: 'Upfront costs, running costs, and revenue streams.',
      done: totalFinancialItems > 0 || hasRevenueModelNote,
    },
    {
      id: 'naming',
      label: 'Polishing your project name',
      detail: 'Aligning the story around your business.',
      done: !!object?.projectName || status === 'complete',
    },
    {
      id: 'summary',
      label: 'Preparing summary and handoff',
      detail: 'Final checks before sharing the results.',
      done: status === 'complete',
    },
  ];

  const visibleActivityLog =
    status === 'complete'
      ? activityLog
      : (() => {
          const firstIncompleteIndex = activityLog.findIndex((item) => !item.done);
          if (firstIncompleteIndex === -1) return activityLog;
          return activityLog.slice(0, firstIncompleteIndex + 1);
        })();

  const currentAction =
    status === 'complete'
      ? 'Agent ready with your canvas summary'
      : status === 'error'
        ? 'Agent hit an issue — see below'
        : activityLog.find((item) => !item.done)?.label ?? 'Finalizing outputs';

  // Return the side panel content - fixed position below app bar
  return (
    <div
      className={cn(
        'fixed left-0 top-14 bottom-0 w-[360px] z-40',
        'bg-background border-r border-border flex flex-col',
        'transition-transform duration-300 ease-in-out',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      {/* Header */}
      <div className="px-4 py-4 border-b flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            <h2 className="text-normal font-semibold">AI Canvas Generation</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {viewOnly
            ? 'AI tools to help you build your business model'
            : status === 'generating'
              ? 'Analyzing your business idea...'
              : status === 'complete'
                ? 'Generation complete!'
                : status === 'error'
                  ? 'Generation failed'
                  : 'Ready to generate'}
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4">
            {/* Original prompt */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Your idea
              </p>
              <p className="text-sm bg-muted/50 rounded-lg p-3 leading-relaxed">
                {prompt}
              </p>
            </div>

            {/* Rate limit info - only show in non-viewOnly mode */}
            {!viewOnly && (
              <div className="text-xs text-muted-foreground">
                {usage.count}/{usage.limit} generations today
                {!usage.canUse && ` - resets ${usage.resetIn}`}
              </div>
            )}

            {/* View-only mode content */}
            {viewOnly && (
              <div className="space-y-3">
                <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-blue-500" />
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      AI-Generated Project
                    </p>
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    This business model canvas was generated by AI based on your original idea.
                    You can edit any section to refine the model.
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClose}
                  className="w-full"
                >
                  Close panel
                </Button>
              </div>
            )}

            {/* Generation status */}
            {status === 'generating' && (
              <div className="space-y-4">
                <div className="rounded-lg border bg-card p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-500" />
                    <p className="text-xs font-medium text-blue-600 dark:text-blue-300">
                      AI Agent
                    </p>
                  </div>
                  <TextShimmer className="text-base font-semibold leading-relaxed">
                    {currentAction}
                  </TextShimmer>
                  <p className="text-xs text-muted-foreground">
                    Live agentic run. You can let it finish or stop at any time.
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                    Activity log
                  </p>
                  <div className="overflow-hidden rounded-lg border bg-muted/40 divide-y divide-border">
                    {visibleActivityLog.map((item) => (
                      <div key={item.id} className="flex items-start gap-3 px-3 py-2.5">
                        {item.done ? (
                          <div className="mt-0.5 rounded-full bg-green-100 dark:bg-green-900/60 p-1">
                            <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-300" />
                          </div>
                        ) : (
                          <div className="mt-0.5 rounded-full bg-muted p-1">
                            <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium">{item.label}</p>
                            {item.id === 'canvas' && totalCanvasItems > 0 && (
                              <span className="text-[11px] font-semibold text-green-600 dark:text-green-300">
                                {totalCanvasItems} items
                              </span>
                            )}
                            {item.id === 'financials' && totalFinancialItems > 0 && (
                              <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-300">
                                {totalFinancialItems} items
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">{item.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {object?.projectName && (
                  <div className="rounded-lg border bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground font-medium mb-1">
                      Working title
                    </p>
                    <p className="text-sm font-semibold">{object.projectName}</p>
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    stop?.();
                    setStatus('complete');
                    if (object) {
                      onComplete(object as CanvasGeneration);
                    }
                  }}
                  className="w-full"
                >
                  Stop generation
                </Button>
              </div>
            )}

            {/* Completion state - only show after actual generation, not in viewOnly mode */}
            {status === 'complete' && !viewOnly && (
              <div className="space-y-4">
                <div className="rounded-lg border bg-card p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-green-500" />
                    <p className="text-xs font-semibold text-green-700 dark:text-green-300">
                      Agent summary
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <p className="text-sm font-medium">Canvas generated successfully.</p>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    I created {totalCanvasItems} canvas items and {totalFinancialItems}{' '}
                    financial items based on your idea. Everything is synced to your board.
                  </p>
                  <div className="flex flex-wrap gap-2 text-[11px]">
                    <span className="rounded-full bg-green-100 dark:bg-green-900/40 px-3 py-1 font-semibold text-green-700 dark:text-green-200">
                      {totalCanvasItems} canvas details
                    </span>
                    <span className="rounded-full bg-amber-100 dark:bg-amber-900/40 px-3 py-1 font-semibold text-amber-700 dark:text-amber-200">
                      {financialItemCounts.upfrontCosts + financialItemCounts.runningCosts} costs
                    </span>
                    <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-3 py-1 font-semibold text-emerald-700 dark:text-emerald-200">
                      {financialItemCounts.products} revenue ideas
                    </span>
                  </div>
                </div>

                {object?.projectName && (
                  <div className="rounded-lg border bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground font-medium mb-1">
                      Project name
                    </p>
                    <p className="text-sm font-semibold">{object.projectName}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                    Activity log
                  </p>
                  <div className="overflow-hidden rounded-lg border bg-muted/30 divide-y divide-border">
                    {visibleActivityLog.map((item) => (
                      <div key={item.id} className="flex items-start gap-3 px-3 py-2.5">
                        <div className="mt-0.5 rounded-full bg-green-100 dark:bg-green-900/60 p-1">
                          <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-300" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium">{item.label}</p>
                            {item.id === 'canvas' && totalCanvasItems > 0 && (
                              <span className="text-[11px] font-semibold text-green-600 dark:text-green-300">
                                {totalCanvasItems} items
                              </span>
                            )}
                            {item.id === 'financials' && totalFinancialItems > 0 && (
                              <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-300">
                                {totalFinancialItems} items
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">{item.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Revenue model note for non-product-sales businesses */}
                {hasRevenueModelNote && (
                  <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-3 space-y-2 border border-blue-100 dark:border-blue-900/40">
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
                        Revenue Model Note
                      </p>
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">
                      {object?.revenueModelNote}
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Prompt for further edits
                    </p>
                    <span className="text-[11px] text-muted-foreground">Coming soon</span>
                  </div>
                  <Textarea
                    placeholder="Ask the agent to refine a section or adjust numbers..."
                    disabled
                  />
                  <Button disabled size="sm" className="w-full">
                    Send to agent (not yet enabled)
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  {hasRevenueModelNote
                    ? 'Explore the canvas and add revenue streams manually based on the note above.'
                    : 'Explore the canvas and use the Profitability Playground to experiment with pricing.'}
                </p>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClose}
                  className="w-full"
                >
                  Close panel
                </Button>
              </div>
            )}

            {/* Error state */}
            {status === 'error' && (
              <div className="space-y-3">
                <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-4 text-center">
                  <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-red-700 dark:text-red-300">
                    {!usage.canUse
                      ? 'Daily limit reached'
                      : error?.message ?? 'Something went wrong'}
                  </p>
                  {!usage.canUse && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      Try again {usage.resetIn}
                    </p>
                  )}
                </div>

                {usage.canUse && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setStatus('generating');
                      usage.increment();
                      submit({ prompt, currency });
                    }}
                    className="w-full"
                  >
                    Try again
                  </Button>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
  );
}
