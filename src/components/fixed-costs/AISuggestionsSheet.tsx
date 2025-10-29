"use client";

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { useProject } from "@/lib/context/ProjectContext";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { costIdeasSchema, type CostIdea } from "@/app/api/ai/cost-ideas/schema";
import { useRouter } from "next/navigation";
import { useDailyRateLimit } from "@/hooks/use-daily-rate-limit";

interface AISuggestionsSheetProps {
  onAddFixedCost?: (data: { name: string; categoryId: string; amount?: number; frequency?: "monthly" | "annual" }) => void;
}

export function AISuggestionsSheet({ onAddFixedCost }: AISuggestionsSheetProps) {
  const { project, isLoading: isProjectLoading } = useProject();
  const router = useRouter();
  const usage = useDailyRateLimit("ai-cost-ideas", 10);

  const { object, submit, isLoading, error, stop } = useObject({
    api: "/api/ai/cost-ideas",
    schema: costIdeasSchema,
  });

  function buildProjectPayload() {
    if (!project) return null;
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
    };
  }

  const items: Array<Partial<CostIdea>> = Array.isArray(object?.costIdeas)
    ? (object!.costIdeas as Array<Partial<CostIdea>>)
    : [];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 w-full sm:w-auto">
          <Sparkles className="h-4 w-4" />
          AI cost suggestions
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-[520px]">
        <SheetHeader className="pb-2 border-b">
          <SheetTitle>AI cost suggestions</SheetTitle>
          <SheetDescription>
            Identify costs you might want to consider adding to your project.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-6rem)] sm:pr-4">
          <div className="space-y-4 py-4">
            <div className="text-xs text-muted-foreground">
              {usage.count}/{usage.limit} today • {usage.remaining} left • resets {usage.resetIn}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={() => {
                  const payload = buildProjectPayload();
                  if (!payload) return;
                  if (!usage.canUse) return;
                  usage.increment();
                  submit({ project: payload });
                }}
                disabled={isLoading || isProjectLoading || !usage.canUse}
              >
                Generate suggestions
              </Button>
              {isLoading ? (
                <Button variant="outline" onClick={() => stop?.()}>
                  Stop
                </Button>
              ) : null}
              {!usage.canUse ? (
                <div className="text-xs text-red-600 ml-2">Daily limit reached. Resets {usage.resetIn}.</div>
              ) : null}
              {error ? (
                <div className="text-sm text-red-600 ml-2">Something went wrong. Please try again.</div>
              ) : null}
            </div>

            {isLoading ? (
              <TextShimmer className="text-sm">Analyzing your project and generating ideas…</TextShimmer>
            ) : null}

            {typeof object?.reasoning === "string" && object.reasoning.trim() ? (
              <div className="text-sm leading-relaxed whitespace-pre-wrap">{object.reasoning}</div>
            ) : null}

            <div className="grid grid-cols-1 gap-3">
              {items.map((ci, idx) => (
                <Card 
                key={idx}
                className="p-1 gap-0 rounded-sm"
                >
                  <CardHeader className="p-2 text-sm">
                    <CardTitle>{ci?.title ?? "Untitled"}</CardTitle>
                    <CardDescription>
                      {(ci?.category ?? "uncategorized").toString()} • {(ci?.kind ?? "one-time").toString()} • {ci?.estimate?.currency ?? "USD"} {typeof ci?.estimate?.amount === "number" ? ci.estimate.amount : "-"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-2">
                    <div className="text-sm leading-relaxed mb-2">{ci?.description ?? ""}</div>
                    <div className="flex gap-2">
                      {ci?.kind === "monthly" ? (
                        <Button
                          size="sm"
                          onClick={() => {
                            if (!onAddFixedCost) return;
                            const name = (ci?.title ?? "").toString();
                            const amount = typeof ci?.estimate?.amount === "number" ? ci.estimate.amount : undefined;
                            const categoryId = (ci?.category ?? "other").toString();
                            onAddFixedCost({ name, categoryId, amount, frequency: "monthly" });
                          }}
                          disabled={isProjectLoading}
                        >
                          Add as operating cost
                        </Button>
                      ) : null}
                      {ci?.kind === "one-time" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (!project) return;
                            const name = encodeURIComponent((ci?.title ?? "").toString());
                            const amount = encodeURIComponent(
                              typeof ci?.estimate?.amount === "number" ? String(ci.estimate.amount) : ""
                            );
                            router.push(`/projects/${project.id}/upfront-costs?open=true&prefillName=${name}&prefillAmount=${amount}`);
                          }}
                          disabled={isProjectLoading}
                        >
                          Add as upfront cost
                        </Button>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}


