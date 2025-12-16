import { z } from "zod"
import { FIXED_COST_CATEGORIES } from "@/lib/constants/fixedCostCategories"

// Build a runtime enum for valid fixed cost category ids
const CATEGORY_IDS = FIXED_COST_CATEGORIES.map((c) => c.id) as [string, ...string[]]

// Upfront cost structure
const upfrontCostSchema = z.object({
  name: z.string().describe("Name of the upfront cost"),
  amount: z.number().positive().describe("Estimated cost amount"),
})

// Running/operating cost structure
const runningCostSchema = z.object({
  name: z.string().describe("Name of the running cost"),
  amount: z.number().positive().describe("Estimated cost amount"),
  frequency: z.enum(["monthly", "annual"]).describe("How often this cost is paid"),
  category: z.enum(CATEGORY_IDS).describe(`Category of the cost. Must be one of: ${CATEGORY_IDS.join(", ")}`),
})

// Unified revenue stream structure
const revenueStreamSchema = z.object({
  name: z.string().describe("Name of the revenue stream (product or subscription)"),
  type: z.enum(["product", "subscription"]).describe("Type of revenue stream - 'product' for one-time sales, 'subscription' for recurring revenue"),
  // Product-specific fields (optional)
  price: z.number().positive().optional().describe("Price per unit (for products) or subscription price (for subscriptions)"),
  salesVolume: z.number().positive().optional().describe("Expected sales volume (only for product type)"),
  salesPeriod: z.enum(["monthly", "daily"]).optional().describe("Period for the sales volume (only for product type)"),
  // Subscription-specific fields (optional)
  pricePeriod: z.enum(["monthly", "annual"]).optional().describe("Billing period for subscriptions (only for subscription type)"),
  subscribers: z.number().positive().optional().describe("Number of expected subscribers (only for subscription type)"),
})

// Legacy schemas - kept for backward compatibility during transition
const productSchema = z.object({
  name: z.string().describe("Name of the product or service"),
  price: z.number().positive().describe("Price per unit"),
  salesVolume: z.number().positive().describe("Expected sales volume"),
  salesPeriod: z.enum(["monthly", "daily"]).describe("Period for the sales volume"),
})

const subscriptionSchema = z.object({
  name: z.string().describe("Name of the subscription service"),
  price: z.number().positive().describe("Monthly subscription price"),
  subscribers: z.number().positive().describe("Number of monthly subscribers"),
})

export const canvasGenerationSchema = z.object({
  projectName: z
    .string()
    .describe("A catchy 3-word name for this business idea"),
  partnerships: z
    .array(z.string())
    .max(10)
    .describe("Key partnerships needed for the business (5-10 items)"),
  activities: z
    .array(z.string())
    .max(10)
    .describe("Key activities the business must perform (5-10 items)"),
  resources: z
    .array(z.string())
    .max(10)
    .describe("Key resources required to operate (5-10 items)"),
  valueProposition: z
    .array(z.string())
    .max(2)
    .describe("Core value proposition - what unique value is offered (1-2 concise statements)"),
  customerRelationships: z
    .array(z.string())
    .max(10)
    .describe("Types of customer relationships to establish (5-10 items)"),
  channels: z
    .array(z.string())
    .max(10)
    .describe("Channels to reach and deliver value to customers (5-10 items)"),
  customerSegments: z
    .array(z.string())
    .max(10)
    .describe("Target customer segments (5-10 items)"),
  // Cost structure
  upfrontCosts: z
    .array(upfrontCostSchema)
    .max(10)
    .describe("One-time startup costs needed to launch (5-10 items)"),
  runningCosts: z
    .array(runningCostSchema)
    .max(10)
    .describe("Ongoing operating costs (5-10 items)"),
  // Unified revenue streams
  revenueStreams: z
    .array(revenueStreamSchema)
    .max(10)
    .optional()
    .describe("Revenue streams - can be products (one-time sales) or subscriptions (recurring). Use type field to distinguish. (5-10 items)"),
  // Legacy fields - kept for backward compatibility
  products: z
    .array(productSchema)
    .max(10)
    .optional()
    .describe("DEPRECATED: Use revenueStreams with type='product' instead. Products or services with pricing and expected sales volumes"),
  subscriptions: z
    .array(subscriptionSchema)
    .max(10)
    .optional()
    .describe("DEPRECATED: Use revenueStreams with type='subscription' instead. Subscription services with monthly pricing and subscriber counts"),
  // Flag for non-product-sales businesses
  revenueModelNote: z
    .string()
    .optional()
    .describe("If this business doesn't suit a product sales or subscription model, explain what revenue model would be better and why the user should configure it manually"),
})

export type CanvasGeneration = z.infer<typeof canvasGenerationSchema>
export type UpfrontCostGeneration = z.infer<typeof upfrontCostSchema>
export type RunningCostGeneration = z.infer<typeof runningCostSchema>
export type RevenueStreamGeneration = z.infer<typeof revenueStreamSchema>
// Legacy types
export type ProductGeneration = z.infer<typeof productSchema>
export type SubscriptionGeneration = z.infer<typeof subscriptionSchema>
