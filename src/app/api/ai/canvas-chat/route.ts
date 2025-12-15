import { NextRequest } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { streamText, type CoreMessage } from 'ai';
import { canvasChatTools } from './tools';
import { buildSystemPrompt } from './prompts';
import type { Project } from '@/lib/storage/types';

export const maxDuration = 60;

interface ChatRequestBody {
  messages: CoreMessage[];
  projectId: string;
  project: Project | null;
  currency: string;
  isInitialGeneration?: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({})) as Partial<ChatRequestBody>;
    const { messages, projectId, project, currency = 'USD', isInitialGeneration } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response('Messages are required', { status: 400 });
    }

    if (!projectId) {
      return new Response('Project ID is required', { status: 400 });
    }

    // Build system prompt with current project context
    const systemPrompt = buildSystemPrompt(project || null, currency);

    console.log('[API] Request received - isInitialGeneration:', isInitialGeneration);
    console.log('[API] Messages count:', messages.length);
    console.log('[API] Tool choice:', isInitialGeneration ? 'required: generate_canvas' : 'auto');

    // Use streamText with tools for multi-turn conversation
    const result = streamText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      messages,
      tools: canvasChatTools,
      // When doing initial generation, require tool use
      toolChoice: isInitialGeneration ? { type: 'tool', toolName: 'generate_canvas' } : 'auto',
    });

    // Create a custom stream using fullStream for complete control
    const encoder = new TextEncoder();
    
    // Accumulate tool call args from streaming deltas
    // The AI SDK uses 'tool-input-start/delta/end' events (not 'tool-call-streaming-start/delta')
    const toolInputAccumulator: Record<string, { toolName: string; args: string }> = {};
    const completedToolCalls: Array<{ toolCallId: string; toolName: string; args: unknown }> = [];
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Process the full stream to get all parts
          for await (const part of result.fullStream) {
            // Log non-delta part types
            if (part.type !== 'tool-input-delta' && part.type !== 'text-delta') {
              console.log('[Stream] Part:', part.type);
            }
            
            if (part.type === 'text-delta') {
              // Log full structure to find the correct property name
              console.log('[Stream] Text delta full part:', JSON.stringify(part));
              // Try different property names for the text content
              const p = part as Record<string, unknown>;
              const text = (p.textDelta || p.delta || p.text || p.content || '') as string;
              const data = JSON.stringify({ type: 'text-delta', textDelta: text }) + '\n';
              controller.enqueue(encoder.encode(data));
            } else if (part.type === 'tool-input-start') {
              // Log the full part to see its structure
              console.log('[Stream] Tool input start - full part:', JSON.stringify(part));
              // Try different property names for the ID
              const p = part as Record<string, unknown>;
              const id = (p.toolCallId || p.id || 'default') as string;
              const name = (p.toolName || p.name || 'unknown') as string;
              console.log('[Stream] Tool input start - id:', id, 'name:', name);
              toolInputAccumulator[id] = { toolName: name, args: '' };
            } else if (part.type === 'tool-input-delta') {
              // Log the full part to see its structure
              const p = part as Record<string, unknown>;
              const id = (p.toolCallId || p.id || 'default') as string;
              const delta = (p.inputTextDelta || p.delta || p.argsTextDelta || '') as string;
              if (toolInputAccumulator[id]) {
                toolInputAccumulator[id].args += delta;
              }
            } else if (part.type === 'tool-input-end') {
              // Log the full part to see its structure
              console.log('[Stream] Tool input end - full part:', JSON.stringify(part));
              const p = part as Record<string, unknown>;
              const id = (p.toolCallId || p.id || 'default') as string;
              const accumulated = toolInputAccumulator[id];
              if (accumulated) {
                console.log('[Stream] Tool input end - id:', id, 'args length:', accumulated.args.length);
                console.log('[Stream] Args preview:', accumulated.args.substring(0, 100));
                try {
                  const parsedArgs = JSON.parse(accumulated.args);
                  completedToolCalls.push({
                    toolCallId: id,
                    toolName: accumulated.toolName,
                    args: parsedArgs,
                  });
                  console.log('[Stream] Successfully parsed tool args for:', accumulated.toolName);
                } catch (e) {
                  console.error('[Stream] Failed to parse tool args:', e);
                  console.error('[Stream] Raw args start:', accumulated.args.substring(0, 200));
                  completedToolCalls.push({
                    toolCallId: id,
                    toolName: accumulated.toolName,
                    args: {},
                  });
                }
                delete toolInputAccumulator[id];
              }
            } else if (part.type === 'tool-call') {
              // This event comes after tool-input-end, usually without args
              // We've already captured the args from tool-input-delta
              console.log('[Stream] Tool call event (args already captured):', part.toolCallId);
            } else if (part.type === 'finish' || part.type === 'finish-step') {
              // Finish events - log for debugging
            }
          }
          
          // Send all completed tool calls
          console.log('[Stream] Sending', completedToolCalls.length, 'tool calls');
          for (const tc of completedToolCalls) {
            const argsStr = tc.args ? JSON.stringify(tc.args) : '{}';
            console.log('[Stream] Final tool call:', tc.toolName, 'args preview:', argsStr.substring(0, 200));
            const data = JSON.stringify({
              type: 'tool-call',
              toolCallId: tc.toolCallId,
              toolName: tc.toolName,
              args: tc.args,
            }) + '\n';
            controller.enqueue(encoder.encode(data));
          }
          
          // Send finish
          const finishReason = await result.finishReason;
          const finishData = JSON.stringify({ type: 'finish', finishReason }) + '\n';
          controller.enqueue(encoder.encode(finishData));
          
          controller.close();
        } catch (error) {
          console.error('[Stream] Error:', error);
          const errorData = JSON.stringify({ type: 'error', error: String(error) }) + '\n';
          controller.enqueue(encoder.encode(errorData));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('Error in canvas chat:', error);
    return new Response('Failed to process chat request', { status: 500 });
  }
}
