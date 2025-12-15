import { FIXED_COST_CATEGORIES } from '@/lib/constants/fixedCostCategories';
import type { Project } from '@/lib/storage/types';

/**
 * Build the system prompt for the canvas chat agent.
 * Includes context about the current project state and instructions on when to use tools.
 */
export function buildSystemPrompt(project: Project | null, currency: string): string {
  const categoriesList = FIXED_COST_CATEGORIES.map((c) => {
    const examples = c.examples.slice(0, 3).join(', ');
    return `- ${c.id}: ${c.name} (e.g. ${examples})`;
  }).join('\n');

  const projectContext = project ? buildProjectContext(project) : 'No project data available yet.';

  return `You are an expert business strategist and AI assistant helping someone refine their Business Model Canvas. You have the ability to directly modify the canvas using tools, and you can also provide advice and explanations through conversation.

## Your Role
- Help users develop, refine, and iterate on their business model
- Make direct changes to the canvas when the user requests modifications
- Provide thoughtful advice and explanations when asked questions
- Be specific and actionable in your suggestions

## Current Project State
${projectContext}

## Currency
All monetary values should be in ${currency}.

## Cost Categories
When adding or editing running costs, use one of these category IDs:
${categoriesList}

## When to Use Tools (MAKE CHANGES)
Use tools to modify the canvas when the user:
- Asks you to add, edit, remove, or change items
- Wants to update costs, products, or subscriptions
- Requests specific modifications like "add X to customer segments" or "change the price of Y"
- Says things like "let's add...", "remove...", "update...", "change...", "modify..."
- For initial canvas generation, use the generate_canvas tool to create all sections at once

## When to Respond with Text Only (NO TOOLS)
Respond conversationally WITHOUT using tools when the user:
- Asks for advice, suggestions, or recommendations without requesting changes
- Asks hypothetical questions like "what if..." or "would it be a good idea to..."
- Asks for explanations about business concepts
- Wants to discuss strategy without making immediate changes
- Asks questions like "what do you think about...", "should I...", "how do I..."
- Requests a marketing plan, strategy document, or analysis

## Guidelines for Tool Usage
1. When editing canvas sections:
   - Use edit_canvas_section to replace ALL items in a section
   - Use add_canvas_items to ADD items without removing existing ones
   - Use remove_canvas_items to DELETE specific items

2. When working with costs:
   - Upfront costs are one-time startup expenses
   - Running costs are recurring (monthly or annual) and need a category
   - Match items by name (partial matches work)

3. When working with products:
   - Products represent items/services sold at a price
   - Include realistic sales volume estimates
   - Use daily period for high-volume items (food, tickets), monthly for services

4. When working with subscriptions:
   - Subscriptions are recurring revenue from subscribers
   - Price period can be monthly or annual

## Communication Style
- Be concise but helpful
- When making changes, briefly confirm what you did
- When giving advice, be specific to their business
- Ask clarifying questions if the request is ambiguous
- Proactively suggest improvements when you see opportunities`;
}

/**
 * Build a summary of the current project state for context.
 */
function buildProjectContext(project: Project): string {
  const sections = [
    `**Project Name:** ${project.name}`,
    project.description ? `**Description:** ${project.description}` : null,
    '',
    '**Canvas Sections:**',
    `- Partnerships (${project.partnerships?.length || 0} items): ${formatItems(project.partnerships)}`,
    `- Activities (${project.activities?.length || 0} items): ${formatItems(project.activities)}`,
    `- Resources (${project.resources?.length || 0} items): ${formatItems(project.resources)}`,
    `- Value Proposition (${project.valueProposition?.length || 0} items): ${formatItems(project.valueProposition)}`,
    `- Customer Relationships (${project.customerRelationships?.length || 0} items): ${formatItems(project.customerRelationships)}`,
    `- Channels (${project.channels?.length || 0} items): ${formatItems(project.channels)}`,
    `- Customer Segments (${project.customerSegments?.length || 0} items): ${formatItems(project.customerSegments)}`,
    '',
    '**Cost Structure:**',
    `- Upfront Costs (${project.costStructure.upfrontCosts?.length || 0}): ${formatCosts(project.costStructure.upfrontCosts, project.currency)}`,
    `- Running Costs (${project.costStructure.fixedRunningCosts?.length || 0}): ${formatRunningCosts(project.costStructure.fixedRunningCosts, project.currency)}`,
    '',
    '**Revenue Streams:**',
    `- Products (${project.revenueStreams.products?.length || 0}): ${formatProducts(project.revenueStreams.products, project.currency)}`,
    `- Subscriptions (${project.revenueStreams.subscriptions?.length || 0}): ${formatSubscriptions(project.revenueStreams.subscriptions, project.currency)}`,
  ].filter(Boolean);

  return sections.join('\n');
}

function formatItems(items: Array<{ id: string; text: string }> | undefined): string {
  if (!items || items.length === 0) return 'None';
  return items.map(i => i.text).join(', ');
}

function formatCosts(costs: Array<{ id: string; name: string; amount: number }> | undefined, currency: string): string {
  if (!costs || costs.length === 0) return 'None';
  return costs.map(c => `${c.name} (${currency}${c.amount})`).join(', ');
}

function formatRunningCosts(costs: Array<{ id: string; name: string; amount: number; frequency: string; category: string }> | undefined, currency: string): string {
  if (!costs || costs.length === 0) return 'None';
  return costs.map(c => `${c.name} (${currency}${c.amount}/${c.frequency}, ${c.category})`).join(', ');
}

function formatProducts(products: Array<{ id: string; name: string; price: number; sales?: { volume: number; period: string } }> | undefined, currency: string): string {
  if (!products || products.length === 0) return 'None';
  return products.map(p => {
    const salesInfo = p.sales ? ` - ${p.sales.volume} ${p.sales.period}` : '';
    return `${p.name} (${currency}${p.price}${salesInfo})`;
  }).join(', ');
}

function formatSubscriptions(subs: Array<{ id: string; name: string; price: number; subscribers: number; pricePeriod?: string }> | undefined, currency: string): string {
  if (!subs || subs.length === 0) return 'None';
  return subs.map(s => `${s.name} (${currency}${s.price}/${s.pricePeriod || 'monthly'}, ${s.subscribers} subscribers)`).join(', ');
}

/**
 * Build the initial generation prompt for creating a canvas from a business idea.
 */
export function buildInitialGenerationPrompt(businessIdea: string, currency: string): string {
  return `Business idea: ${businessIdea}

Currency: ${currency}

Please use the generate_canvas tool to create a complete Business Model Canvas for this business idea. Include:

CANVAS SECTIONS:
- projectName: A catchy 3-word name
- partnerships: 5-10 key partners they should work with
- activities: 5-10 essential activities to run this business
- resources: 5-10 key resources needed
- valueProposition: 1-2 VERY CONCISE core value statements (this is the heart of the business)
- customerRelationships: 5-10 ways to build and maintain customer relationships
- channels: 5-10 channels to reach and serve customers
- customerSegments: 5-10 specific target customer groups

COSTS:
- upfrontCosts: 5-10 one-time startup costs with realistic ${currency} amounts
- runningCosts: 5-10 ongoing operating costs with amounts, frequency (monthly/annual), and category

REVENUE:
- If this business suits product sales: generate 5-10 products with name, price, salesVolume, and salesPeriod
- If this business suits subscriptions: generate 5-10 subscriptions with name, price (monthly), and subscribers
- You can generate both products AND subscriptions if the business has multiple revenue streams
- If this business does NOT suit either model: leave both empty and provide a helpful revenueModelNote

Be specific to this particular business - avoid generic suggestions. Use realistic ${currency} amounts for this type of business.`;
}
