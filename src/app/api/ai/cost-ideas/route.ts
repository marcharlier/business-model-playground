import { NextRequest } from "next/server"
import { openai } from "@ai-sdk/openai"
import { streamObject } from "ai"
import { costIdeasSchema } from "./schema"
import { FIXED_COST_CATEGORIES } from "@/lib/constants/fixedCostCategories"

export const maxDuration = 30

type CanvasItem = { id: string; text: string }

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const project = body?.project as {
      name?: string
      description?: string
      currency?: string
      fixedCosts?: Array<{ name: string; amount: number; frequency: string; category: string }>
      upfrontCosts?: Array<{ name: string; amount: number }>
      products?: Array<{ name: string; price: number; salesVolume?: number; salesPeriod?: string }>
      // Canvas sections
      partnerships?: CanvasItem[]
      activities?: CanvasItem[]
      valueProposition?: CanvasItem[]
      customerRelationships?: CanvasItem[]
      customerSegments?: CanvasItem[]
      resources?: CanvasItem[]
      channels?: CanvasItem[]
    }

    const name = project?.name ?? "(unknown)"
    const description = project?.description ?? ""
    const currency = project?.currency ?? "USD"
    const fixedCosts = Array.isArray(project?.fixedCosts) ? project!.fixedCosts : []
    const upfrontCosts = Array.isArray(project?.upfrontCosts) ? project!.upfrontCosts : []
    const products = Array.isArray(project?.products) ? project!.products : []

    // Canvas sections
    const partnerships = Array.isArray(project?.partnerships) ? project!.partnerships : []
    const activities = Array.isArray(project?.activities) ? project!.activities : []
    const valueProposition = Array.isArray(project?.valueProposition) ? project!.valueProposition : []
    const customerRelationships = Array.isArray(project?.customerRelationships) ? project!.customerRelationships : []
    const customerSegments = Array.isArray(project?.customerSegments) ? project!.customerSegments : []
    const resources = Array.isArray(project?.resources) ? project!.resources : []
    const channels = Array.isArray(project?.channels) ? project!.channels : []

    const categoriesList = FIXED_COST_CATEGORIES.map((c) => {
      const examples = c.examples.slice(0, 3).join(", ")
      return `- ${c.id} (${c.name}): e.g. ${examples}`
    }).join("\n")

    const system = `You are an upbeat, practical startup coach helping someone explore launching a new business from scratch. Your role is to help them think through the essential costs they'll need to budget for BEFORE they launch.

Key principles:
- Focus on INITIAL costs needed to get started, not improvements or upgrades to existing operations
- Think "what do I need to spend to launch this?" not "what could make this better?"
- Suggest foundational costs that are essential for the business type described
- Be realistic about startup budgets - suggest lean/MVP approaches where appropriate
- Avoid suggesting things that sound like enhancements (e.g., "upgrade your...", "improve your...", "advanced...")

Output must strictly match the JSON schema: a short (2–3 sentences) 'reasoning' and up to 5 'costIdeas'. Use a friendly, encouraging tone. When setting a cost 'category', you MUST use one of the allowed category ids exactly as listed. For 'estimate.currency', you MUST use the project currency provided.`

    const existingFixed = fixedCosts
      .map((c) => `- ${c.name} (${c.category}, ${c.frequency}): ${currency} ${c.amount}`)
      .join("\n")
    const existingUpfront = upfrontCosts
      .map((c) => `- ${c.name}: ${currency} ${c.amount}`)
      .join("\n")
    const existingProducts = products.map((p) => {
      const salesInfo = p.salesVolume ? ` • ${p.salesVolume} ${p.salesPeriod ?? 'monthly'} sales` : ''
      return `- ${p.name}: ${currency} ${p.price}${salesInfo}`
    }).join("\n")

    // Format canvas sections (only include if they have content)
    const formatCanvasSection = (items: CanvasItem[]) => 
      items.length > 0 ? items.map(i => `- ${i.text}`).join("\n") : "(not yet defined)"

    // Build canvas context section
    const canvasSections = []
    
    if (valueProposition.length > 0) {
      canvasSections.push(`Value Proposition:\n${formatCanvasSection(valueProposition)}`)
    }
    if (customerSegments.length > 0) {
      canvasSections.push(`Customer Segments:\n${formatCanvasSection(customerSegments)}`)
    }
    if (activities.length > 0) {
      canvasSections.push(`Key Activities:\n${formatCanvasSection(activities)}`)
    }
    if (resources.length > 0) {
      canvasSections.push(`Key Resources:\n${formatCanvasSection(resources)}`)
    }
    if (partnerships.length > 0) {
      canvasSections.push(`Key Partnerships:\n${formatCanvasSection(partnerships)}`)
    }
    if (channels.length > 0) {
      canvasSections.push(`Channels:\n${formatCanvasSection(channels)}`)
    }
    if (customerRelationships.length > 0) {
      canvasSections.push(`Customer Relationships:\n${formatCanvasSection(customerRelationships)}`)
    }

    const hasCanvasContext = canvasSections.length > 0
    const canvasContextBlock = hasCanvasContext
      ? `\n--- Business Model Canvas Context ---\n${canvasSections.join("\n\n")}\n--- End Canvas Context ---\n`
      : ""

    const canvasInstruction = hasCanvasContext
      ? "Use the Business Model Canvas context to suggest initial startup costs that align with the stated activities, resources, partnerships, and channels. Think about what they'll need to spend to get started with each element."
      : "Focus on common startup costs based on the project name and description."

    const user = `Project name: ${name}
Project description: ${description}
Currency: ${currency}
${canvasContextBlock}
Costs they've already identified:\n${existingFixed || "(none)"}

Upfront investments they've planned:\n${existingUpfront || "(none)"}

Products/services they plan to offer:\n${existingProducts || "(none)"}

Allowed fixed cost categories (use the id exactly):\n${categoriesList}

Task: Help this person think through the costs of LAUNCHING their new business. ${canvasInstruction}

Important: This person is exploring starting this business from scratch. Focus on:
- Essential startup costs they might not have thought of yet
- Initial setup costs (not upgrades or improvements)
- Realistic estimates for someone just getting started
- A mix of one-time launch costs and ongoing operating costs they'll face from day one

Give a friendly, concise 2–3 sentence reasoning about their cost planning so far and what else they should consider for launch. Then propose up to 5 additional cost ideas (mix of one-time and monthly) that are not duplicates of what they've already listed. For each idea: use a valid category id from the list above; set estimate.currency to the project currency "${currency}"; keep amounts realistic and lean for a startup. Keep the whole response short.`

    const result = await streamObject({
      model: openai("gpt-5-nano"),
      schema: costIdeasSchema,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    })

    return result.toTextStreamResponse()
  } catch {
    return new Response("Failed to generate cost ideas", { status: 500 })
  }
}


