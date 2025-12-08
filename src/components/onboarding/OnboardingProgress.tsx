'use client';

import { Building2, Package, LineChart, Banknote } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useProject } from '@/lib/context/ProjectContext';
import { formatCurrency } from '@/lib/utils/currency';

interface OnboardingProgressProps {
	hasCosts?: boolean;
	hasOperatingCosts?: boolean;
	hasUpfrontCosts?: boolean;
	hasProducts: boolean;
	className?: string;
	projectId?: string;
	currentPage?: 'upfront-costs' | 'fixed-costs' | 'products' | 'dashboard' | 'playground';
}

export function OnboardingProgress({
	hasCosts,
	hasOperatingCosts,
	hasUpfrontCosts,
	hasProducts,
	className,
	projectId,
	currentPage,
}: OnboardingProgressProps) {
	const { project } = useProject();

	if (!project) {
		return null;
	}

	const operatingCostsSet = (hasOperatingCosts ?? hasCosts) ?? (project.costStructure.fixedRunningCosts.length > 0);
	const upfrontList = project.costStructure.upfrontCosts ?? [];
	const upfrontCostsSet = hasUpfrontCosts ?? (upfrontList.length > 0);
	const upfrontTotal = upfrontList.reduce((sum: number, c: { amount: number }) => sum + (c?.amount || 0), 0);
	const monthlyOperatingTotal = project.costStructure.fixedRunningCosts.reduce((acc, cost) => acc + (cost.frequency === 'annual' ? cost.amount / 12 : cost.amount), 0);

	return (
		<div className={cn("w-full space-y-4 mb-8", className)}>
			<div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
				{/* Step 1: Upfront Costs */}
				<Link 
					href={`/projects/${projectId}/upfront-costs`}
					className={cn(
						"flex flex-col items-center text-center my-auto p-2 sm:p-4 rounded-full border transition-colors",
						upfrontCostsSet ? "bg-primary/5 hover:bg-muted" : "bg-muted/50 hover:bg-muted/80",
						currentPage === 'upfront-costs' && "ring-2 ring-foreground"
					)}
				>
          <div className="flex items-center sm:mb-2">
					<div className={cn(
						"w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center",
						upfrontCostsSet ? "bg-black" : "bg-primary/10"
					)}>
						<Banknote className={cn(
							"w-3 h-3 sm:w-5 sm:h-5",
							upfrontCostsSet ? "text-white" : "text-muted-foreground"
						)} />
					</div>
					<h3 className="pl-2 font-medium text-sm sm:text-base">Upfront costs</h3>
          </div>
					<p className="hidden sm:block text-sm text-muted-foreground mt-1">
						{upfrontCostsSet ? `${formatCurrency(upfrontTotal, project.currency)} upfront costs.` : 'Add your upfront costs.'}
					</p>
				</Link>

				{/* Step 2: Operating Costs */}
				<Link 
					href={`/projects/${projectId}/fixed-costs`}
					className={cn(
						"flex flex-col items-center text-center my-auto p-2 sm:p-4 rounded-full border transition-colors",
						operatingCostsSet ? "bg-primary/5 hover:bg-muted" : "bg-muted/50 hover:bg-muted/80",
						currentPage === 'fixed-costs' && "ring-2 ring-foreground"
					)}
				>
          <div className="flex items-center sm:mb-2">
					<div className={cn(
						"w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center",
						operatingCostsSet ? "bg-black" : "bg-primary/10"
					)}>
						<Building2 className={cn(
							"w-3 h-3 sm:w-5 sm:h-5",
							operatingCostsSet ? "text-white" : "text-muted-foreground"
						)} />
					</div>
					<h3 className="pl-2 font-medium text-sm sm:text-base">Operating costs</h3>
          </div>
					<p className="hidden sm:block text-sm text-muted-foreground mt-1">
						{operatingCostsSet ? `${formatCurrency(monthlyOperatingTotal, project.currency)} monthly costs.` : 'Add your monthly operating costs.'}
					</p>
				</Link>

				{/* Step 3: Set up Products */}
				<Link 
					href={`/projects/${projectId}/products`}
					className={cn(
						"flex flex-col items-center text-center my-auto p-2 sm:p-4 rounded-full border transition-colors",
						hasProducts ? "bg-primary/5 hover:bg-muted" : "bg-muted/50 hover:bg-muted/80",
						currentPage === 'products' && "ring-2 ring-foreground"
					)}
				>
          <div className="flex items-center sm:mb-2">
					<div className={cn(
						"w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center",
						hasProducts ? "bg-black" : "bg-primary/10"
					)}>
						<Package className={cn(
							"w-3 h-3 sm:w-5 sm:h-5",
							hasProducts ? "text-white" : "text-muted-foreground"
						)} />
					</div>
					<h3 className="pl-2 font-medium text-sm sm:text-base">Products & COGS</h3>
          </div>
					<p className="hidden sm:block text-sm text-muted-foreground mt-1">
						{hasProducts ? `${project.revenueStreams.products.length} product${project.revenueStreams.products.length > 1 ? 's' : ''} added.` : 'Add your products and services.'}
					</p>
				</Link>

				{/* Step 4: Play with Playground */}
				<Link 
					href={`/projects/${projectId}/playground`}
					className={cn(
						"flex flex-col items-center text-center my-auto p-2 sm:p-4 rounded-full border transition-colors",
						"hover:bg-muted/80",
						(currentPage === 'dashboard' || currentPage === 'playground') && "ring-2 ring-foreground"
					)}
				>
          <div className="flex items-center sm:mb-2">
					<div className={cn(
						"w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center",
						operatingCostsSet && hasProducts ? "bg-black" : "bg-primary/10"
					)}>
						<LineChart className={cn(
							"w-3 h-3 sm:w-5 sm:h-5",
							operatingCostsSet && hasProducts ? "text-white" : "text-muted-foreground"
						)} />
					</div>
					<h3 className="pl-2 font-medium text-sm sm:text-base">Playground</h3>
          </div>
					<p className="hidden sm:block text-sm text-muted-foreground mt-1">
						{operatingCostsSet && hasProducts ? 'Explore your business.' : 'Add costs and products first'}
					</p>
				</Link>
			</div>
		</div>
	);
} 