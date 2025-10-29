import { NextRequest } from "next/server"
import { openai } from "@ai-sdk/openai"
import { streamObject } from "ai"
import { costIdeasSchema } from "./schema"
import { FIXED_COST_CATEGORIES } from "@/lib/constants/fixedCostCategories"

export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const project = body?.project as {
      name?: string
      description?: string
      currency?: string
      fixedCosts?: Array<{ name: string; amount: number; frequency: string; category: string }>
      upfrontCosts?: Array<{ name: string; amount: number }>
      products?: Array<{ name: string; price: number }>
    }

    const name = project?.name ?? "(unknown)"
    const description = project?.description ?? ""
    const currency = project?.currency ?? "USD"
    const fixedCosts = Array.isArray(project?.fixedCosts) ? project!.fixedCosts : []
    const upfrontCosts = Array.isArray(project?.upfrontCosts) ? project!.upfrontCosts : []
    const products = Array.isArray(project?.products) ? project!.products : []

    const categoriesList = FIXED_COST_CATEGORIES.map((c) => {
      const examples = c.examples.slice(0, 3).join(", ")
      return `- ${c.id} (${c.name}): e.g. ${examples}`
    }).join("\n")

    const system =
      "You are an upbeat, practical financial buddy. Keep it brief. Output must strictly match the JSON schema: a short (2–3 sentences) 'reasoning' and up to 5 'costIdeas'. Be encouraging about what's already covered, then suggest realistic, non-duplicate ideas. Use a friendly, conversational tone. When setting a cost 'category', you MUST use one of the allowed category ids exactly as listed. For 'estimate.currency', you MUST use the project currency provided."

    const existingFixed = fixedCosts
      .map((c) => `- ${c.name} (${c.category}, ${c.frequency}): ${currency} ${c.amount}`)
      .join("\n")
    const existingUpfront = upfrontCosts
      .map((c) => `- ${c.name}: ${currency} ${c.amount}`)
      .join("\n")
    const existingProducts = products.map((p) => `- ${p.name}: ${currency} ${p.price}`).join("\n")

    const user = `Project name: ${name}
Project description: ${description}
Currency: ${currency}

Existing fixed costs:\n${existingFixed || "(none)"}

Existing upfront costs:\n${existingUpfront || "(none)"}

Existing products:\n${existingProducts || "(none)"}

Allowed fixed cost categories (use the id exactly):\n${categoriesList}

Task: Analyze the project and its existing costs. Give a friendly, concise 2–3 sentence reasoning that highlights what's already solid and where to expand. Then propose up to 5 additional cost ideas (mix of one-time and monthly) that are not duplicates of the existing items. For each idea: use a valid category id from the list above; set estimate.currency to the project currency "${currency}"; keep amounts realistic for the currency. Keep the whole response short.`

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


