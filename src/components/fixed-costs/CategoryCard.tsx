'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusIcon, PencilIcon, Trash2, InfoIcon } from 'lucide-react';
import { fixedCostStorage } from '@/lib/storage/fixedCostStorage';
import { parseCurrencyInput } from '@/lib/utils/currency';
import { formatCurrency } from '@/lib/utils/currency';
import type { FixedCost } from '@/lib/storage/types';
import type { FixedCostCategory } from '@/lib/constants/fixedCostCategories';
import type { Currency } from '@/lib/storage/types';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useMediaQuery } from '@/hooks/use-media-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { LongPressButton } from '@/components/ui/long-press-button';
import { Toggle } from '@/components/ui/toggle';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

function FixedCostForm({ 
  className,
  cost,
  currency,
  onSave,
  onCancel,
  onDelete,
  isSubmitting,
  hideCancel,
  preFilledName,
  preFilledAmount,
  preFilledFrequency
}: {
  className?: string;
  cost?: FixedCost;
  currency: Currency;
  onSave: (name: string, amount: number, frequency: 'monthly' | 'annual') => void;
  onCancel: () => void;
  onDelete: () => void;
  isSubmitting: boolean;
  hideCancel?: boolean;
  preFilledName?: string;
  preFilledAmount?: number;
  preFilledFrequency?: 'monthly' | 'annual';
}) {
  const [name, setName] = useState(cost?.name ?? preFilledName ?? '');
  const [amount, setAmount] = useState(
    cost?.amount !== undefined ? cost.amount.toString() : preFilledAmount !== undefined ? String(preFilledAmount) : ''
  );
  const [frequency, setFrequency] = useState<'monthly' | 'annual'>(
    cost?.frequency === 'annual' ? 'annual' : preFilledFrequency ?? 'monthly'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && amount.trim()) {
      const parsedAmount = parseCurrencyInput(amount);
      onSave(name.trim(), parsedAmount, frequency);
    }
  };

  return (
    <form className={cn("space-y-4", className)} onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="cost-name">Cost name</Label>
        <Input
          id="cost-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isSubmitting}
          placeholder="Enter cost name"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <CurrencyInput
          id="cost-amount"
          label="Amount"
          currency={currency}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={isSubmitting}
        />
        <div className="space-y-2">
          <Label htmlFor="frequency">Frequency</Label>
          <Select 
            value={frequency} 
            onValueChange={(value) => setFrequency(value as 'monthly' | 'annual')} 
            disabled={isSubmitting}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="annual">Annual</SelectItem>
              
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator className="my-4" />

      <div className={`${hideCancel ? 'flex flex-col' : 'flex flex-row justify-between'} gap-2`}>
        {!hideCancel && (
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={onCancel}
            className="h-9 flex-1"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button 
          type="submit" 
          size="sm" 
          disabled={isSubmitting || !name.trim() || !amount.trim()}
          className={`h-9 ${hideCancel ? 'w-full' : 'flex-1'}`}
        >
          {cost ? 'Save changes' : 'Add cost'}
        </Button>
      </div>

      {cost && (
        <Accordion type="single" collapsible>
          <AccordionItem value="delete">
            <AccordionTrigger className="py-2 text-destructive">Delete this cost?</AccordionTrigger>
            <AccordionContent>
              <LongPressButton
                variant="destructive"
                onLongPress={onDelete}
                disabled={isSubmitting}
                className="gap-2 w-full"
                duration={2000}
              >
                <Trash2 className="h-4 w-4" />
                Long press to delete
              </LongPressButton>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </form>
  );
}

interface CategoryCardProps {
  category: FixedCostCategory;
  costs: FixedCost[];
  projectId: string;
  currency: Currency;
  onCostAdded: () => void;
  onCostUpdated: () => void;
  onCostDeleted: () => void;
  isSelected?: boolean;
  onSelectionChange?: (selected: boolean) => void;
  preFilledName?: string;
  preFilledAmount?: number;
  preFilledFrequency?: 'monthly' | 'annual';
}

export function CategoryCard({
  category,
  costs,
  projectId,
  currency,
  onCostAdded,
  onCostUpdated,
  onCostDeleted,
  isSelected = false,
  onSelectionChange,
  preFilledName,
  preFilledAmount,
  preFilledFrequency
}: CategoryCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingCostId, setEditingCostId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExamples, setShowExamples] = useState(costs.length === 0);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    if (costs.length > 0) {
      setShowExamples(false);
    }
  }, [costs.length]);

  useEffect(() => {
    if (isSelected && !isAdding && !editingCostId) {
      setIsAdding(true);
    }
  }, [isSelected, isAdding, editingCostId]);

  const handleAddClick = () => {
    setIsAdding(true);
    onSelectionChange?.(true);
  };

  const handleEditClick = (cost: FixedCost) => {
    setEditingCostId(cost.id);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingCostId(null);
    setIsSubmitting(false);
    onSelectionChange?.(false);
  };

  const handleSave = async (name: string, amount: number, frequency: 'monthly' | 'annual') => {
    setIsSubmitting(true);
    try {
      if (editingCostId) {
        // Update existing cost
        const costToUpdate = costs.find(c => c.id === editingCostId);
        if (costToUpdate) {
          fixedCostStorage.updateFixedCost(projectId, {
            ...costToUpdate,
            name,
            amount,
            frequency
          });
          onCostUpdated();
        }
      } else if (isAdding) {
        // Create new cost
        fixedCostStorage.createFixedCost(
          projectId,
          name,
          amount,
          frequency,
          category.id
        );
        onCostAdded();
      }
      
      // Reset form
      handleCancel();
    } catch (error) {
      console.error('Error saving fixed cost:', error);
      setIsSubmitting(false);
    }
  };

  const handleDelete = (costId: string) => {
    try {
      fixedCostStorage.deleteFixedCost(projectId, costId);
      onCostDeleted();
      handleCancel(); // Close the form after successful deletion
    } catch (error) {
      console.error('Error deleting fixed cost:', error);
    }
  };

  const editingCost = editingCostId ? costs.find(c => c.id === editingCostId) : undefined;

  const renderForm = () => {
    const form = (
      <FixedCostForm
        cost={editingCost}
        currency={currency}
        onSave={handleSave}
        onCancel={handleCancel}
        onDelete={() => editingCost && handleDelete(editingCost.id)}
        isSubmitting={isSubmitting}
        hideCancel={!isDesktop}
        preFilledName={preFilledName}
        preFilledAmount={preFilledAmount}
        preFilledFrequency={preFilledFrequency}
      />
    );

    if (isDesktop) {
      return (
        <Dialog open={isAdding || !!editingCostId} onOpenChange={(open) => !open && handleCancel()}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingCost ? 'Edit cost' : 'Add cost'}</DialogTitle>
              <DialogDescription>
                {editingCost 
                  ? `Make changes to your cost in the ${category.name} category.`
                  : `Add a new cost to the ${category.name} category.`}
              </DialogDescription>
            </DialogHeader>
            {form}
          </DialogContent>
        </Dialog>
      );
    }

    return (
      <Drawer open={isAdding || !!editingCostId} onOpenChange={(open) => !open && handleCancel()} repositionInputs={false}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{editingCost ? 'Edit cost' : 'Add cost'}</DrawerTitle>
            <DrawerDescription>
              {editingCost 
                ? `Make changes to your cost in the ${category.name} category.`
                : `Add a new cost to the ${category.name} category.`}
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4">
            {form}
          </div>
          <DrawerFooter className="pt-2">
            <DrawerClose asChild>
              <Button variant="outline" onClick={handleCancel}>Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  };

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
                  onClick={() => handleEditClick(cost)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleEditClick(cost);
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
                                handleEditClick(cost);
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
          <Button size="sm" variant="outline" className="w-full" onClick={handleAddClick}>
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Cost
          </Button>
          </div>
        </div>
      </CardContent>
      {renderForm()}
    </Card>
  );
} 