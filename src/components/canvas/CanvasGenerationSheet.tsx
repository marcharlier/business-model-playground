'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { canvasGenerationSchema, type CanvasGeneration } from '@/app/api/ai/generate-canvas/schema';
import { useDailyRateLimit, DAILY_AI_LIMIT } from '@/hooks/use-daily-rate-limit';
import {
  CheckCircle2,
  Loader2,
  Sparkles,
  AlertCircle,
  CircleDollarSign,
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
  const totalItems = totalCanvasItems + totalFinancialItems;
  
  // Check if revenue model doesn't fit product sales
  const hasRevenueModelNote = !!object?.revenueModelNote;

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
              <div className="space-y-3">
                <TextShimmer className="text-sm font-medium">
                  Building your business model canvas...
                </TextShimmer>
                
                {object?.projectName && (
                  <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-3">
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
                      Project name
                    </p>
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                      {object.projectName}
                    </p>
                  </div>
                )}

                {/* Canvas sections progress */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Business Model Canvas
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(canvasItemCounts).map(([key, count]) => (
                      <div
                        key={key}
                        className={cn(
                          'flex items-center gap-2 text-xs rounded-md px-2 py-1.5',
                          count > 0
                            ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300'
                            : 'bg-muted/50 text-muted-foreground'
                        )}
                      >
                        {count > 0 ? (
                          <CheckCircle2 className="h-3 w-3 flex-shrink-0" />
                        ) : (
                          <Loader2 className="h-3 w-3 flex-shrink-0 animate-spin" />
                        )}
                        <span className="truncate capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        {count > 0 && (
                          <span className="ml-auto font-medium">{count}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Financial sections progress */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <CircleDollarSign className="h-3 w-3" />
                    Costs & Revenue
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    <div
                      className={cn(
                        'flex items-center gap-2 text-xs rounded-md px-2 py-1.5',
                        financialItemCounts.upfrontCosts > 0
                          ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300'
                          : 'bg-muted/50 text-muted-foreground'
                      )}
                    >
                      {financialItemCounts.upfrontCosts > 0 ? (
                        <CheckCircle2 className="h-3 w-3 flex-shrink-0" />
                      ) : (
                        <Loader2 className="h-3 w-3 flex-shrink-0 animate-spin" />
                      )}
                      <span>Upfront Costs</span>
                      {financialItemCounts.upfrontCosts > 0 && (
                        <span className="ml-auto font-medium">{financialItemCounts.upfrontCosts}</span>
                      )}
                    </div>
                    <div
                      className={cn(
                        'flex items-center gap-2 text-xs rounded-md px-2 py-1.5',
                        financialItemCounts.runningCosts > 0
                          ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300'
                          : 'bg-muted/50 text-muted-foreground'
                      )}
                    >
                      {financialItemCounts.runningCosts > 0 ? (
                        <CheckCircle2 className="h-3 w-3 flex-shrink-0" />
                      ) : (
                        <Loader2 className="h-3 w-3 flex-shrink-0 animate-spin" />
                      )}
                      <span>Running Costs</span>
                      {financialItemCounts.runningCosts > 0 && (
                        <span className="ml-auto font-medium">{financialItemCounts.runningCosts}</span>
                      )}
                    </div>
                    <div
                      className={cn(
                        'flex items-center gap-2 text-xs rounded-md px-2 py-1.5',
                        financialItemCounts.products > 0 || hasRevenueModelNote
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
                          : 'bg-muted/50 text-muted-foreground'
                      )}
                    >
                      {financialItemCounts.products > 0 || hasRevenueModelNote ? (
                        <CheckCircle2 className="h-3 w-3 flex-shrink-0" />
                      ) : (
                        <Loader2 className="h-3 w-3 flex-shrink-0 animate-spin" />
                      )}
                      <span>Revenue Streams</span>
                      {financialItemCounts.products > 0 && (
                        <span className="ml-auto font-medium">{financialItemCounts.products}</span>
                      )}
                      {hasRevenueModelNote && financialItemCounts.products === 0 && (
                        <span className="ml-auto">
                          <Info className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>

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
              <div className="space-y-3">
                <div className="rounded-lg bg-green-50 dark:bg-green-950/30 p-4 text-center">
                  <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">
                    Canvas generated successfully!
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    {totalItems} items created across all sections
                  </p>
                </div>

                {object?.projectName && (
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground font-medium mb-1">
                      Project name
                    </p>
                    <p className="text-sm font-semibold">
                      {object.projectName}
                    </p>
                  </div>
                )}

                {/* Summary of what was generated */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Canvas sections</span>
                    <span className="font-medium">{totalCanvasItems} items</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Upfront costs</span>
                    <span className="font-medium">{financialItemCounts.upfrontCosts} items</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Running costs</span>
                    <span className="font-medium">{financialItemCounts.runningCosts} items</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Products/Services</span>
                    <span className="font-medium">
                      {financialItemCounts.products > 0 
                        ? `${financialItemCounts.products} items` 
                        : 'See note below'}
                    </span>
                  </div>
                </div>

                {/* Revenue model note for non-product-sales businesses */}
                {hasRevenueModelNote && (
                  <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-3 space-y-2">
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
