'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Calculator, LineChart, BarChart3, TrendingUp, ArrowRight, Plus, Coffee } from 'lucide-react';
import { projectStorage } from '@/lib/storage/projectStorage';
import { coffeeShopExample } from '@/lib/examples/coffee-shop';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const [hasProjects, setHasProjects] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const projects = projectStorage.getAllProjects();
    setHasProjects(projects.length > 0);
    // Small delay to ensure the initial state is set before showing the buttons
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const handleCreateNewProject = () => {
    try {
      const newProject = projectStorage.createProject('My new project', 'GBP');
      router.push(`/projects/${newProject.id}/fixed-costs`);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleAddExampleProject = () => {
    const newProject = projectStorage.createProject(
      coffeeShopExample.name,
      coffeeShopExample.currency
    );
    
    // Update the project with example data
    const updatedProject = {
      ...newProject,
      fixedCosts: coffeeShopExample.fixedCosts.map(cost => ({
        ...cost,
        projectId: newProject.id
      })),
      products: coffeeShopExample.products.map(product => ({
        ...product,
        projectId: newProject.id,
        associatedCosts: product.associatedCosts.map(cost => ({
          ...cost,
          productId: product.id,
          projectId: newProject.id
        }))
      })),
      productSales: coffeeShopExample.productSales
    };
    
    projectStorage.updateProject(updatedProject);
    router.push(`/projects/${newProject.id}/dashboard`);
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="container mx-auto px-4 md:px-8 py-8 sm:py-16 flex-1">
        <div className="max-w-4xl mx-auto text-center mb-8 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6">Business Model Playground</h1>
          <p className="text-lg sm:text-xl mb-6 sm:mb-8 text-muted-foreground">
            Build and analyze your business models with ease. Create financial projections, test scenarios, and visualize your path to profitability.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            {isLoading ? (
              <>
                <Skeleton className="h-12 sm:h-10 w-full sm:w-40" />
                <Skeleton className="h-12 sm:h-10 w-full sm:w-40" />
              </>
            ) : (
              <>
                {hasProjects ? (
                  <Button asChild size="lg" className="gap-2 w-full sm:w-auto">
                    <Link href="/projects">
                      View Your Projects
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button 
                    size="lg" 
                    className="gap-2 w-full sm:w-auto"
                    onClick={handleCreateNewProject}
                  >
                    Create Your First Project
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
                {!hasProjects && (
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="gap-2 w-full sm:w-auto"
                    onClick={handleAddExampleProject}
                  >
                    <Coffee className="h-4 w-4" />
                    Play with an example
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-card p-4 sm:p-6 rounded-lg shadow-sm border">
            <div className="flex items-center mb-3 sm:mb-4">
              <div className="bg-primary/10 p-2 rounded-full mr-3">
                <Calculator className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <h3 className="text-base sm:text-lg font-medium">Financial Modeling</h3>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground">
              Add your products, services, and costs to create a complete financial model of your business idea.
            </p>
          </div>
          
          <div className="bg-card p-4 sm:p-6 rounded-lg shadow-sm border">
            <div className="flex items-center mb-3 sm:mb-4">
              <div className="bg-primary/10 p-2 rounded-full mr-3">
                <LineChart className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <h3 className="text-base sm:text-lg font-medium">Scenario Testing</h3>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground">
              Experiment with different sales volumes and pricing strategies to see how they affect your profitability.
            </p>
          </div>
          
          <div className="bg-card p-4 sm:p-6 rounded-lg shadow-sm border">
            <div className="flex items-center mb-3 sm:mb-4">
              <div className="bg-primary/10 p-2 rounded-full mr-3">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <h3 className="text-base sm:text-lg font-medium">Visual Analytics</h3>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground">
              View revenue breakdowns, cost structures, and profit margins through intuitive charts and visualizations.
            </p>
          </div>
          
          <div className="bg-card p-4 sm:p-6 rounded-lg shadow-sm border">
            <div className="flex items-center mb-3 sm:mb-4">
              <div className="bg-primary/10 p-2 rounded-full mr-3">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <h3 className="text-base sm:text-lg font-medium">Break-Even Analysis</h3>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground">
              Determine how many units you need to sell to cover your costs and start making a profit.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 