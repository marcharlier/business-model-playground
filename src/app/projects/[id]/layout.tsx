'use client';

import { usePathname, useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectProvider, useProject } from '@/lib/context/ProjectContext';
import { PencilIcon, Trash2, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { projectStorage } from '@/lib/storage/projectStorage';
import { useState } from 'react';
import type { Currency, Project } from '@/lib/storage/types';
import { Badge } from '@/components/ui/badge';
import { useMediaQuery } from '@/hooks/use-media-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { cn } from '@/lib/utils';

function ProjectEditForm({ 
  className,
  project,
  onSave,
  onDelete,
  isSubmitting 
}: {
  className?: string;
  project: Project;
  onSave: (name: string, currency: Currency) => void;
  onDelete: () => void;
  isSubmitting: boolean;
}) {
  const [name, setName] = useState(project.name);
  const [currency, setCurrency] = useState<Currency>(project.currency);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim(), currency);
    }
  };

  const handleCurrencyChange = (value: string) => {
    setCurrency(value as Currency);
  };

  return (
    <form className={cn("grid items-start gap-4", className)} onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <Label htmlFor="project-name">Project Name</Label>
        <Input
          id="project-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isSubmitting}
          autoFocus
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="currency">Currency</Label>
        <Select value={currency} onValueChange={handleCurrencyChange} disabled={isSubmitting}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="GBP">GBP (£)</SelectItem>
            <SelectItem value="USD">USD ($)</SelectItem>
            <SelectItem value="EUR">EUR (€)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Button type="submit" disabled={isSubmitting || !name.trim()}>
          Save Changes
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={onDelete}
          disabled={isSubmitting}
          className="gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Delete Project
        </Button>
      </div>
    </form>
  );
}

function ProjectEditDialog({ 
  project, 
  refreshProject,
  trigger 
}: { 
  project: Project;
  refreshProject: () => void;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const handleSave = async (name: string, currency: Currency) => {
    setIsSubmitting(true);
    try {
      projectStorage.updateProject({
        ...project,
        name,
        currency
      });
      refreshProject();
      setOpen(false);
    } catch (error) {
      console.error('Error updating project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    try {
      projectStorage.deleteProject(project.id);
      router.push('/projects');
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Make changes to your project here. Click save when you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          <ProjectEditForm
            project={project}
            onSave={handleSave}
            onDelete={handleDelete}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        {trigger}
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Edit Project</DrawerTitle>
          <DrawerDescription>
            Make changes to your project here. Click save when you&apos;re done.
          </DrawerDescription>
        </DrawerHeader>
        <ProjectEditForm
          className="px-4"
          project={project}
          onSave={handleSave}
          onDelete={handleDelete}
          isSubmitting={isSubmitting}
        />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

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
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold">{project.name}</h1>
            <Badge variant="outline" className="font-mono">
              {project.currency}
            </Badge>
            <ProjectEditDialog
              project={project}
              refreshProject={refreshProject}
              trigger={
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <PencilIcon className="h-4 w-4" />
                </Button>
              }
            />
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