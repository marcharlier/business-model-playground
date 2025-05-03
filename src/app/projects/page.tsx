'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Coffee, Trash2, Plus } from 'lucide-react';
import { projectStorage } from '@/lib/storage/projectStorage';
import type { Project } from '@/lib/storage/types';
import { coffeeShopExample } from '@/lib/examples/coffee-shop';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function ProjectsList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredProjectId, setHoveredProjectId] = useState<string | null>(null);
  const [showDeleteButton, setShowDeleteButton] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadProjects = () => {
      try {
        const loadedProjects = projectStorage.getAllProjects();
        setProjects(loadedProjects);
      } catch (error) {
        console.error('Error loading projects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, []);

  // Handle hover state with delay
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (hoveredProjectId) {
      timeoutId = setTimeout(() => {
        setShowDeleteButton(true);
      }, 500);
    } else {
      setShowDeleteButton(false);
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [hoveredProjectId]);

  const handleDeleteProject = (projectId: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Prevent event bubbling
    
    try {
      projectStorage.deleteProject(projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleCreateNewProject = () => {
    try {
      const newProject = projectStorage.createProject('My new project', 'GBP');
      router.push(`/projects/${newProject.id}/fixed-costs`);
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
          projectId: newProject.id
        }))
      })),
      productSales: Object.fromEntries(
        Object.entries(coffeeShopExample.productSales || {}).map(([productId, volume]) => [
          productId,
          volume
        ])
      )
    };
    
    // Save the updated project
    projectStorage.updateProject(updatedProject);
    
    // Update local state
    setProjects(prev => [...prev, updatedProject]);
    
    // Redirect to the project's dashboard
    router.push(`/projects/${updatedProject.id}/dashboard`);
  };

  if (isLoading) {
    return (
      <main className="container mx-auto py-6 sm:py-10">
        <p>Loading projects...</p>
      </main>
    );
  }

  return (
    <main className="container mx-auto py-6 sm:py-10">
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
            <Link 
              key={project.id} 
              href={`/projects/${project.id}/dashboard`}
              className="block p-4 sm:p-6 border rounded-lg hover:border-primary transition-colors relative"
              onMouseEnter={() => setHoveredProjectId(project.id)}
              onMouseLeave={() => setHoveredProjectId(null)}
            >
              <h2 className="text-lg sm:text-xl font-semibold mb-2">{project.name}</h2>
              <p className="text-sm text-muted-foreground mb-3 sm:mb-4">
                Created on {new Date(project.createdAt).toLocaleDateString()}
              </p>
              <div className="flex justify-between items-center text-sm">
                <Badge variant="outline" className="text-xs font-mono">
                  {project.currency}
                </Badge>
                <span className="text-muted-foreground">
                  {project.fixedCosts.length} fixed costs, {project.products.length} products
                </span>
              </div>
              {hoveredProjectId === project.id && showDeleteButton && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleDeleteProject(project.id, e)}
                        className="absolute top-2 right-2 h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Delete project</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </Link>
          ))}
        </div>
      )}
    </main>
  );
} 