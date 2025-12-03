"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { LongPressButton } from '@/components/ui/long-press-button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Loader2, Trash2 } from 'lucide-react';
import { FIXED_COST_CATEGORIES } from '@/lib/constants/fixedCostCategories';
import type { FixedCost, UpfrontCost, Currency } from '@/lib/storage/types';

type UnifiedCost = FixedCost | UpfrontCost;

export interface CostFormData {
  name: string;
  amount: number;
  costType: 'upfront' | 'operating';
  category?: string;
  frequency?: 'monthly' | 'annual';
}

interface CostFormProps {
  className?: string;
  cost?: UnifiedCost;
  costType: 'upfront' | 'operating';
  currency: Currency;
  onSave: (data: CostFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  hideCancel?: boolean;
  onDelete?: () => void;
  toggleEnabled: boolean;
  categoryPreselected?: string;
  prefillName?: string;
  prefillAmount?: string;
  prefillFrequency?: 'monthly' | 'annual';
}

export function CostForm({
  className,
  cost,
  costType: initialCostType,
  currency,
  onSave,
  onCancel,
  isSubmitting,
  hideCancel = false,
  onDelete,
  toggleEnabled,
  categoryPreselected,
  prefillName,
  prefillAmount,
  prefillFrequency,
}: CostFormProps) {
  // Determine initial cost type from cost object if in edit mode
  const isEditMode = !!cost;
  const editModeCostType: 'upfront' | 'operating' =
    cost && 'category' in cost ? 'operating' : 'upfront';

  // State
  const [costType, setCostType] = useState<'upfront' | 'operating'>(
    isEditMode ? editModeCostType : initialCostType
  );
  const [name, setName] = useState(cost?.name ?? prefillName ?? '');
  const [amount, setAmount] = useState(
    cost?.amount ? String(cost.amount) : prefillAmount ?? ''
  );
  const [category, setCategory] = useState<string | undefined>(
    cost && 'category' in cost ? cost.category : categoryPreselected ?? 'other'
  );
  const [frequency, setFrequency] = useState<'monthly' | 'annual'>(
    cost && 'frequency' in cost ? cost.frequency : prefillFrequency ?? 'monthly'
  );

  // Handle toggle between cost types
  const handleToggle = (newType: 'upfront' | 'operating') => {
    if (!toggleEnabled) return;
    setCostType(newType);

    // Preserve name and amount, clear operating-specific fields when switching to upfront
    if (newType === 'upfront') {
      setCategory(undefined);
      setFrequency('monthly');
    } else {
      // Set default category when switching to operating
      if (!category) {
        setCategory(categoryPreselected ?? 'other');
      }
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      return;
    }

    if (!name.trim()) {
      return;
    }

    const formData: CostFormData = {
      name: name.trim(),
      amount: parsedAmount,
      costType,
    };

    // Add operating-specific fields
    if (costType === 'operating') {
      formData.category = category ?? 'other';
      formData.frequency = frequency;
    }

    onSave(formData);
  };

  const isValid = name.trim() && amount && !isNaN(parseFloat(amount)) && parseFloat(amount) >= 0;

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="space-y-4">
        {/* Cost Name */}
        <div className="space-y-2">
          <Label htmlFor="cost-name">Cost name</Label>
          <Input
            id="cost-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Office Rent"
            disabled={isSubmitting}
          />
        </div>

        {/* Cost Type Toggle */}
        <div className="bg-muted rounded-md p-3 space-y-2">
          <Label>Cost Type</Label>
          <Tabs
            value={costType}
            onValueChange={(v) => handleToggle(v as 'upfront' | 'operating')}
            className="mt-2"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="upfront"
                disabled={!toggleEnabled}
              >
                Upfront
              </TabsTrigger>
              <TabsTrigger
                value="operating"
                disabled={!toggleEnabled}
              >
                Operating
              </TabsTrigger>
            </TabsList>
          </Tabs>
          { costType == 'upfront' && <p className="text-xs text-foreground/50">One off startup costs. These will not be included in operating metrics.</p>}
          { costType == 'operating' && <p className="text-xs text-foreground/50">Costs for the running of your business.</p>}
        </div>

        {/* Amount */}
        <div className="flex flex-row bg-muted rounded-md p-3 gap-2">
        <div className="flex-1 space-y-2">
          <Label htmlFor="cost-amount">Amount</Label>
          <CurrencyInput
            id="cost-amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            currency={currency}
            disabled={isSubmitting}
          />
          </div>
            {/* Frequency */}
            {costType === 'operating' && (
            <div className="flex-1 space-y-2">
              <Label htmlFor="cost-frequency">Frequency</Label>
              <Select
                value={frequency}
                onValueChange={(v) => setFrequency(v as 'monthly' | 'annual')}
                disabled={isSubmitting}
              >
                <SelectTrigger id="cost-frequency" className="w-full bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
        </div>

        {/* Operating-specific fields */}
        {costType === 'operating' && (
          <div className="flex flex-row bg-muted rounded-md p-3 gap-2">
            {/* Category */}
            <div className="flex-1 space-y-2">
              <Label htmlFor="cost-category">Category</Label>
              <Select
                value={category}
                onValueChange={setCategory}
                disabled={isSubmitting}
              >
                <SelectTrigger id="cost-category" className="w-full bg-background">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {FIXED_COST_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <Separator className="my-4" />

        {/* Action Buttons */}
        <div className={`${hideCancel ? 'flex flex-col' : 'flex flex-row justify-between'} gap-2`}>
        {!hideCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="h-9 flex-1"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={!isValid || isSubmitting}
            className={`h-9 ${hideCancel ? 'w-full' : 'flex-1'}`}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? 'Save changes' : 'Add cost'}
          </Button>
        </div>

        {/* Delete Section (Edit Mode Only) */}
        {isEditMode && onDelete && (
          <Accordion type="single" collapsible className="">
            <AccordionItem value="delete" className="border-none">
              <AccordionTrigger className="text-sm text-muted-foreground hover:text-destructive py-2">
                Delete this cost
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-2">
                <LongPressButton
                  variant="destructive"
                  onLongPress={() => onDelete?.()}
                  disabled={isSubmitting}
                  className="gap-2 w-full"
                  duration={2000}
                >
                  <Trash2 className="h-4 w-4" />
                  Long press to delete
                </LongPressButton>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </div>
    </form>
  );
}
