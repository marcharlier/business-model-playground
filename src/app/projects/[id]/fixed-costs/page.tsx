'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fixedCostStorage } from '@/lib/storage/fixedCostStorage';
import { FIXED_COST_CATEGORIES } from '@/lib/constants/fixedCostCategories';
import { CategoryCard } from '@/components/fixed-costs/CategoryCard';
import { CostSuggestionsSheet } from '@/components/fixed-costs/CostSuggestionsSheet';
import { AISuggestionsSheet } from '@/components/fixed-costs/AISuggestionsSheet';
import { CostDialog } from '@/components/costs/CostDialog';
import type { FixedCost } from '@/lib/storage/types';
import type { FixedCostCategory } from '@/lib/constants/fixedCostCategories';
import type { CostSuggestion } from '@/lib/constants/cost-suggestions';
import type { CostFormData } from '@/components/costs/CostForm';
import { formatCurrency } from '@/lib/utils/currency';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { useProject } from '@/lib/context/ProjectContext';

export default function FixedCostsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const { project, isLoading, refreshProject } = useProject();
  const [fixedCosts, setFixedCosts] = useState<FixedCost[]>([]);
  const [totalMonthlyCost, setTotalMonthlyCost] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [preFilledName, setPreFilledName] = useState<string | null>(null);
  const [preFilledAmount, setPreFilledAmount] = useState<number | null>(null);
  const [preFilledFrequency, setPreFilledFrequency] = useState<'monthly' | 'annual' | null>(null);
  const [open, setOpen] = useState(false);
  const [editingCost, setEditingCost] = useState<FixedCost | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadFixedCosts = async () => {
      try {
        const costs = fixedCostStorage.getFixedCostsByProjectId(projectId);
        setFixedCosts(costs);
        calculateTotalMonthlyCost(costs);
      } catch (error) {
        console.error('Error loading fixed costs:', error);
      }
    };

    loadFixedCosts();
  }, [projectId]);

  const calculateTotalMonthlyCost = (costs: FixedCost[]) => {
    const total = costs.reduce((sum, cost) => {
      const monthlyAmount = cost.frequency === 'annual' ? cost.amount / 12 : cost.amount;
      return sum + monthlyAmount;
    }, 0);
    setTotalMonthlyCost(total);
  };

  const handleAddClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setEditingCost(undefined);
    setOpen(true);
  };

  const handleEditClick = (cost: FixedCost) => {
    setEditingCost(cost);
    setSelectedCategory(cost.category);
    setOpen(true);
  };

  const handleSave = (data: CostFormData) => {
    setIsSubmitting(true);
    try {
      if (editingCost) {
        // Update existing cost
        const updatedCost: FixedCost = {
          ...editingCost,
          name: data.name,
          amount: data.amount,
          frequency: data.frequency!,
          category: data.category!,
        };
        fixedCostStorage.updateFixedCost(projectId, updatedCost);
      } else {
        // Create new cost
        fixedCostStorage.createFixedCost(
          projectId,
          data.name,
          data.amount,
          data.frequency!,
          data.category!
        );
      }
      const costs = fixedCostStorage.getFixedCostsByProjectId(projectId);
      setFixedCosts(costs);
      calculateTotalMonthlyCost(costs);
      refreshProject();
      setOpen(false);
      setPreFilledName(null);
      setPreFilledAmount(null);
      setPreFilledFrequency(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (!editingCost) return;
    fixedCostStorage.deleteFixedCost(projectId, editingCost.id);
    const costs = fixedCostStorage.getFixedCostsByProjectId(projectId);
    setFixedCosts(costs);
    calculateTotalMonthlyCost(costs);
    refreshProject();
    setOpen(false);
  };

  const handleSuggestionSelected = (suggestion: CostSuggestion) => {
    setSelectedCategory(suggestion.categoryId);
    setPreFilledName(suggestion.name);
    setPreFilledAmount(null);
    setPreFilledFrequency(null);
    setEditingCost(undefined);
    setOpen(true);
  };

  if (isLoading || !project) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <OnboardingProgress 
        hasCosts={fixedCosts.length > 0}
        hasProducts={project.revenueStreams.products.length > 0}
        projectId={project.id}
        currentPage="fixed-costs"
      />
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Operating costs</h1>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total monthly operating costs</p>
          <p className="text-2xl font-bold">{formatCurrency(totalMonthlyCost, project.currency)}</p>
        </div>
      </div>
      <div className="mb-6 flex flex items-center gap-2">
        <p>Your ongoing costs for your business, like rent, insurance, and salaries.</p>
        <CostSuggestionsSheet 
          onSelectSuggestion={handleSuggestionSelected} 
          existingCosts={fixedCosts}
        />
        <AISuggestionsSheet
          onAddCost={({ name, costType, categoryId, amount, frequency }) => {
            if (costType === 'upfront') {
              // Navigate to upfront-costs page for upfront costs
              const encodedName = encodeURIComponent(name);
              const encodedAmount = amount ? encodeURIComponent(String(amount)) : '';
              const queryParams = `?open=true&prefillName=${encodedName}${encodedAmount ? `&prefillAmount=${encodedAmount}` : ''}`;
              router.push(`/projects/${projectId}/upfront-costs${queryParams}`);
            } else {
              // Handle operating costs on this page
              setSelectedCategory(categoryId ?? 'other');
              setPreFilledName(name);
              setPreFilledAmount(amount ?? null);
              setPreFilledFrequency(frequency ?? 'monthly');
              setEditingCost(undefined);
              setOpen(true);
            }
          }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FIXED_COST_CATEGORIES.map((category: FixedCostCategory) => {
          const categoryCosts = fixedCosts.filter(cost => cost.category === category.id);
          return (
            <CategoryCard
              key={category.id}
              category={category}
              costs={categoryCosts}
              currency={project.currency}
              onAddClick={handleAddClick}
              onEditClick={handleEditClick}
            />
          );
        })}
      </div>

      <CostDialog
        open={open}
        onOpenChange={setOpen}
        cost={editingCost}
        costType="operating"
        currency={project.currency}
        onSave={handleSave}
        isSubmitting={isSubmitting}
        onDelete={editingCost ? handleDelete : undefined}
        toggleEnabled={false}
        categoryPreselected={selectedCategory ?? undefined}
        prefillName={preFilledName ?? undefined}
        prefillAmount={preFilledAmount !== null ? String(preFilledAmount) : undefined}
        prefillFrequency={preFilledFrequency ?? undefined}
      />
    </div>
  );
} 