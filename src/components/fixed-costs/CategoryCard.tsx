'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InfoIcon, PlusIcon, PencilIcon, TrashIcon, XIcon, CheckIcon } from 'lucide-react';
import { fixedCostStorage } from '@/lib/storage/fixedCostStorage';
import { parseCurrencyInput } from '@/lib/utils/currency';
import { formatCurrency } from '@/lib/utils/currency';
import type { FixedCost } from '@/lib/storage/types';
import type { FixedCostCategory } from '@/lib/constants/fixedCostCategories';
import type { Currency } from '@/lib/storage/types';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<'monthly' | 'annual'>('monthly');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInfoHovered, setIsInfoHovered] = useState(false);

  const handleAddClick = () => {
    // Cancel any in-progress edits
    if (editingCostId) {
      setEditingCostId(null);
      setName('');
      setAmount('');
      setFrequency('monthly');
    }

    // Start adding new cost
    setIsAdding(true);
    setName('');
    setAmount('');
    setFrequency('monthly');
  };

  const handleEditClick = (cost: FixedCost) => {
    // Cancel any in-progress additions
    if (isAdding) {
      setIsAdding(false);
      setName('');
      setAmount('');
      setFrequency('monthly');
    }

    // Start editing the selected cost
    setEditingCostId(cost.id);
    setName(cost.name);
    setAmount(cost.amount.toString());
    setFrequency(cost.frequency);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingCostId(null);
    setName('');
    setAmount('');
    setFrequency('monthly');
    setIsSubmitting(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !amount.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      const parsedAmount = parseCurrencyInput(amount);
      
      if (editingCostId) {
        // Update existing cost
        const costToUpdate = costs.find(c => c.id === editingCostId);
        if (costToUpdate) {
          fixedCostStorage.updateFixedCost(projectId, {
            ...costToUpdate,
            name,
            amount: parsedAmount,
            frequency
          });
          onCostUpdated();
        }
      } else if (isAdding) {
        // Create new cost
        fixedCostStorage.createFixedCost(
          projectId,
          name,
          parsedAmount,
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
    } catch (error) {
      console.error('Error deleting fixed cost:', error);
    }
  };

  return (
    <Card className={cn(
      "h-full relative transition-all duration-300",
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
          {costs.length > 0 && (
            <ul className="space-y-2">
              {costs.map(cost => (
                <li key={cost.id} className="flex justify-between items-center p-2 border rounded">
                  {editingCostId === cost.id ? (
                    <form onSubmit={handleSubmit} className="space-y-3 w-full">
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter cost name"
                        required
                        className="h-8 text-sm"
                      />
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <Input
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            required
                            className="h-8 pl-6 text-sm"
                          />
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            {currency === 'GBP' ? '£' : currency === 'USD' ? '$' : '€'}
                          </span>
                        </div>
                        <Select 
                          value={frequency} 
                          onValueChange={(value) => setFrequency(value as 'monthly' | 'annual')}
                        >
                          <SelectTrigger id="frequency" className="w-28 text-sm" size="sm">
                            <SelectValue placeholder="Frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly" className="text-sm">Monthly</SelectItem>
                            <SelectItem value="annual" className="text-sm">Annual</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-1 justify-end">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8" 
                                onClick={handleCancel}
                              >
                                <XIcon className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Cancel</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                type="submit" 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8" 
                                disabled={isSubmitting}
                              >
                                <CheckIcon className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Update</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </form>
                  ) : (
                    <>
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
                          onClick={() => handleEditClick(cost)}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive" 
                          onClick={() => handleDelete(cost.id)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
          
          {isAdding ? (
            <div className="p-2 border rounded">
              <form onSubmit={handleSubmit} className="space-y-3 w-full">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter cost name"
                  required
                  className="h-8 text-sm"
                />
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Input
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      required
                      className="h-8 pl-6 text-sm"
                    />
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      {currency === 'GBP' ? '£' : currency === 'USD' ? '$' : '€'}
                    </span>
                  </div>
                  <Select 
                    value={frequency} 
                    onValueChange={(value) => setFrequency(value as 'monthly' | 'annual')}
                  >
                    <SelectTrigger id="frequency" className="w-28 text-sm" size="sm">
                      <SelectValue placeholder="Frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly" className="text-sm">Monthly</SelectItem>
                      <SelectItem value="annual" className="text-sm">Annual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-1 justify-end">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8" 
                          onClick={handleCancel}
                        >
                          <XIcon className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Cancel</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          type="submit" 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8" 
                          disabled={isSubmitting}
                        >
                          <CheckIcon className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Add</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </form>
            </div>
          ) : (
            <Button size="sm" variant="outline" className="w-full" onClick={handleAddClick}>
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Cost
            </Button>
          )}
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
    </Card>
  );
} 