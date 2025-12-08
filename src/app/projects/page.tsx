'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Coffee, Plus } from 'lucide-react';
import { projectStorage } from '@/lib/storage/projectStorage';
import { coffeeShopExample } from '@/lib/examples/coffee-shop';
import { ProjectCard } from '@/components/project/ProjectCard';
import { useProjects } from '@/lib/hooks/use-projects';

export default function ProjectsList() {
  const { projects, deleteProject, isLoading } = useProjects();
  const router = useRouter();

  const handleDeleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Prevent event bubbling
    await deleteProject(projectId);
    router.push('/');
  };

  const handleCreateNewProject = () => {
    try {
      const newProject = projectStorage.createProject('My new project', 'GBP');
      router.push(`/projects/${newProject.id}/canvas-view`);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleAddExampleProject = () => {
    // Create a new project with a unique ID
    const newProject = projectStorage.createProject(
      coffeeShopExample.name,
      coffeeShopExample.currency
    );
    
    // Update the project with the example data
    const productsWithSales = coffeeShopExample.revenueStreams.products.map(product => ({
      ...product,
      projectId: newProject.id,
      associatedCosts: product.associatedCosts.map(cost => ({
        ...cost,
        projectId: newProject.id
      }))
    }));
    
    const updatedProject = {
      ...newProject,
      description: coffeeShopExample.description,
      costStructure: {
        fixedRunningCosts: coffeeShopExample.costStructure.fixedRunningCosts.map(cost => ({
          ...cost,
          projectId: newProject.id
        })),
        upfrontCosts: coffeeShopExample.costStructure.upfrontCosts.map(cost => ({
          ...cost,
          projectId: newProject.id
        }))
      },
      revenueStreams: {
        products: productsWithSales
      },
      partnerships: coffeeShopExample.partnerships,
      activities: coffeeShopExample.activities,
      valueProposition: coffeeShopExample.valueProposition,
      customerRelationships: coffeeShopExample.customerRelationships,
      customerSegments: coffeeShopExample.customerSegments,
      resources: coffeeShopExample.resources,
      channels: coffeeShopExample.channels
    };
    
    // Save the updated project
    projectStorage.updateProject(updatedProject);
    
    // Redirect to the project's canvas view
    router.push(`/projects/${updatedProject.id}/canvas-view`);
  };

  if (isLoading) {
    return (
      <main className="container mx-auto py-6 sm:py-10">
        <p>Loading projects...</p>
      </main>
    );
  }

  return (
    <main className="container mx-auto py-6 sm:py-10 px-4 md:px-8 pt-20">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Your Projects</h1>
        {projects.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleAddExampleProject} className="gap-2">
              <Coffee className="h-4 w-4" />
              <span className="sm:hidden">Play with an example</span>
              <span className="hidden sm:inline">Play with an example</span>
            </Button>
            <Button onClick={handleCreateNewProject} className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="sm:hidden">New project</span>
              <span className="hidden sm:inline">New Project</span>
            </Button>
          </div>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-6 sm:py-10">
          <p className="text-lg mb-4">You don&apos;t have any projects yet.</p>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center">
            <Button variant="outline" onClick={handleAddExampleProject} className="gap-2">
              <Coffee className="h-4 w-4" />
              <span className="sm:hidden">Play with an example</span>
              <span className="hidden sm:inline">Play with an example</span>
            </Button>
            <Button onClick={handleCreateNewProject} className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="sm:hidden">New project</span>
              <span className="hidden sm:inline">New project</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={handleDeleteProject}
            />
          ))}
        </div>
      )}
    </main>
  );
} 