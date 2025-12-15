'use client';

import { useEffect, useCallback, useState, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDailyRateLimit, DAILY_AI_LIMIT } from '@/hooks/use-daily-rate-limit';
import { AlertCircle, X, Loader2, CheckCircle2, Wrench } from 'lucide-react';
import { cn, generateUUID } from '@/lib/utils';
import {
  Message,
  MessageContent,
  MessageResponse,
} from '@/components/ai-elements/message';
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
import { projectStorage } from '@/lib/storage/projectStorage';
import { chatHistoryStorage, type StoredChatMessage } from '@/lib/storage/chatHistoryStorage';
import type { Project, CanvasItem, FixedCost, UpfrontCost, Product, Subscription } from '@/lib/storage/types';
import type { CanvasSection } from '@/app/api/ai/canvas-chat/tools';

interface CanvasGenerationSheetProps {
  /** Project ID for tool execution and chat history */
  projectId: string;
  /** Current project data */
  project: Project | null;
  /** Currency for the project */
  currency: string;
  /** Initial prompt for new generation (optional - for initial canvas creation) */
  initialPrompt?: string;
  /** Whether this is a new project that needs initial generation */
  isInitialGeneration?: boolean;
  /** Callback when project data changes */
  onProjectChange?: () => void;
  /** Callback when panel is closed */
  onClose?: () => void;
  /** Whether the panel is open (controlled externally) */
  isOpen?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Initial messages to load from chat history */
  initialMessages?: StoredChatMessage[];
}

// Simplified message type for our chat
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: ToolCall[];
  createdAt: string;
}

interface ToolCall {
  id: string;
  name: string;
  args: unknown;
  state: 'pending' | 'executing' | 'complete' | 'error';
  result?: ToolResult;
}

// Tool result types
type ToolResultSuccess = { success: true; message: string; changes?: string[] };
type ToolResultError = { success: false; error: string };
type ToolResult = ToolResultSuccess | ToolResultError;

export function CanvasGenerationSheet({
  projectId,
  project,
  currency,
  initialPrompt,
  isInitialGeneration = false,
  onProjectChange,
  onClose,
  isOpen: controlledIsOpen,
  onOpenChange,
  initialMessages = [],
}: CanvasGenerationSheetProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    // Convert StoredChatMessage to our ChatMessage format
    return initialMessages.map(msg => {
      // Extract text content
      const textPart = msg.parts?.find(p => p.type === 'text') as { type: 'text'; text: string } | undefined;
      const content = textPart?.text || '';
      
      // Extract tool invocations - handle both old format (toolInvocation nested) and new AI SDK format
      const toolParts = msg.parts?.filter(p => 
        p.type === 'tool-invocation' || (p.type as string)?.startsWith('tool-')
      ) || [];
      
      const toolCalls: ToolCall[] = toolParts.map(tp => {
        const part = tp as unknown as Record<string, unknown>;
        // Handle nested toolInvocation format (our stored format)
        if (part.toolInvocation && typeof part.toolInvocation === 'object') {
          const ti = part.toolInvocation as Record<string, unknown>;
          return {
            id: (ti.toolCallId || ti.id || '') as string,
            name: (ti.toolName || ti.name || '') as string,
            args: {},
            state: (ti.state === 'result' ? 'complete' : ti.state || 'complete') as ToolCall['state'],
            result: ti.result as ToolResult | undefined,
          };
        }
        // Handle direct AI SDK format
        return {
          id: (part.toolCallId || part.id || '') as string,
          name: (part.toolName || '') as string,
          args: {},
          state: (part.state === 'result' || part.state === 'output-success' ? 'complete' : 'complete') as ToolCall['state'],
          result: (part.output || part.result) as ToolResult | undefined,
        };
      });
      
      return {
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content,
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
        createdAt: new Date().toISOString(),
      };
    });
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const hasStartedInitialGenRef = useRef(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Use controlled state if provided, otherwise use internal state
  const isOpen = controlledIsOpen ?? internalIsOpen;

  const usage = useDailyRateLimit('ai-features', DAILY_AI_LIMIT);

  // Execute tool calls and update project data
  const executeToolCall = useCallback(async (
    toolName: string,
    args: unknown
  ): Promise<ToolResult> => {
    console.log('[executeToolCall] Starting execution for tool:', toolName);
    console.log('[executeToolCall] Project ID:', projectId);
    console.log('[executeToolCall] Args:', args);
    
    const currentProject = projectStorage.getProjectById(projectId);
    console.log('[executeToolCall] Current project from storage:', currentProject);
    
    if (!currentProject) {
      console.error('[executeToolCall] Project not found in localStorage for ID:', projectId);
      return { success: false, error: 'Project not found' };
    }

    try {
      let updatedProject = { ...currentProject };
      const changes: string[] = [];

      switch (toolName) {
        case 'edit_canvas_section': {
          const { section, items } = args as { section: CanvasSection; items: string[] };
          const canvasItems: CanvasItem[] = items.map(text => ({ id: generateUUID(), text }));
          updatedProject = { ...updatedProject, [section]: canvasItems };
          changes.push(`Replaced ${section} with ${items.length} items`);
          break;
        }

        case 'add_canvas_items': {
          const { section, items } = args as { section: CanvasSection; items: string[] };
          const existingItems = (updatedProject[section] as CanvasItem[]) || [];
          const newItems: CanvasItem[] = items.map(text => ({ id: generateUUID(), text }));
          updatedProject = { ...updatedProject, [section]: [...existingItems, ...newItems] };
          changes.push(`Added ${items.length} items to ${section}`);
          break;
        }

        case 'remove_canvas_items': {
          const { section, itemTexts } = args as { section: CanvasSection; itemTexts: string[] };
          const existingItems = (updatedProject[section] as CanvasItem[]) || [];
          const filteredItems = existingItems.filter(item => 
            !itemTexts.some(text => item.text.toLowerCase().includes(text.toLowerCase()))
          );
          const removedCount = existingItems.length - filteredItems.length;
          updatedProject = { ...updatedProject, [section]: filteredItems };
          changes.push(`Removed ${removedCount} items from ${section}`);
          break;
        }

        case 'add_cost': {
          const { costType, name, amount, frequency, category } = args as { 
            costType: 'upfront' | 'running'; 
            name: string; 
            amount: number; 
            frequency?: 'monthly' | 'annual'; 
            category?: string 
          };
          if (costType === 'upfront') {
            const newCost: UpfrontCost = { id: generateUUID(), name, amount, projectId };
            updatedProject.costStructure.upfrontCosts = [
              ...(updatedProject.costStructure.upfrontCosts || []),
              newCost,
            ];
            changes.push(`Added upfront cost: ${name}`);
          } else {
            const newCost: FixedCost = { 
              id: generateUUID(), 
              name, 
              amount, 
              frequency: frequency || 'monthly',
              category: category || 'other',
              projectId,
            };
            updatedProject.costStructure.fixedRunningCosts = [
              ...updatedProject.costStructure.fixedRunningCosts,
              newCost,
            ];
            changes.push(`Added running cost: ${name}`);
          }
          break;
        }

        case 'edit_cost': {
          const { costType, nameMatch, updates } = args as { 
            costType: 'upfront' | 'running'; 
            nameMatch: string; 
            updates: { name?: string; amount?: number; frequency?: 'monthly' | 'annual'; category?: string } 
          };
          if (costType === 'upfront') {
            updatedProject.costStructure.upfrontCosts = (updatedProject.costStructure.upfrontCosts || []).map(cost =>
              cost.name.toLowerCase().includes(nameMatch.toLowerCase())
                ? { ...cost, ...updates }
                : cost
            );
          } else {
            updatedProject.costStructure.fixedRunningCosts = updatedProject.costStructure.fixedRunningCosts.map(cost =>
              cost.name.toLowerCase().includes(nameMatch.toLowerCase())
                ? { ...cost, ...updates }
                : cost
            );
          }
          changes.push(`Updated ${costType} cost matching "${nameMatch}"`);
          break;
        }

        case 'remove_cost': {
          const { costType, nameMatch } = args as { costType: 'upfront' | 'running'; nameMatch: string };
          if (costType === 'upfront') {
            updatedProject.costStructure.upfrontCosts = (updatedProject.costStructure.upfrontCosts || []).filter(
              cost => !cost.name.toLowerCase().includes(nameMatch.toLowerCase())
            );
          } else {
            updatedProject.costStructure.fixedRunningCosts = updatedProject.costStructure.fixedRunningCosts.filter(
              cost => !cost.name.toLowerCase().includes(nameMatch.toLowerCase())
            );
          }
          changes.push(`Removed ${costType} cost matching "${nameMatch}"`);
          break;
        }

        case 'add_product': {
          const { name, price, salesVolume, salesPeriod } = args as { 
            name: string; 
            price: number; 
            salesVolume: number; 
            salesPeriod: 'monthly' | 'daily' 
          };
          const newProduct: Product = {
            id: generateUUID(),
            name,
            price,
            associatedCosts: [],
            projectId,
            sales: { volume: salesVolume, period: salesPeriod },
          };
          updatedProject.revenueStreams.products = [
            ...updatedProject.revenueStreams.products,
            newProduct,
          ];
          changes.push(`Added product: ${name}`);
          break;
        }

        case 'edit_product': {
          const { nameMatch, updates } = args as { 
            nameMatch: string; 
            updates: { name?: string; price?: number; salesVolume?: number; salesPeriod?: 'monthly' | 'daily' } 
          };
          updatedProject.revenueStreams.products = updatedProject.revenueStreams.products.map(product =>
            product.name.toLowerCase().includes(nameMatch.toLowerCase())
              ? {
                  ...product,
                  ...(updates.name && { name: updates.name }),
                  ...(updates.price !== undefined && { price: updates.price }),
                  ...(updates.salesVolume !== undefined || updates.salesPeriod ? {
                    sales: {
                      volume: updates.salesVolume ?? product.sales?.volume ?? 0,
                      period: updates.salesPeriod ?? product.sales?.period ?? 'monthly',
                    },
                  } : {}),
                }
              : product
          );
          changes.push(`Updated product matching "${nameMatch}"`);
          break;
        }

        case 'remove_product': {
          const { nameMatch } = args as { nameMatch: string };
          updatedProject.revenueStreams.products = updatedProject.revenueStreams.products.filter(
            product => !product.name.toLowerCase().includes(nameMatch.toLowerCase())
          );
          changes.push(`Removed product matching "${nameMatch}"`);
          break;
        }

        case 'add_subscription': {
          const { name, price, pricePeriod, subscribers } = args as { 
            name: string; 
            price: number; 
            pricePeriod: 'monthly' | 'annual'; 
            subscribers: number 
          };
          const newSubscription: Subscription = {
            id: generateUUID(),
            name,
            price,
            pricePeriod,
            subscribers,
            associatedCosts: [],
            projectId,
          };
          updatedProject.revenueStreams.subscriptions = [
            ...(updatedProject.revenueStreams.subscriptions || []),
            newSubscription,
          ];
          changes.push(`Added subscription: ${name}`);
          break;
        }

        case 'edit_subscription': {
          const { nameMatch, updates } = args as { 
            nameMatch: string; 
            updates: { name?: string; price?: number; pricePeriod?: 'monthly' | 'annual'; subscribers?: number } 
          };
          updatedProject.revenueStreams.subscriptions = (updatedProject.revenueStreams.subscriptions || []).map(sub =>
            sub.name.toLowerCase().includes(nameMatch.toLowerCase())
              ? { ...sub, ...updates }
              : sub
          );
          changes.push(`Updated subscription matching "${nameMatch}"`);
          break;
        }

        case 'remove_subscription': {
          const { nameMatch } = args as { nameMatch: string };
          updatedProject.revenueStreams.subscriptions = (updatedProject.revenueStreams.subscriptions || []).filter(
            sub => !sub.name.toLowerCase().includes(nameMatch.toLowerCase())
          );
          changes.push(`Removed subscription matching "${nameMatch}"`);
          break;
        }

        case 'generate_canvas': {
          // Validate that args is an object with the expected structure
          if (!args || typeof args !== 'object') {
            console.error('generate_canvas received invalid args:', args);
            return { success: false, error: 'Invalid generate_canvas arguments' };
          }
          
          const input = args as {
            projectName?: string;
            partnerships?: string[];
            activities?: string[];
            resources?: string[];
            valueProposition?: string[];
            customerRelationships?: string[];
            channels?: string[];
            customerSegments?: string[];
            upfrontCosts?: Array<{ name: string; amount: number }>;
            runningCosts?: Array<{ name: string; amount: number; frequency: 'monthly' | 'annual'; category: string }>;
            products?: Array<{ name: string; price: number; salesVolume: number; salesPeriod: 'monthly' | 'daily' }>;
            subscriptions?: Array<{ name: string; price: number; subscribers: number }>;
            revenueModelNote?: string;
          };
          
          console.log('[generate_canvas] Input received:', JSON.stringify(input, null, 2));
          
          // Convert to canvas items with fallback to empty arrays
          const toCanvasItems = (items?: string[]): CanvasItem[] => 
            (items || []).map(text => ({ id: generateUUID(), text }));

          // Convert costs with fallback to empty arrays
          const upfrontCosts: UpfrontCost[] = (input.upfrontCosts || []).map(c => ({
            id: generateUUID(),
            name: c.name,
            amount: c.amount,
            projectId,
          }));

          const fixedRunningCosts: FixedCost[] = (input.runningCosts || []).map(c => ({
            id: generateUUID(),
            name: c.name,
            amount: c.amount,
            frequency: c.frequency,
            category: c.category,
            projectId,
          }));

          // Convert products
          const products: Product[] = (input.products || []).map(p => ({
            id: generateUUID(),
            name: p.name,
            price: p.price,
            associatedCosts: [],
            projectId,
            sales: { volume: p.salesVolume, period: p.salesPeriod },
          }));

          // Convert subscriptions
          const subscriptions: Subscription[] = (input.subscriptions || []).map(s => ({
            id: generateUUID(),
            name: s.name,
            price: s.price,
            pricePeriod: 'monthly' as const,
            subscribers: s.subscribers,
            associatedCosts: [],
            projectId,
          }));

          updatedProject = {
            ...updatedProject,
            name: input.projectName || updatedProject.name,
            description: initialPrompt,
            aiGeneratedFromPrompt: initialPrompt,
            partnerships: toCanvasItems(input.partnerships),
            activities: toCanvasItems(input.activities),
            resources: toCanvasItems(input.resources),
            valueProposition: toCanvasItems(input.valueProposition),
            customerRelationships: toCanvasItems(input.customerRelationships),
            channels: toCanvasItems(input.channels),
            customerSegments: toCanvasItems(input.customerSegments),
            costStructure: { fixedRunningCosts, upfrontCosts },
            revenueStreams: { products, subscriptions },
          };

          // Build a comprehensive summary
          const summaryParts: string[] = [];
          summaryParts.push(`I've created "${input.projectName || 'your business'}" with a complete Business Model Canvas.`);
          
          // Canvas sections summary
          const canvasSections = [
            input.partnerships?.length && `${input.partnerships.length} key partnerships`,
            input.activities?.length && `${input.activities.length} key activities`,
            input.resources?.length && `${input.resources.length} key resources`,
            input.valueProposition?.length && `${input.valueProposition.length} value propositions`,
            input.customerRelationships?.length && `${input.customerRelationships.length} customer relationships`,
            input.channels?.length && `${input.channels.length} channels`,
            input.customerSegments?.length && `${input.customerSegments.length} customer segments`,
          ].filter(Boolean);
          
          if (canvasSections.length > 0) {
            summaryParts.push(`The canvas includes ${canvasSections.join(', ')}.`);
          }
          
          // Costs summary
          const costParts: string[] = [];
          if (upfrontCosts.length > 0) {
            costParts.push(`${upfrontCosts.length} startup costs`);
          }
          if (fixedRunningCosts.length > 0) {
            costParts.push(`${fixedRunningCosts.length} operating costs`);
          }
          if (costParts.length > 0) {
            summaryParts.push(`For costs, I've identified ${costParts.join(' and ')}.`);
          }
          
          // Revenue summary
          const revenueParts: string[] = [];
          if (products.length > 0) {
            revenueParts.push(`${products.length} products`);
          }
          if (subscriptions.length > 0) {
            revenueParts.push(`${subscriptions.length} subscription plans`);
          }
          if (revenueParts.length > 0) {
            summaryParts.push(`Revenue streams include ${revenueParts.join(' and ')}.`);
          }
          
          // Add note if provided
          if (input.revenueModelNote) {
            summaryParts.push(`Note: ${input.revenueModelNote}`);
          }
          
          summaryParts.push(`Feel free to ask me to refine any section or add more details!`);

          changes.push(summaryParts.join(' '));
          break;
        }

        default:
          return { success: false, error: `Unknown tool: ${toolName}` };
      }

      // Save the updated project
      console.log('[executeToolCall] Saving updated project with partnerships:', updatedProject.partnerships?.length || 0, 'items');
      projectStorage.updateProject(updatedProject);
      console.log('[executeToolCall] Project saved, calling onProjectChange');
      onProjectChange?.();

      return { success: true, message: 'Changes applied successfully', changes };
    } catch (err) {
      console.error('Tool execution error:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }, [projectId, initialPrompt, onProjectChange]);

  // Send a message to the AI
  const sendMessage = useCallback(async (text: string, forceInitialGeneration = false) => {
    if (!text.trim()) return;

    setError(null);
    setIsLoading(true);

    // Add user message
    const userMessage: ChatMessage = {
      id: generateUUID(),
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };
    
    // Add user message and empty assistant message placeholder
    const assistantPlaceholder: ChatMessage = {
      id: generateUUID(),
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage, assistantPlaceholder]);

    // Create abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      // Build messages for API
      const apiMessages = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await fetch('/api/ai/canvas-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          projectId,
          project,
          currency,
          isInitialGeneration: forceInitialGeneration,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(await response.text() || 'Failed to get response');
      }

      // Process the stream (JSONL format - each line is a JSON object)
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let assistantContent = '';
      let toolSummaryContent = ''; // Track tool summaries separately
      const toolCalls: ToolCall[] = [];
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (!line.trim()) continue;

          try {
            const part = JSON.parse(line);
            console.log('[Chat Stream] Received part:', part);

            switch (part.type) {
              case 'text-delta':
                assistantContent += part.textDelta || '';
                // Update the assistant message with new content
                setMessages(prev => {
                  const lastMsg = prev[prev.length - 1];
                  if (lastMsg?.role === 'assistant') {
                    return [...prev.slice(0, -1), { ...lastMsg, content: assistantContent }];
                  }
                  return [...prev, {
                    id: generateUUID(),
                    role: 'assistant',
                    content: assistantContent,
                    toolCalls: [],
                    createdAt: new Date().toISOString(),
                  }];
                });
                break;

              case 'tool-call':
                // Ensure args is a valid object
                const toolArgs = part.args && typeof part.args === 'object' ? part.args : {};
                console.log('[Chat Stream] Tool call received:', part.toolName, 'args:', JSON.stringify(toolArgs, null, 2));
                
                const newToolCall: ToolCall = {
                  id: part.toolCallId || generateUUID(),
                  name: part.toolName,
                  args: toolArgs,
                  state: 'executing',
                };
                toolCalls.push(newToolCall);

                // Update messages to show tool execution
                setMessages(prev => {
                  const lastMsg = prev[prev.length - 1];
                  if (lastMsg?.role === 'assistant') {
                    return [...prev.slice(0, -1), {
                      ...lastMsg,
                      toolCalls: [...(lastMsg.toolCalls || []), newToolCall]
                    }];
                  }
                  return [...prev, {
                    id: generateUUID(),
                    role: 'assistant',
                    content: assistantContent,
                    toolCalls: [newToolCall],
                    createdAt: new Date().toISOString(),
                  }];
                });

                // Execute the tool with validated args
                const result = await executeToolCall(part.toolName, toolArgs);
                newToolCall.state = result.success ? 'complete' : 'error';
                newToolCall.result = result;

                // Generate a summary from the tool result
                let toolSummary = '';
                if (result.success && 'changes' in result && result.changes && result.changes.length > 0) {
                  toolSummary = result.changes.join('\n');
                } else if (!result.success && 'error' in result) {
                  toolSummary = `Error: ${result.error}`;
                }
                
                // Store tool summary for final message
                if (toolSummary) {
                  toolSummaryContent = toolSummary;
                }

                // Update the tool call state in the message
                setMessages(prev => {
                  const lastMsg = prev[prev.length - 1];
                  if (lastMsg?.role === 'assistant' && lastMsg.toolCalls) {
                    const updatedToolCalls = lastMsg.toolCalls.map(tc =>
                      tc.id === newToolCall.id ? newToolCall : tc
                    );
                    return [...prev.slice(0, -1), { ...lastMsg, toolCalls: updatedToolCalls }];
                  }
                  return prev;
                });
                break;

              case 'error':
                throw new Error(part.error || 'Stream error');

              // Ignore other types: step-start, step-finish, finish, etc.
            }
          } catch (parseError) {
            // Only log non-parse errors
            if (parseError instanceof Error && !parseError.message.includes('JSON')) {
              console.error('Stream parse error:', parseError);
            }
          }
        }
      }

      // Final update with completed message
      // Use tool summary as content if there's no text from AI
      const finalContent = assistantContent || toolSummaryContent;
      
      if (finalContent || toolCalls.length > 0) {
        const assistantMessage: ChatMessage = {
          id: generateUUID(),
          role: 'assistant',
          content: finalContent,
          toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
          createdAt: new Date().toISOString(),
        };

        setMessages(prev => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg?.role === 'assistant') {
            return [...prev.slice(0, -1), assistantMessage];
          }
          return [...prev, assistantMessage];
        });

        // Save chat history
        try {
          const allMessages = [...messages, userMessage, assistantMessage];
          // Save messages with both text and tool call information
          // We use a custom format that we can parse back when loading
          const storedMessages = allMessages.map(msg => {
            const parts: Array<unknown> = [];
            
            // Add text content if present
            if (msg.content) {
              parts.push({ type: 'text', text: msg.content });
            }
            
            // Add tool calls if present (using our custom format for persistence)
            if (msg.toolCalls && msg.toolCalls.length > 0) {
              for (const tc of msg.toolCalls) {
                parts.push({
                  type: 'tool-invocation',
                  toolInvocation: {
                    toolCallId: tc.id,
                    toolName: tc.name,
                    state: tc.state === 'complete' ? 'result' : tc.state,
                    result: tc.result,
                  },
                });
              }
            }
            
            // Ensure at least one part exists
            if (parts.length === 0) {
              parts.push({ type: 'text', text: '' });
            }
            
            return {
              id: msg.id,
              role: msg.role,
              parts,
            };
          }) as unknown as StoredChatMessage[];
          await chatHistoryStorage.saveChatHistory(projectId, storedMessages);
        } catch (err) {
          console.error('Failed to save chat history:', err);
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Request was aborted, don't set error
        return;
      }
      console.error('Chat error:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [messages, projectId, project, currency, executeToolCall]);

  // Stop the current request
  const stop = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Start initial generation if needed
  useEffect(() => {
    if (!isInitialGeneration || hasStartedInitialGenRef.current || !initialPrompt) return;
    if (!usage.canUse) return;

    hasStartedInitialGenRef.current = true;
    usage.increment();
    // Pass true to force initial generation mode
    sendMessage(initialPrompt, true);
  }, [isInitialGeneration, initialPrompt, sendMessage, usage]);

  const handleClose = useCallback(() => {
    if (isLoading) {
      stop();
    }
    if (controlledIsOpen !== undefined) {
      onOpenChange?.(false);
    } else {
      setInternalIsOpen(false);
    }
    onClose?.();
  }, [isLoading, stop, onClose, onOpenChange, controlledIsOpen]);

  const handleSubmit = useCallback(() => {
    if (!inputValue.trim() || !usage.canUse || isLoading) return;
    
    usage.increment();
    sendMessage(inputValue);
    setInputValue('');
  }, [inputValue, sendMessage, usage, isLoading]);

  // Check if we're on mobile (below md breakpoint)
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Memoize the prompt input status
  const promptStatus = useMemo(() => {
    if (isLoading) return 'streaming' as const;
    return 'ready' as const;
  }, [isLoading]);

  // Render a tool call
  const renderToolCall = useCallback((toolCall: ToolCall) => {
    const displayName = toolCall.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    return (
      <div key={toolCall.id} className="flex items-center gap-2 text-xs text-muted-foreground py-1">
        {toolCall.state === 'executing' && <Loader2 className="h-3 w-3 animate-spin text-blue-500" />}
        {toolCall.state === 'complete' && <CheckCircle2 className="h-3 w-3 text-green-500" />}
        {toolCall.state === 'error' && <AlertCircle className="h-3 w-3 text-red-500" />}
        <Wrench className="h-3 w-3" />
        <span>{displayName}</span>
        {toolCall.result && (
          <span className={toolCall.result.success ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
            {toolCall.result.success ? '✓' : '✗'}
          </span>
        )}
      </div>
    );
  }, []);

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
            className="h-8 w-8 text-white hover:bg-white/20 hover:text-white"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0" ref={scrollAreaRef}>
        <div className="space-y-4 p-4">
          {/* Welcome message if no messages */}
          {messages.length === 0 && !isLoading && !initialPrompt && (
            <Message from="assistant">
              <MessageContent>
                <MessageResponse>
                  Hi! I can help you refine your business model canvas. Ask me to add, edit, or remove items, adjust costs or products, or just ask for advice about your business strategy.
                </MessageResponse>
              </MessageContent>
            </Message>
          )}

          {/* Render all messages */}
          {messages.map((message) => (
            <Message key={message.id} from={message.role}>
              <MessageContent>
                {message.content && (
                  <MessageResponse>{message.content}</MessageResponse>
                )}
                {message.toolCalls?.map(renderToolCall)}
              </MessageContent>
            </Message>
          ))}

          {/* Loading indicator - show "Thinking..." until we get content or tool calls */}
          {isLoading && messages.length > 0 && (() => {
            const lastMsg = messages[messages.length - 1];
            const hasNoContent = !lastMsg?.content;
            const hasNoToolCalls = !lastMsg?.toolCalls || lastMsg.toolCalls.length === 0;
            return lastMsg?.role === 'assistant' && hasNoContent && hasNoToolCalls;
          })() && (
            <Message from="assistant">
              <MessageContent>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </MessageContent>
            </Message>
          )}

          {/* Rate limit info */}
          <div className="text-xs text-muted-foreground px-4">
            {usage.count}/{usage.limit} AI requests today
            {!usage.canUse && ` - resets ${usage.resetIn}`}
          </div>

          {/* Error state */}
          {error && (
            <Message from="assistant">
              <MessageContent>
                <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <p className="text-sm font-medium text-red-700 dark:text-red-300">
                      {!usage.canUse
                        ? 'Daily limit reached'
                        : error.message ?? 'Something went wrong'}
                    </p>
                  </div>
                  {!usage.canUse && (
                    <p className="text-xs text-red-600 dark:text-red-400">
                      Try again {usage.resetIn}
                    </p>
                  )}
                </div>
              </MessageContent>
            </Message>
          )}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Prompt Input */}
      <div className="border-t p-4 flex-shrink-0">
        <PromptInput
          onSubmit={handleSubmit}
          className={cn(!usage.canUse && 'opacity-50')}
        >
          <PromptInputBody>
            <PromptInputTextarea
              placeholder={
                !usage.canUse 
                  ? `Daily limit reached - resets ${usage.resetIn}`
                  : "Ask the agent to refine sections, adjust numbers, or get advice..."
              }
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={!usage.canUse || isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools />
            <PromptInputSubmit 
              disabled={!inputValue.trim() || !usage.canUse || isLoading} 
              status={promptStatus}
            />
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
        <DrawerContent className="h-[90vh] flex flex-col overflow-hidden [&>div:first-child]:hidden border-none shadow-xl">
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
