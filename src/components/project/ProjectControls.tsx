'use client';

import { usePathname, useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
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
import { ProjectProvider, useProject } from '@/lib/context/ProjectContext';

function ProjectControlsInner() {
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

  if (isLoading || !project) {
    return null;
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Project Switcher */}
        <Select value={projectId} onValueChange={handleProjectSwitch}>
          <SelectTrigger className="w-auto rounded-lg min-w-[160px] max-w-[300px] bg-background border border-border h-9 text-sm">
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
          className="rounded-lg h-9 w-9"
          onClick={() => setEditDialogOpen(true)}
        >
          <PencilIcon className="h-4 w-4" />
        </Button>

        {/* Share Button */}
        <ShareButton project={project} />

        {/* Cloud Sync Status */}
        <CloudSyncStatus
          status={cloudSyncStatus}
          error={cloudSyncError}
          lastSyncedAt={lastSyncedAt}
          onRetry={cloudSyncRetry}
          showLabel={false}
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
    </>
  );
}

export function ProjectControls() {
  return (
    <ProjectProvider>
      <ProjectControlsInner />
    </ProjectProvider>
  );
}
