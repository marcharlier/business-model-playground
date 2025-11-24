'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { fixedCostStorage } from '@/lib/storage/fixedCostStorage';
import { FIXED_COST_CATEGORIES } from '@/lib/constants/fixedCostCategories';
import { CategoryCard } from '@/components/fixed-costs/CategoryCard';
import { CostSuggestionsSheet } from '@/components/fixed-costs/CostSuggestionsSheet';
import { AISuggestionsSheet } from '@/components/fixed-costs/AISuggestionsSheet';
import type { FixedCost } from '@/lib/storage/types';
import type { FixedCostCategory } from '@/lib/constants/fixedCostCategories';
import type { CostSuggestion } from '@/lib/constants/cost-suggestions';
import { formatCurrency } from '@/lib/utils/currency';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { useProject } from '@/lib/context/ProjectContext';

export default function FixedCostsPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { project, isLoading, refreshProject } = useProject();
  const [fixedCosts, setFixedCosts] = useState<FixedCost[]>([]);
  const [totalMonthlyCost, setTotalMonthlyCost] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [preFilledName, setPreFilledName] = useState<string | null>(null);
  const [preFilledAmount, setPreFilledAmount] = useState<number | null>(null);
  const [preFilledFrequency, setPreFilledFrequency] = useState<'monthly' | 'annual' | null>(null);

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

  const handleCostAdded = () => {
    const costs = fixedCostStorage.getFixedCostsByProjectId(projectId);
    setFixedCosts(costs);
    calculateTotalMonthlyCost(costs);
    refreshProject();
    setPreFilledName(null);
    setPreFilledAmount(null);
    setPreFilledFrequency(null);
  };

  const handleCostUpdated = () => {
    const costs = fixedCostStorage.getFixedCostsByProjectId(projectId);
    setFixedCosts(costs);
    calculateTotalMonthlyCost(costs);
    refreshProject();
  };

  const handleCostDeleted = () => {
    const costs = fixedCostStorage.getFixedCostsByProjectId(projectId);
    setFixedCosts(costs);
    calculateTotalMonthlyCost(costs);
    refreshProject();
  };

  const handleSuggestionSelected = (suggestion: CostSuggestion) => {
    setSelectedCategory(suggestion.categoryId);
    setPreFilledName(suggestion.name);
    setPreFilledAmount(null);
    setPreFilledFrequency(null);
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
          onAddFixedCost={({ name, categoryId, amount, frequency }) => {
            setSelectedCategory(categoryId);
            setPreFilledName(name);
            setPreFilledAmount(amount ?? null);
            setPreFilledFrequency(frequency ?? 'monthly');
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
              projectId={projectId}
              currency={project.currency}
              onCostAdded={handleCostAdded}
              onCostUpdated={handleCostUpdated}
              onCostDeleted={handleCostDeleted}
              isSelected={selectedCategory === category.id}
              onSelectionChange={(selected) => {
                setSelectedCategory(selected ? category.id : null);
                if (!selected) {
                  setPreFilledName(null);
                    setPreFilledAmount(null);
                    setPreFilledFrequency(null);
                }
              }}
                preFilledName={selectedCategory === category.id ? preFilledName ?? undefined : undefined}
                preFilledAmount={selectedCategory === category.id ? preFilledAmount ?? undefined : undefined}
                preFilledFrequency={selectedCategory === category.id ? preFilledFrequency ?? undefined : undefined}
            />
          );
        })}
      </div>
    </div>
  );
} 