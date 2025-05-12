'use client';

import { usePathname, useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectProvider, useProject } from '@/lib/context/ProjectContext';
import { PencilIcon, Trash2, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { projectStorage } from '@/lib/storage/projectStorage';
import { useState } from 'react';
import type { Currency } from '@/lib/storage/types';
import { Badge } from '@/components/ui/badge';

function ProjectLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const projectId = params?.id as string;
  const { project, isLoading, refreshProject } = useProject();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine the active tab based on the current path
  const getActiveTab = () => {
    if (pathname.includes('/fixed-costs')) return 'fixed-costs';
    if (pathname.includes('/products')) return 'products';
    return 'dashboard';
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    if (!projectId) return;
    
    switch (value) {
      case 'dashboard':
        router.push(`/projects/${projectId}/dashboard`);
        break;
      case 'fixed-costs':
        router.push(`/projects/${projectId}/fixed-costs`);
        break;
      case 'products':
        router.push(`/projects/${projectId}/products`);
        break;
    }
  };

  // Handle name edit
  const handleNameEdit = () => {
    if (project) {
      setEditedName(project.name);
      setIsEditingName(true);
    }
  };

  // Handle name save
  const handleNameSave = async () => {
    if (!project || !editedName.trim()) return;
    
    setIsSubmitting(true);
    try {
      projectStorage.updateProject({
        ...project,
        name: editedName.trim()
      });
      refreshProject();
      setIsEditingName(false);
    } catch (error) {
      console.error('Error updating project name:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle currency change
  const handleCurrencyChange = async (value: Currency) => {
    if (!project) return;
    
    setIsSubmitting(true);
    try {
      projectStorage.updateProject({
        ...project,
        currency: value
      });
      refreshProject();
    } catch (error) {
      console.error('Error updating project currency:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle project deletion
  const handleDeleteProject = () => {
    if (!project) return;
    
    try {
      projectStorage.deleteProject(project.id);
      router.push('/projects');
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  if (isLoading) {
    return (
      <main className="container mx-auto py-10">
        <p>Loading project...</p>
      </main>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <main className="container mx-auto py-6 sm:py-10 px-4 md:px-8">
      <div className="flex flex-col gap-4 mb-6">
        {/* Back Button - Mobile */}
        <div className="sm:hidden">
          <Button variant="ghost" size="sm" asChild className="gap-2 -ml-2">
            <Link href="/projects">
              <List className="h-4 w-4" />
              All Projects
            </Link>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {isEditingName ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleNameSave();
                    } else if (e.key === 'Escape') {
                      setIsEditingName(false);
                    }
                  }}
                  className="w-full sm:w-64"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNameSave}
                    disabled={isSubmitting}
                  >
                    Save
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingName(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={project.currency}
                    onValueChange={handleCurrencyChange}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDeleteProject}
                    disabled={isSubmitting}
                    className="text-destructive hover:text-destructive gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Project
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold">{project.name}</h1>
                <Badge variant="outline" className="font-mono">
                  {project.currency}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNameEdit}
                  className="h-8 w-8 p-0"
                >
                  <PencilIcon className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          {/* Back Button - Desktop */}
          <div className="hidden sm:block">
            <Button variant="ghost" size="sm" asChild className="gap-2">
              <Link href="/projects">
                <List className="h-4 w-4" />
                All Projects
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-6 overflow-x-auto hidden">
        <Tabs value={getActiveTab()} onValueChange={handleTabChange}>
          <TabsList className="w-full sm:w-fit">
            <TabsTrigger value="fixed-costs" className="flex-1 sm:flex-none">Fixed Costs</TabsTrigger>
            <TabsTrigger value="products" className="flex-1 sm:flex-none">Products</TabsTrigger>
            <TabsTrigger value="dashboard" className="flex-1 sm:flex-none">Results Dashboard</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {children}
    </main>
  );
}

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProjectProvider>
      <ProjectLayoutContent>{children}</ProjectLayoutContent>
    </ProjectProvider>
  );
} 