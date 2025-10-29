import { z } from "zod"
import { Currency } from "@/lib/domain/schema"
import { FIXED_COST_CATEGORIES } from "@/lib/constants/fixedCostCategories"

// Build a runtime enum for valid fixed cost category ids
const CATEGORY_IDS = FIXED_COST_CATEGORIES.map((c) => c.id) as [string, ...string[]]

export const costIdeaSchema = z.object({
  title: z.string().describe("Short, human-readable cost name"),
  category: z
    .enum(CATEGORY_IDS)
    .describe(
      `Category id. Must be one of: ${FIXED_COST_CATEGORIES.map((c) => c.id).join(", ")}`
    ),
  kind: z.enum(["one-time", "monthly"]).describe("Cost type"),
  estimate: z
    .object({
      amount: z.number().describe("Estimated amount as a number"),
      currency: Currency.describe("Project currency: GBP, USD or EUR"),
    })
    .describe("Rough estimate of cost"),
  description: z.string().describe("One or two sentences rationale"),
  confidence: z
    .enum(["low", "medium", "high"]) 
    .optional()
    .describe("Optional model confidence"),
})

export const costIdeasSchema = z.object({
  reasoning: z
    .string()
    .describe(
      "One-paragraph reasoning that reflects on the project and existing costs and explains the suggested additional costs"
    ),
  costIdeas: z
    .array(costIdeaSchema)
    .max(5)
    .describe("List of suggested cost ideas (max 5)"),
})

export type CostIdea = z.infer<typeof costIdeaSchema>
export type CostIdeas = z.infer<typeof costIdeasSchema>


