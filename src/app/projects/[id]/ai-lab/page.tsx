"use client"

import * as React from "react"
import { experimental_useObject as useObject } from "@ai-sdk/react"
import { costIdeasSchema, type CostIdea } from "@/app/api/ai/cost-ideas/schema"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useProject } from "@/lib/context/ProjectContext"
import { TextShimmer } from '@/components/ui/text-shimmer';

export default function AiLabPage() {
  const { project, isLoading: isProjectLoading } = useProject()

  const { object, submit, isLoading, error, stop } = useObject({
    api: "/api/ai/cost-ideas",
    schema: costIdeasSchema,
  })

  function buildProjectPayload() {
    if (!project) return null
    return {
      name: project.name,
      description: project.description ?? "",
      currency: project.currency,
      fixedCosts: project.fixedCosts.map((c) => ({
        name: c.name,
        amount: c.amount,
        frequency: c.frequency,
        category: c.category,
      })),
      upfrontCosts: project.upfrontCosts.map((c) => ({ name: c.name, amount: c.amount })),
      products: project.products.map((p) => ({ name: p.name, price: p.price })),
    }
  }

  // No auto-run; generation happens only on user action

  const items: Array<Partial<CostIdea>> = Array.isArray(object?.costIdeas)
    ? (object!.costIdeas as Array<Partial<CostIdea>>)
    : []

  return (
    <div className="container mx-auto max-w-3xl p-4 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button onClick={() => {
          const payload = buildProjectPayload();
          if (payload) submit({ project: payload })
        }} disabled={isLoading || isProjectLoading}>
          Generate suggestions
        </Button>
        {isLoading ? (
          <Button variant="outline" onClick={() => stop?.()}>
            Stop
          </Button>
        ) : null}
        {error ? (
          <div className="text-sm text-red-600 ml-2">Something went wrong. Please try again.</div>
        ) : null}
      </div>

      {isLoading ? (
        <TextShimmer className="text-sm">Analyzing your project and generating up to 5 ideas…</TextShimmer>
      ) : null}

      {typeof object?.reasoning === "string" && object.reasoning.trim() ? (
        <>
            <div className="text-sm leading-relaxed whitespace-pre-wrap">{object.reasoning}</div>
        </>
      ) : null}

      <div className="grid grid-cols-1 gap-3">
        {items.map((ci, idx) => (
          <Card key={idx}>
            <CardHeader>
              <CardTitle>{ci?.title ?? "Untitled"}</CardTitle>
              <CardDescription>
                {(ci?.category ?? "uncategorized").toString()} • {(ci?.kind ?? "one-time").toString()} • {ci?.estimate?.currency ?? "USD"} {typeof ci?.estimate?.amount === "number" ? ci.estimate.amount : "-"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm leading-relaxed">{ci?.description ?? ""}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}


