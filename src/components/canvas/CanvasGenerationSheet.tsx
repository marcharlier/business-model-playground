'use client';

import { useEffect, useCallback, useState, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { canvasGenerationSchema, type CanvasGeneration } from '@/app/api/ai/generate-canvas/schema';
import { useDailyRateLimit, DAILY_AI_LIMIT } from '@/hooks/use-daily-rate-limit';
import {
  AlertCircle,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Message,
  MessageContent,
  MessageResponse,
} from '@/components/ai-elements/message';
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from '@/components/ai-elements/reasoning';
import {
  PromptInput,
  PromptInputBody,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
  PromptInputSubmit,
} from '@/components/ai-elements/prompt-input';
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer';
import { useMediaQuery } from '@/hooks/use-media-query';

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[] 
    ? (DeepPartial<U> | undefined)[] | undefined
    : T[P] extends object 
    ? DeepPartial<T[P]> 
    : T[P];
};

interface CanvasGenerationSheetProps {
  prompt: string;
  currency: string;
  onUpdate: (data: DeepPartial<CanvasGeneration>) => void;
  onComplete: (data: CanvasGeneration) => void;
  onError?: (error: Error) => void;
  /** If true, the panel is in view-only mode (showing stored generation info) */
  viewOnly?: boolean;
  /** Project description to show when returning later (falls back to prompt) */
  projectDescription?: string;
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
  projectDescription,
  onClose,
  isOpen: controlledIsOpen,
  onOpenChange,
}: CanvasGenerationSheetProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(true);
  const [status, setStatus] = useState<GenerationStatus>(viewOnly ? 'complete' : 'idle');
  const [reasoningOpen, setReasoningOpen] = useState(false);
  const hasStartedRef = useRef(false);
  const lastObjectRef = useRef<unknown>(undefined);

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
      onUpdate(object as DeepPartial<CanvasGeneration>);
    }
  }, [object, onUpdate]);

  // Update status based on loading state
  useEffect(() => {
    if (isLoading && status !== 'generating') {
      // Use setTimeout to avoid synchronous setState in effect
      setTimeout(() => setStatus('generating'), 0);
    }
  }, [isLoading, status]);

  // Auto-open reasoning when generation starts, auto-close when complete
  useEffect(() => {
    if (status === 'generating') {
      // Use setTimeout to avoid synchronous setState in effect
      setTimeout(() => setReasoningOpen(true), 0);
    } else if (status === 'complete') {
      // Auto-collapse after a short delay
      const timer = setTimeout(() => {
        setReasoningOpen(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [status]);

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
  const canvasItemCounts = useMemo(() => ({
    partnerships: object?.partnerships?.length ?? 0,
    activities: object?.activities?.length ?? 0,
    resources: object?.resources?.length ?? 0,
    valueProposition: object?.valueProposition?.length ?? 0,
    customerRelationships: object?.customerRelationships?.length ?? 0,
    channels: object?.channels?.length ?? 0,
    customerSegments: object?.customerSegments?.length ?? 0,
  }), [object]);
  
  // Count generated items - costs and revenues
  const financialItemCounts = useMemo(() => ({
    upfrontCosts: object?.upfrontCosts?.length ?? 0,
    runningCosts: object?.runningCosts?.length ?? 0,
    products: object?.products?.length ?? 0,
    subscriptions: object?.subscriptions?.length ?? 0,
  }), [object]);
  
  const totalCanvasItems = useMemo(() => 
    Object.values(canvasItemCounts).reduce((a, b) => a + b, 0),
    [canvasItemCounts]
  );
  const totalFinancialItems = useMemo(() => 
    Object.values(financialItemCounts).reduce((a, b) => a + b, 0),
    [financialItemCounts]
  );
  
  // Check if revenue model doesn't fit product sales
  const hasRevenueModelNote = !!object?.revenueModelNote;

  // Check if we have any generated content to show reasoning
  const hasGeneratedContent = useMemo(() => {
    return totalCanvasItems > 0 || totalFinancialItems > 0 || !!object?.projectName;
  }, [totalCanvasItems, totalFinancialItems, object]);

  // Build reasoning text that shows progress - formatted with line breaks
  const reasoningText = useMemo(() => {
    if (status === 'idle') {
      return 'Preparing to analyze your business idea...';
    }

    if (status === 'error') {
      return 'Encountered an error while generating your business model canvas.';
    }

    const parts: string[] = [];
    
    // Understanding phase
    if (status === 'generating') {
      parts.push('Analyzing your business idea and understanding the core concept.');
    }

    // Canvas generation
    if (totalCanvasItems > 0) {
      const items: string[] = [];
      if (canvasItemCounts.partnerships > 0) items.push(`${canvasItemCounts.partnerships} partnership${canvasItemCounts.partnerships > 1 ? 's' : ''}`);
      if (canvasItemCounts.activities > 0) items.push(`${canvasItemCounts.activities} key activit${canvasItemCounts.activities > 1 ? 'ies' : 'y'}`);
      if (canvasItemCounts.resources > 0) items.push(`${canvasItemCounts.resources} resource${canvasItemCounts.resources > 1 ? 's' : ''}`);
      if (canvasItemCounts.valueProposition > 0) items.push(`${canvasItemCounts.valueProposition} value proposition${canvasItemCounts.valueProposition > 1 ? 's' : ''}`);
      if (canvasItemCounts.customerRelationships > 0) items.push(`${canvasItemCounts.customerRelationships} customer relationship${canvasItemCounts.customerRelationships > 1 ? 's' : ''}`);
      if (canvasItemCounts.channels > 0) items.push(`${canvasItemCounts.channels} channel${canvasItemCounts.channels > 1 ? 's' : ''}`);
      if (canvasItemCounts.customerSegments > 0) items.push(`${canvasItemCounts.customerSegments} customer segment${canvasItemCounts.customerSegments > 1 ? 's' : ''}`);
      
      if (items.length > 0) {
        parts.push(`Generated ${items.join(', ')} for the business model canvas.`);
      }
    } else if (status === 'generating') {
      parts.push('Drafting business model canvas elements...');
    }

    // Financial items
    if (totalFinancialItems > 0) {
      const items: string[] = [];
      if (financialItemCounts.upfrontCosts > 0) items.push(`${financialItemCounts.upfrontCosts} upfront cost${financialItemCounts.upfrontCosts > 1 ? 's' : ''}`);
      if (financialItemCounts.runningCosts > 0) items.push(`${financialItemCounts.runningCosts} running cost${financialItemCounts.runningCosts > 1 ? 's' : ''}`);
      if (financialItemCounts.products > 0) items.push(`${financialItemCounts.products} product revenue stream${financialItemCounts.products > 1 ? 's' : ''}`);
      if (financialItemCounts.subscriptions > 0) items.push(`${financialItemCounts.subscriptions} subscription revenue stream${financialItemCounts.subscriptions > 1 ? 's' : ''}`);
      
      if (items.length > 0) {
        parts.push(`Identified ${items.join(', ')}.`);
      }
    } else if (status === 'generating' && totalCanvasItems > 0) {
      parts.push('Exploring costs and revenue opportunities...');
    }

    // Project name
    if (object?.projectName) {
      parts.push(`Selected project name: "${object.projectName}".`);
    } else if (status === 'generating' && totalFinancialItems > 0) {
      parts.push('Polishing the project name...');
    }

    // Completion summary
    if (status === 'complete') {
      if (parts.length === 0) {
        // If nothing was generated yet, show a basic completion message
        parts.push('Business model canvas generation completed.');
      } else {
        // Add a final summary line
        parts.push(`Generation complete! Created ${totalCanvasItems} canvas item${totalCanvasItems !== 1 ? 's' : ''} and ${totalFinancialItems} financial item${totalFinancialItems !== 1 ? 's' : ''}.`);
      }
    }

    // Join with double line breaks to create spacing between sentences
    return parts.length > 0 ? parts.join('\n\n') : 'Processing your request...';
  }, [status, totalCanvasItems, totalFinancialItems, canvasItemCounts, financialItemCounts, object]);

  // Final completion message
  const completionMessage = useMemo(() => {
    if (status !== 'complete') return null;
    
    const parts: string[] = [];
    parts.push(`I've created ${totalCanvasItems} canvas item${totalCanvasItems !== 1 ? 's' : ''} and ${totalFinancialItems} financial item${totalFinancialItems !== 1 ? 's' : ''} based on your idea.`);
    
    if (object?.projectName) {
      parts.push(`Your project "${object.projectName}" is ready to explore.`);
    }
    
    if (hasRevenueModelNote) {
      parts.push('Note: Your business model may require manual revenue stream configuration based on the revenue model note.');
    } else {
      parts.push('You can now explore the canvas and use the Profitability Playground to experiment with pricing.');
    }
    
    return parts.join(' ');
  }, [status, totalCanvasItems, totalFinancialItems, object, hasRevenueModelNote]);

  // Check if we're on mobile (below md breakpoint)
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Content component - shared between mobile and desktop
  const renderContent = () => (
    <>
      {/* Header */}
      <div className="px-4 py-4 border-b flex-shrink-0 bg-blue-700 rounded-t-lg md:rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-normal font-hero font-semibold text-white">AI Assistant</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4">
            {/* Label for user idea */}
            <div className="text-xs pl-4 font-medium text-muted-foreground uppercase tracking-wide">
              Your idea
            </div>

            {/* User's initial idea - using Message component */}
            <Message from="user">
              <MessageContent>
                <MessageResponse>{projectDescription || prompt}</MessageResponse>
              </MessageContent>
            </Message>

            {/* Reasoning component - shows during generation and after completion, but only if we have content */}
            {(status === 'generating' || (status === 'complete' && hasGeneratedContent) || (viewOnly && hasGeneratedContent)) && (
              <Message from="assistant">
                <MessageContent>
                  <Reasoning
                    isStreaming={status === 'generating' && isLoading}
                    open={reasoningOpen}
                    onOpenChange={setReasoningOpen}
                    defaultOpen={status === 'generating'}
                    className="w-full"
                  >
                    <ReasoningTrigger />
                    <ReasoningContent>{reasoningText}</ReasoningContent>
                  </Reasoning>
                </MessageContent>
              </Message>
            )}

            {/* Completion message */}
            {status === 'complete' && !viewOnly && completionMessage && (
              <Message from="assistant">
                <MessageContent>
                  <MessageResponse>{completionMessage}</MessageResponse>
                </MessageContent>
              </Message>
            )}

            {/* View-only mode content */}
            {viewOnly && (
              <Message from="assistant">
                <MessageContent>
                  <MessageResponse>
                    This business model canvas was generated by AI based on your original idea.
                    You can edit any section to refine the model.
                  </MessageResponse>
                </MessageContent>
              </Message>
            )}

            {/* Rate limit info - only show in non-viewOnly mode */}
            {!viewOnly && (
              <div className="text-xs text-muted-foreground px-4">
                {usage.count}/{usage.limit} generations today
                {!usage.canUse && ` - resets ${usage.resetIn}`}
              </div>
            )}

            {/* Error state */}
            {status === 'error' && (
              <Message from="assistant">
                <MessageContent>
                  <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      <p className="text-sm font-medium text-red-700 dark:text-red-300">
                        {!usage.canUse
                          ? 'Daily limit reached'
                          : error?.message ?? 'Something went wrong'}
                      </p>
                    </div>
                    {!usage.canUse && (
                      <p className="text-xs text-red-600 dark:text-red-400">
                        Try again {usage.resetIn}
                      </p>
                    )}
                    {usage.canUse && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setStatus('generating');
                          usage.increment();
                          submit({ prompt, currency });
                        }}
                        className="w-full mt-2"
                      >
                        Try again
                      </Button>
                    )}
                  </div>
                </MessageContent>
              </Message>
            )}
          </div>
        </ScrollArea>

        {/* Prompt Input - locked/disabled for now */}
        <div className="border-t p-4 flex-shrink-0">
          <PromptInput
            onSubmit={() => {}}
            className="opacity-50 pointer-events-none"
          >
            <PromptInputBody>
              <PromptInputTextarea
                placeholder="Ask the agent to refine a section or adjust numbers... (Coming soon)"
                disabled
              />
            </PromptInputBody>
            <PromptInputFooter>
              <PromptInputTools />
              <PromptInputSubmit disabled status="ready" />
            </PromptInputFooter>
          </PromptInput>
        </div>
    </>
  );

  // Mobile: Render as bottom drawer
  if (isMobile) {
    return (
      <Drawer 
        open={isOpen} 
        onOpenChange={(open) => {
          if (!open) {
            handleClose();
          } else {
            if (controlledIsOpen !== undefined) {
              onOpenChange?.(true);
            } else {
              setInternalIsOpen(true);
            }
          }
        }}
      >
        <DrawerContent className="max-h-[90vh] flex flex-col [&>div:first-child]:hidden">
          <DrawerTitle className="sr-only">AI Assistant</DrawerTitle>
          {renderContent()}
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: Render as fixed sidebar from the left
  return (
    <div
      className={cn(
        'fixed left-0 top-14 bottom-0 w-[360px] z-40',
        'p-4',
        'transition-transform duration-300 ease-in-out',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
    <div className="flex flex-col bg-background rounded-xl shadow-xl border border-border h-full">
        {renderContent()}
      </div>
    </div>
  );
}
