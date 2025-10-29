'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import type { Currency, UpfrontCost } from '@/lib/storage/types';
import { formatCurrency } from '@/lib/utils/currency';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProject } from '@/lib/context/ProjectContext';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useMediaQuery } from '@/hooks/use-media-query';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Separator } from '@/components/ui/separator';
import { PencilIcon, Plus, Trash2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { LongPressButton } from '@/components/ui/long-press-button';
import { upfrontCostStorage } from '@/lib/storage/upfrontCostStorage';

// Upfront costs are managed via storage helper

function UpfrontCostForm({
  currency,
  cost,
  onSave,
  onCancel,
  isSubmitting,
  onDelete,
  prefillName,
  prefillAmount,
}: {
  currency: Currency;
  cost?: UpfrontCost;
  onSave: (name: string, amount: number) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  onDelete?: () => void;
  prefillName?: string;
  prefillAmount?: string;
}) {
  const [name, setName] = useState(cost?.name ?? prefillName ?? '');
  const [amount, setAmount] = useState(
    cost?.amount ? String(cost.amount) : prefillAmount ?? ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const parsed = amount.trim() ? Number.parseFloat(amount) : 0;
    onSave(name.trim(), Number.isFinite(parsed) && parsed >= 0 ? parsed : 0);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="upfront-name">Name</Label>
        <Input id="upfront-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Espresso machine" disabled={isSubmitting} />
      </div>
      <CurrencyInput id="upfront-amount" label="Amount" currency={currency} value={amount} onChange={(e) => setAmount(e.target.value)} disabled={isSubmitting} />
      <Separator className="my-2" />
      <div className="flex gap-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
        <Button type="submit" className="flex-1" disabled={isSubmitting || !name.trim()}>Save</Button>
      </div>

      {cost && (
        <Accordion type="single" collapsible>
          <AccordionItem value="delete">
            <AccordionTrigger className="py-2 text-destructive">Delete this upfront cost?</AccordionTrigger>
            <AccordionContent>
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
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </form>
  );
}

export default function UpfrontCostsPage() {
  const params = useParams();
  const projectId = params.id as string;
  const searchParams = useSearchParams();
  const { project, isLoading, refreshProject } = useProject();
  const [costs, setCosts] = useState<UpfrontCost[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCost, setEditingCost] = useState<UpfrontCost | undefined>();
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [prefillName, setPrefillName] = useState<string | undefined>();
  const [prefillAmount, setPrefillAmount] = useState<string | undefined>();

  useEffect(() => {
    if (!projectId) return;
    setCosts(upfrontCostStorage.getUpfrontCostsByProjectId(projectId));
    const shouldOpen = searchParams.get('open') === 'true';
    const pName = searchParams.get('prefillName') || undefined;
    const pAmount = searchParams.get('prefillAmount') || undefined;
    if (shouldOpen) {
      setEditingCost(undefined);
      setPrefillName(pName);
      setPrefillAmount(pAmount);
      setOpen(true);
    }
  }, [projectId, searchParams]);

  if (isLoading || !project) {
    return <div>Loading...</div>;
  }

  const currency = project.currency as Currency;

  const handleOpenAdd = () => {
    setEditingCost(undefined);
    setOpen(true);
  };

  const handleSave = (name: string, amount: number) => {
    setIsSubmitting(true);
    try {
      if (editingCost) {
        const updatedCost: UpfrontCost = { ...editingCost, name, amount };
        upfrontCostStorage.updateUpfrontCost(projectId, updatedCost);
      } else {
        upfrontCostStorage.createUpfrontCost(projectId, name, amount);
      }
      setCosts(upfrontCostStorage.getUpfrontCostsByProjectId(projectId));
      refreshProject();
      setOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    upfrontCostStorage.deleteUpfrontCost(projectId, id);
    setCosts(upfrontCostStorage.getUpfrontCostsByProjectId(projectId));
    refreshProject();
  };

  const total = costs.reduce((sum, c) => sum + c.amount, 0);

  const FormWrapper = ({ children }: { children: React.ReactNode }) => {
    if (isDesktop) {
      return (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingCost ? 'Edit upfront cost' : 'Add upfront cost'}</DialogTitle>
              <DialogDescription>One-off purchases or setup costs.</DialogDescription>
            </DialogHeader>
            {children}
          </DialogContent>
        </Dialog>
      );
    }
    return (
      <Drawer open={open} onOpenChange={setOpen} repositionInputs={false}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{editingCost ? 'Edit upfront cost' : 'Add upfront cost'}</DrawerTitle>
            <DrawerDescription>One-off purchases or setup costs.</DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4">{children}</div>
        </DrawerContent>
      </Drawer>
    );
  };

  return (
    <div>
      <OnboardingProgress
        hasCosts={(project.fixedCosts?.length || 0) > 0}
        hasProducts={project.products.length > 0}
        projectId={project.id}
        currentPage="upfront-costs"
      />
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Upfront costs</h1>
          <Button size="sm" variant="outline" onClick={handleOpenAdd}>
            <Plus className="h-4 w-4 mr-1" />
            Add Upfront Cost
          </Button>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total upfront costs</p>
          <p className="text-2xl font-bold">{formatCurrency(total, currency)}</p>
        </div>
      </div>
      <div><p>Your initial setup costs for your business, like buying a machine or property.</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {costs.map(c => (
          <Card key={c.id} className="h-full">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>{c.name}</CardTitle>
                <div className="flex items-center space-x-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8" 
                          onClick={() => { setEditingCost(c); setOpen(true); }}
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
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium">{formatCurrency(c.amount, currency)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <FormWrapper>
        <UpfrontCostForm 
          currency={currency} 
          cost={editingCost} 
          isSubmitting={isSubmitting} 
          onSave={handleSave} 
          onCancel={() => setOpen(false)}
          onDelete={() => {
            if (!editingCost) return;
            handleDelete(editingCost.id);
            setOpen(false);
          }}
          prefillName={prefillName}
          prefillAmount={prefillAmount}
        />
      </FormWrapper>
    </div>
  );
}


