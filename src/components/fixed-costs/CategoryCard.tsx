'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusIcon, PencilIcon, InfoIcon } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';
import type { FixedCost } from '@/lib/storage/types';
import type { FixedCostCategory } from '@/lib/constants/fixedCostCategories';
import type { Currency } from '@/lib/storage/types';
import { Toggle } from '@/components/ui/toggle';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CategoryCardProps {
  category: FixedCostCategory;
  costs: FixedCost[];
  currency: Currency;
  onAddClick: (categoryId: string) => void;
  onEditClick: (cost: FixedCost) => void;
}

export function CategoryCard({
  category,
  costs,
  currency,
  onAddClick,
  onEditClick,
}: CategoryCardProps) {
  const [showExamples, setShowExamples] = useState(costs.length === 0);

  useEffect(() => {
    if (costs.length > 0) {
      setShowExamples(false);
    }
  }, [costs.length]);

  return (
    <Card className="h-full relative transition-all gap-0 pt-4 pb-2">
      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
        <CardTitle className="capitalize">{category.name}</CardTitle>
        <Toggle
          size="sm"
          variant="default"
          pressed={showExamples}
          onPressedChange={setShowExamples}
          aria-label="Toggle examples"
        >
          <InfoIcon className="h-4 w-4 text-muted-foreground" />
        </Toggle>
      </CardHeader>
      <CardContent className="px-0">
        <div className="">
          {showExamples && (
            <div className="px-6 pb-4">
              <p className="text-xs text-muted-foreground italic">
                {category.description}{' '}
                For example:{' '}
                {category.examples.join(', ')}
              </p>
            </div>
          )}
          {costs.length > 0 && (
            <ul className="">
              {costs.map(cost => (
                <div
                  key={cost.id}
                  className="w-full flex justify-between items-center cursor-pointer hover:bg-accent/50 transition-colors border-t px-6 py-2"
                  onClick={() => onEditClick(cost)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onEditClick(cost);
                    }
                  }}
                >
                  <div>
                    <p className="font-small text-sm">{cost.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="font-small text-sm">{formatCurrency(cost.amount, currency)}</p>
                      <p className="text-xs text-muted-foreground">{cost.frequency}</p>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditClick(cost);
                            }}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              ))}
            </ul>
          )}
          <div className="border-t px-6 py-2 pt-4">
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => onAddClick(category.id)}
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Cost
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
