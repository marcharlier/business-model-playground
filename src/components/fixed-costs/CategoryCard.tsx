'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InfoIcon, PlusIcon, PencilIcon, Trash2 } from 'lucide-react';
import { fixedCostStorage } from '@/lib/storage/fixedCostStorage';
import { parseCurrencyInput } from '@/lib/utils/currency';
import { formatCurrency } from '@/lib/utils/currency';
import type { FixedCost } from '@/lib/storage/types';
import type { FixedCostCategory } from '@/lib/constants/fixedCostCategories';
import type { Currency } from '@/lib/storage/types';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
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

function FixedCostForm({ 
  className,
  cost,
  currency,
  onSave,
  onCancel,
  onDelete,
  isSubmitting,
  hideCancel
}: {
  className?: string;
  cost?: FixedCost;
  currency: Currency;
  onSave: (name: string, amount: number, frequency: 'monthly' | 'annual') => void;
  onCancel: () => void;
  onDelete: () => void;
  isSubmitting: boolean;
  hideCancel?: boolean;
}) {
  const [name, setName] = useState(cost?.name ?? '');
  const [amount, setAmount] = useState(cost?.amount.toString() ?? '');
  const [frequency, setFrequency] = useState<'monthly' | 'annual'>(cost?.frequency ?? 'monthly');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && amount.trim()) {
      const parsedAmount = parseCurrencyInput(amount);
      onSave(name.trim(), parsedAmount, frequency);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty value or numbers with up to 2 decimal places, no scientific notation
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      setAmount(value);
    }
  };

  return (
    <form className={cn("grid items-start gap-4", className)} onSubmit={handleSubmit}>
      <div className="grid gap-2">
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
        <div className="grid gap-2">
          <Label htmlFor="cost-amount">Amount</Label>
          <div className="relative">
            <Input
              id="cost-amount"
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={handleAmountChange}
              disabled={isSubmitting}
              placeholder="0.00"
              className="pl-6"
            />
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              {currency === 'GBP' ? '£' : currency === 'USD' ? '$' : '€'}
            </span>
          </div>
        </div>
        <div className="grid gap-2">
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
      <div className="flex flex-col gap-2">
        <Button type="submit" disabled={isSubmitting || !name.trim() || !amount.trim()}>
          {cost ? 'Save changes' : 'Add cost'}
        </Button>
        {!hideCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        {cost && (
          <Accordion type="single" collapsible>
            <AccordionItem value="delete">
              <AccordionTrigger>Delete cost?</AccordionTrigger>
              <AccordionContent>
                <LongPressButton
                  variant="destructive"
                  onLongPress={onDelete}
                  disabled={isSubmitting}
                  className="gap-2 w-full"
                  duration={2000}
                >
                  <Trash2 className="h-4 w-4" />
                  Hold to delete cost
                </LongPressButton>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </div>
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
}

export function CategoryCard({
  category,
  costs,
  projectId,
  currency,
  onCostAdded,
  onCostUpdated,
  onCostDeleted
}: CategoryCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingCostId, setEditingCostId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInfoHovered, setIsInfoHovered] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const handleAddClick = () => {
    setIsAdding(true);
  };

  const handleEditClick = (cost: FixedCost) => {
    setEditingCostId(cost.id);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingCostId(null);
    setIsSubmitting(false);
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
    <Card className={cn(
      "h-full relative transition-all duration-300 gap-0",
      isInfoHovered && "backdrop-blur-sm bg-background/80"
    )}>
      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
        <CardTitle className="capitalize">{category.name}</CardTitle>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8"
          onMouseEnter={() => setIsInfoHovered(true)}
          onMouseLeave={() => setIsInfoHovered(false)}
        >
          <InfoIcon className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className={cn(
        "transition-opacity duration-300",
        isInfoHovered && "opacity-30"
      )}>
        <div className="space-y-2">
          {costs.length === 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground italic">For example:{' '}
                {category.examples.join(', ')}
              </p>
            </div>
          )}
          {costs.length > 0 && (
            <ul className="space-y-2">
              {costs.map(cost => (
                <button
                  type="button"
                  key={cost.id} 
                  className="w-full flex justify-between items-center p-2 border rounded cursor-pointer hover:bg-accent/50 transition-colors text-left"
                  onClick={() => handleEditClick(cost)}
                >
                  <div>
                    <p className="font-small text-sm">{cost.name}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="text-right">
                      <p className="font-small text-sm">{formatCurrency(cost.amount, currency)}</p>
                      <p className="text-xs text-muted-foreground">{cost.frequency}</p>
                    </div>
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
                  </div>
                </button>
              ))}
            </ul>
          )}
          
          <Button size="sm" variant="outline" className="w-full" onClick={handleAddClick}>
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Cost
          </Button>
        </div>
      </CardContent>
      {isInfoHovered && (
        <div className="absolute inset-1 flex items-center justify-center pointer-events-none rounded-xl">
          <div className="w-full h-full bg-background/80 backdrop-blur-sm flex flex-col items-start justify-center px-4">
            <p className="mb-2 text-sm">{category.description}</p>
            <p className="text-xs text-muted-foreground font-medium mb-1">Examples:</p>
            <ul className="text-xs text-muted-foreground list-disc list-inside">
              {category.examples.map((example) => (
                <li key={example}>{example}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {renderForm()}
    </Card>
  );
} 