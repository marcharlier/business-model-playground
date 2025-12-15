import { tool } from 'ai';
import { z } from 'zod';
import { FIXED_COST_CATEGORIES } from '@/lib/constants/fixedCostCategories';

// Build valid category IDs for schema
const CATEGORY_IDS = FIXED_COST_CATEGORIES.map((c) => c.id) as [string, ...string[]];

// Canvas section types
const canvasSectionEnum = z.enum([
  'partnerships',
  'activities',
  'resources',
  'valueProposition',
  'customerRelationships',
  'channels',
  'customerSegments',
]);

export type CanvasSection = z.infer<typeof canvasSectionEnum>;

// ============================================
// Canvas Section Tools
// ============================================

export const editCanvasSectionTool = tool({
  description: `Replace all items in a specific canvas section with new items. Use this when the user wants to completely replace or overwrite a section. For partial changes, use add_canvas_items or remove_canvas_items instead.`,
  inputSchema: z.object({
    section: canvasSectionEnum.describe('The canvas section to edit'),
    items: z.array(z.string()).min(1).max(15).describe('The new items for this section'),
  }),
});

export const addCanvasItemsTool = tool({
  description: `Add new items to a specific canvas section without removing existing items. Use this when the user wants to add more items to a section.`,
  inputSchema: z.object({
    section: canvasSectionEnum.describe('The canvas section to add items to'),
    items: z.array(z.string()).min(1).max(10).describe('The items to add to this section'),
  }),
});

export const removeCanvasItemsTool = tool({
  description: `Remove items from a specific canvas section by matching text. Matches are case-insensitive and support partial matches. Use this when the user wants to delete specific items.`,
  inputSchema: z.object({
    section: canvasSectionEnum.describe('The canvas section to remove items from'),
    itemTexts: z.array(z.string()).min(1).describe('The text of items to remove (partial matches work)'),
  }),
});

// ============================================
// Cost Tools
// ============================================

export const addCostTool = tool({
  description: `Add a new cost to the project. Can be either an upfront (one-time) cost or a running (recurring) cost.`,
  inputSchema: z.object({
    costType: z.enum(['upfront', 'running']).describe('Type of cost - upfront for one-time costs, running for recurring costs'),
    name: z.string().describe('Name of the cost'),
    amount: z.number().positive().describe('Cost amount in the project currency'),
    frequency: z.enum(['monthly', 'annual']).optional().describe('Required for running costs - how often this cost recurs'),
    category: z.enum(CATEGORY_IDS).optional().describe(`Required for running costs - category of the cost. Options: ${CATEGORY_IDS.join(', ')}`),
  }),
});

export const editCostTool = tool({
  description: `Edit an existing cost by name. Finds the cost by partial name match and updates its properties.`,
  inputSchema: z.object({
    costType: z.enum(['upfront', 'running']).describe('Type of cost to edit'),
    nameMatch: z.string().describe('Text to match the cost name (partial, case-insensitive)'),
    updates: z.object({
      name: z.string().optional().describe('New name for the cost'),
      amount: z.number().positive().optional().describe('New amount for the cost'),
      frequency: z.enum(['monthly', 'annual']).optional().describe('New frequency (running costs only)'),
      category: z.enum(CATEGORY_IDS).optional().describe('New category (running costs only)'),
    }).describe('The properties to update'),
  }),
});

export const removeCostTool = tool({
  description: `Remove a cost from the project by matching its name. Matches are case-insensitive and support partial matches.`,
  inputSchema: z.object({
    costType: z.enum(['upfront', 'running']).describe('Type of cost to remove'),
    nameMatch: z.string().describe('Text to match the cost name (partial, case-insensitive)'),
  }),
});

// ============================================
// Product Tools
// ============================================

export const addProductTool = tool({
  description: `Add a new product (revenue stream) to the project. Products represent items or services sold for a price.`,
  inputSchema: z.object({
    name: z.string().describe('Name of the product'),
    price: z.number().nonnegative().describe('Price per unit'),
    salesVolume: z.number().positive().describe('Expected sales volume'),
    salesPeriod: z.enum(['monthly', 'daily']).describe('Period for the sales volume - daily for high-volume items, monthly for services'),
  }),
});

export const editProductTool = tool({
  description: `Edit an existing product by name. Finds the product by partial name match and updates its properties.`,
  inputSchema: z.object({
    nameMatch: z.string().describe('Text to match the product name (partial, case-insensitive)'),
    updates: z.object({
      name: z.string().optional().describe('New name for the product'),
      price: z.number().nonnegative().optional().describe('New price per unit'),
      salesVolume: z.number().positive().optional().describe('New expected sales volume'),
      salesPeriod: z.enum(['monthly', 'daily']).optional().describe('New period for sales volume'),
    }).describe('The properties to update'),
  }),
});

export const removeProductTool = tool({
  description: `Remove a product from the project by matching its name. Matches are case-insensitive and support partial matches.`,
  inputSchema: z.object({
    nameMatch: z.string().describe('Text to match the product name (partial, case-insensitive)'),
  }),
});

// ============================================
// Subscription Tools
// ============================================

export const addSubscriptionTool = tool({
  description: `Add a new subscription (recurring revenue stream) to the project. Subscriptions represent recurring monthly or annual payments from subscribers.`,
  inputSchema: z.object({
    name: z.string().describe('Name of the subscription plan'),
    price: z.number().nonnegative().describe('Subscription price'),
    pricePeriod: z.enum(['monthly', 'annual']).default('monthly').describe('Billing period for the subscription'),
    subscribers: z.number().nonnegative().describe('Expected number of subscribers'),
  }),
});

export const editSubscriptionTool = tool({
  description: `Edit an existing subscription by name. Finds the subscription by partial name match and updates its properties.`,
  inputSchema: z.object({
    nameMatch: z.string().describe('Text to match the subscription name (partial, case-insensitive)'),
    updates: z.object({
      name: z.string().optional().describe('New name for the subscription'),
      price: z.number().nonnegative().optional().describe('New subscription price'),
      pricePeriod: z.enum(['monthly', 'annual']).optional().describe('New billing period'),
      subscribers: z.number().nonnegative().optional().describe('New expected number of subscribers'),
    }).describe('The properties to update'),
  }),
});

export const removeSubscriptionTool = tool({
  description: `Remove a subscription from the project by matching its name. Matches are case-insensitive and support partial matches.`,
  inputSchema: z.object({
    nameMatch: z.string().describe('Text to match the subscription name (partial, case-insensitive)'),
  }),
});

// ============================================
// Bulk Generation Tool (for initial generation)
// ============================================

export const generateCanvasTool = tool({
  description: `Generate a complete business model canvas with all sections, costs, and revenue streams. Use this for initial canvas generation from a business idea description.`,
  inputSchema: z.object({
    projectName: z.string().describe('A catchy 3-word name for this business idea'),
    partnerships: z.array(z.string()).max(10).describe('Key partnerships needed for the business (5-10 items)'),
    activities: z.array(z.string()).max(10).describe('Key activities the business must perform (5-10 items)'),
    resources: z.array(z.string()).max(10).describe('Key resources required to operate (5-10 items)'),
    valueProposition: z.array(z.string()).max(2).describe('Core value proposition - what unique value is offered (1-2 concise statements)'),
    customerRelationships: z.array(z.string()).max(10).describe('Types of customer relationships to establish (5-10 items)'),
    channels: z.array(z.string()).max(10).describe('Channels to reach and deliver value to customers (5-10 items)'),
    customerSegments: z.array(z.string()).max(10).describe('Target customer segments (5-10 items)'),
    upfrontCosts: z.array(z.object({
      name: z.string(),
      amount: z.number().positive(),
    })).max(10).describe('One-time startup costs'),
    runningCosts: z.array(z.object({
      name: z.string(),
      amount: z.number().positive(),
      frequency: z.enum(['monthly', 'annual']),
      category: z.enum(CATEGORY_IDS),
    })).max(10).describe('Ongoing operating costs'),
    products: z.array(z.object({
      name: z.string(),
      price: z.number().positive(),
      salesVolume: z.number().positive(),
      salesPeriod: z.enum(['monthly', 'daily']),
    })).max(10).optional().describe('Products or services with pricing'),
    subscriptions: z.array(z.object({
      name: z.string(),
      price: z.number().positive(),
      subscribers: z.number().positive(),
    })).max(10).optional().describe('Subscription revenue streams'),
    revenueModelNote: z.string().optional().describe('Note if the business needs a different revenue model'),
  }),
});

// Export all tools as a collection for use in the route
export const canvasChatTools = {
  edit_canvas_section: editCanvasSectionTool,
  add_canvas_items: addCanvasItemsTool,
  remove_canvas_items: removeCanvasItemsTool,
  add_cost: addCostTool,
  edit_cost: editCostTool,
  remove_cost: removeCostTool,
  add_product: addProductTool,
  edit_product: editProductTool,
  remove_product: removeProductTool,
  add_subscription: addSubscriptionTool,
  edit_subscription: editSubscriptionTool,
  remove_subscription: removeSubscriptionTool,
  generate_canvas: generateCanvasTool,
};

export type CanvasChatToolName = keyof typeof canvasChatTools;
