'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import type { Currency, UpfrontCost } from '@/lib/storage/types';
import { formatCurrency } from '@/lib/utils/currency';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProject } from '@/lib/context/ProjectContext';
import { PencilIcon, Plus } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { upfrontCostStorage } from '@/lib/storage/upfrontCostStorage';
import { CostDialog } from '@/components/costs/CostDialog';
import type { CostFormData } from '@/components/costs/CostForm';

export default function UpfrontCostsPage() {
  const params = useParams();
  const projectId = params.id as string;
  const searchParams = useSearchParams();
  const { project, isLoading, refreshProject } = useProject();
  const [costs, setCosts] = useState<UpfrontCost[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCost, setEditingCost] = useState<UpfrontCost | undefined>();
  const [open, setOpen] = useState(false);
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
    setPrefillName(undefined);
    setPrefillAmount(undefined);
    setOpen(true);
  };

  const handleSave = (data: CostFormData) => {
    setIsSubmitting(true);
    try {
      if (editingCost) {
        const updatedCost: UpfrontCost = { ...editingCost, name: data.name, amount: data.amount };
        upfrontCostStorage.updateUpfrontCost(projectId, updatedCost);
      } else {
        upfrontCostStorage.createUpfrontCost(projectId, data.name, data.amount);
      }
      setCosts(upfrontCostStorage.getUpfrontCostsByProjectId(projectId));
      refreshProject();
      setOpen(false);
      setPrefillName(undefined);
      setPrefillAmount(undefined);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (!editingCost) return;
    upfrontCostStorage.deleteUpfrontCost(projectId, editingCost.id);
    setCosts(upfrontCostStorage.getUpfrontCostsByProjectId(projectId));
    refreshProject();
    setOpen(false);
  };

  const total = costs.reduce((sum, c) => sum + c.amount, 0);

  return (
    <div>
      <OnboardingProgress
        hasCosts={(project.costStructure.fixedRunningCosts?.length || 0) > 0}
        hasProducts={project.revenueStreams.products.length > 0}
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

      <CostDialog
        open={open}
        onOpenChange={setOpen}
        cost={editingCost}
        costType="upfront"
        currency={currency}
        onSave={handleSave}
        isSubmitting={isSubmitting}
        onDelete={editingCost ? handleDelete : undefined}
        toggleEnabled={false}
        prefillName={prefillName}
        prefillAmount={prefillAmount}
      />
    </div>
  );
}


