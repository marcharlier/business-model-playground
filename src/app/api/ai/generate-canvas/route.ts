import { NextRequest } from "next/server"
import { openai } from "@ai-sdk/openai"
import { streamObject } from "ai"
import { canvasGenerationSchema } from "./schema"
import { FIXED_COST_CATEGORIES } from "@/lib/constants/fixedCostCategories"

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const prompt = body?.prompt as string | undefined
    const currency = body?.currency as string | undefined

    if (!prompt || prompt.trim().length < 10) {
      return new Response("Please provide a more detailed business description", { status: 400 })
    }

    const categoriesList = FIXED_COST_CATEGORIES.map((c) => {
      const examples = c.examples.slice(0, 3).join(", ")
      return `- ${c.id}: ${c.name} (e.g. ${examples})`
    }).join("\n")

    const system = `You are an expert business strategist helping someone develop a complete Business Model Canvas for their new business idea. Your role is to analyze their business description and generate a comprehensive, practical business model including costs and revenue projections.

Key principles:
- Be specific and actionable - avoid generic suggestions
- Tailor everything to the specific business described
- Think from a startup/new business perspective
- Focus on what's essential to get started and grow
- All monetary amounts should be in ${currency || 'USD'}

Output requirements:
- projectName: Create a catchy, memorable 3-word name that captures the essence of the business
- Each canvas section should have 5-10 specific, relevant items (except value proposition which should be 1-2 concise core statements)
- Value proposition should be very concise - just the core unique value in 1-2 short statements
- Avoid generic items like "social media marketing" unless specifically relevant
- Be creative but realistic

COST STRUCTURE GUIDELINES:
- upfrontCosts: One-time startup costs to launch (equipment, initial inventory, setup costs, etc.)
- runningCosts: Ongoing operating costs with frequency (monthly or annual) and category
- For runningCosts category, you MUST use one of these exact category ids: ${FIXED_COST_CATEGORIES.map(c => c.id).join(", ")}

Category reference:
${categoriesList}

REVENUE STREAMS GUIDELINES:
- DEFAULT TO PRODUCT SALES when customers buy a concrete unit of value (a product, session, ticket, credit/token pack, class, seat, bundle, or fixed-scope service). If they can purchase something with a price and quantity, model it as a product.
- Treat prepaid credits/tokens/passes as products with tiers (e.g., 10 credits for $X, 50 credits for $Y) and realistic volume per salesPeriod.
- Use products for fixed-scope services with clear deliverables (e.g., "Starter web setup", "Workshop pass", "House cleaning visit").
- Only set products to an EMPTY ARRAY [] when the primary revenue is clearly non-transactional and not reasonably captured as per-unit purchases, such as:
  * Pure subscription/SaaS without discrete plans to sell here
  * Commission/marketplace take rates
  * Advertising-only models
  * Licensing/royalties without per-unit packaging
  * Highly bespoke consulting with no repeatable packages
  * Freemium where paid conversion cannot be expressed as discrete SKUs
  
  When you do leave products empty, provide a revenueModelNote explaining:
  1. The better revenue model for this business
  2. Why product-based pricing doesn't fit
  3. How the user should configure revenue manually
  
- For all product-friendly businesses (retail, food service, e-commerce, classes, events, credit/token packs, clear service packages), generate 5-10 realistic products with:
  * Specific product/service names or bundle tiers
  * Market-realistic prices (include bundle pricing where relevant)
  * Conservative but reasonable sales volume estimates
  * Appropriate sales period (daily for high-volume items like food/tickets, monthly for services/subscriptions/bundles)

Be biased toward productization when there is any sellable unit or bundle; only fall back to empty products when productization truly does not fit.`

    const user = `Business idea: ${prompt}

Currency: ${currency || 'USD'}

Generate a complete Business Model Canvas for this business idea including:

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
- upfrontCosts: 5-10 one-time startup costs with realistic ${currency || 'USD'} amounts
- runningCosts: 5-10 ongoing operating costs with amounts, frequency (monthly/annual), and category (use exact category ids)

REVENUE:
- If this business suits product/service sales: 5-10 products with name, price, salesVolume, and salesPeriod
- If this business does NOT suit product sales: leave products empty [] and provide a helpful revenueModelNote

Be specific to this particular business - avoid generic suggestions. Use realistic ${currency || 'USD'} amounts for this type of business.`

    const result = await streamObject({
      model: openai("gpt-4o-mini"),
      schema: canvasGenerationSchema,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error("Error generating canvas:", error)
    return new Response("Failed to generate business model canvas", { status: 500 })
  }
}
