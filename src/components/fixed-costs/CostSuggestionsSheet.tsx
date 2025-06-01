import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CostSuggestion, COST_SUGGESTIONS } from "@/lib/constants/cost-suggestions";
import { FIXED_COST_CATEGORIES } from "@/lib/constants/fixedCostCategories";
import { CostSuggestionItem } from "./CostSuggestionItem";
import { Lightbulb } from "lucide-react";
import type { FixedCost } from "@/lib/storage/types";

interface CostSuggestionsSheetProps {
  onSelectSuggestion: (suggestion: CostSuggestion) => void;
  existingCosts: FixedCost[];
}

export function CostSuggestionsSheet({ onSelectSuggestion, existingCosts }: CostSuggestionsSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 w-full sm:w-auto">
          <Lightbulb className="h-4 w-4" />
          Browse suggestions
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-[400px]">
        <SheetHeader className="pb-2 border-b">
          <SheetTitle>Cost Suggestions</SheetTitle>
          <SheetDescription>
            <p>
              Suggestions to help you get started.
            </p>
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-6rem)] sm:pr-4">
          <div className="space-y-6 py-4">
            {FIXED_COST_CATEGORIES.map((category) => {
              const categorySuggestions = COST_SUGGESTIONS.filter(
                (suggestion) => suggestion.categoryId === category.id
              );

              if (categorySuggestions.length === 0) return null;

              return (
                <div key={category.id} className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground pl-2.5 pb-1">
                    {category.name}
                  </h3>
                  <div className="rounded-md border">
                    {categorySuggestions.map((suggestion) => (
                      <CostSuggestionItem
                        key={suggestion.id}
                        suggestion={suggestion}
                        onClick={onSelectSuggestion}
                        existingCosts={existingCosts}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
} 