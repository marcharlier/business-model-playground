import { CopyPlus, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CostSuggestion } from '@/lib/constants/cost-suggestions';
import type { FixedCost } from '@/lib/storage/types';

interface CostSuggestionItemProps {
  suggestion: CostSuggestion;
  onClick: (suggestion: CostSuggestion) => void;
  existingCosts: FixedCost[];
}

export function CostSuggestionItem({ suggestion, onClick, existingCosts }: CostSuggestionItemProps) {
  const isExisting = existingCosts.some(cost => cost.name === suggestion.name);

  return (
    <button
      onClick={() => onClick(suggestion)}
      className={cn(
        "flex items-center gap-2 w-full px-4 py-2 text-sm transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        isExisting && "opacity-50 cursor-not-allowed"
      )}
      disabled={isExisting}
    >
      {isExisting ? (
        <Check className="h-4 w-4 text-muted-foreground" />
      ) : (
        <CopyPlus className="h-4 w-4" />
      )}
      <span className={cn(isExisting && "text-muted-foreground")}>{suggestion.name}</span>
    </button>
  );
} 