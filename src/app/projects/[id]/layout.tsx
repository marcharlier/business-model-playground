'use client';

import { usePathname, useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ProjectProvider, useProject } from '@/lib/context/ProjectContext';
import { PencilIcon } from 'lucide-react';
import { projectStorage } from '@/lib/storage/projectStorage';
import { useState } from 'react';
import { useProjects } from '@/lib/hooks/use-projects';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ShareButton } from '@/components/project/ShareButton';
import { CloudSyncStatus } from '@/components/project/CloudSyncStatus';
import { ProjectDialog } from '@/components/project/ProjectDialog';
import type { ProjectFormData } from '@/components/project/ProjectForm';
import { useCloudSync } from '@/hooks/use-cloud-sync';

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
  const { status: cloudSyncStatus, error: cloudSyncError, lastSyncedAt, retry: cloudSyncRetry } = useCloudSync({ projectId });
  const { projects, deleteProject } = useProjects();
  
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle project switch
  const handleProjectSwitch = (newProjectId: string) => {
    if (newProjectId === projectId) return;
    
    // Navigate to the same sub-route for the new project
    const currentSubPath = pathname.split(`/projects/${projectId}`)[1] || '/canvas-view';
    router.push(`/projects/${newProjectId}${currentSubPath}`);
  };

  // Handle project save
  const handleSave = async (data: ProjectFormData) => {
    if (!project) return;
    
    setIsSubmitting(true);
    try {
      projectStorage.updateProject({
        ...project,
        name: data.name,
        currency: data.currency,
        description: data.description,
      });
      refreshProject();
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle project delete
  const handleDelete = async () => {
    if (!project) return;
    
    try {
      await deleteProject(project.id);
      router.push('/');
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#E4E4E4] pt-14">
        <div className="container mx-auto py-10">
          <p>Loading project...</p>
        </div>
      </main>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#E4E4E4] pt-14">
      <div className="container mx-auto py-6 sm:py-10 px-4 md:px-8">
        {/* Project Header Bar */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {/* Project Switcher */}
          <Select value={projectId} onValueChange={handleProjectSwitch}>
            <SelectTrigger className="w-auto rounded-lg min-w-[200px] bg-background border border-border">
              <SelectValue>
                {project.name} ({project.currency})
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name} ({p.currency})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Edit Button */}
          <Button
            variant="outline"
            size="icon"
            className="rounded-lg"
            onClick={() => setEditDialogOpen(true)}
          >
            <PencilIcon className="h-4 w-4" />
          </Button>

          {/* Share Button */}
          <ShareButton project={project} />

          {/* Cloud Sync Status with Label */}
          <CloudSyncStatus
            status={cloudSyncStatus}
            error={cloudSyncError}
            lastSyncedAt={lastSyncedAt}
            onRetry={cloudSyncRetry}
          />
        </div>

        {/* Project Edit Dialog */}
        <ProjectDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          project={project}
          onSave={handleSave}
          isSubmitting={isSubmitting}
          onDelete={handleDelete}
        />

        {children}
      </div>
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
