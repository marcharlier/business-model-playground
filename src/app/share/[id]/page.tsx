'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { sharedProjectStorage } from '@/lib/storage/sharedProjectStorage';
import { SharedProjectImportDialog } from '@/components/project/SharedProjectImportDialog';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { AlertCircle } from 'lucide-react';
import type { Project } from '@/lib/storage/types';
import { use } from 'react';
import NextLink from 'next/link';
import { Button } from '@/components/ui/button';

interface SharedProject {
  projectData: Project & { author: string };
  authorAvatar: string;
  created_at: string;
}

export default function SharePage({ params }: { params: Promise<{ id: string }> }) {
  const [error, setError] = useState<string | null>(null);
  const [sharedProject, setSharedProject] = useState<SharedProject | null>(null);
  const router = useRouter();
  const { id } = use(params);

  useEffect(() => {
    const fetchSharedProject = async () => {
      try {
        const project = await sharedProjectStorage.getSharedProject(id);
        setSharedProject(project);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('An unexpected error occurred');
        }
      }
    };

    fetchSharedProject();
  }, [id]);

  // If there's an error, show it and redirect to projects page
  if (error) {
    return (
      <div className="container mx-auto py-10 px-4 max-w-md">
        <Alert className="bg-destructive/50 border border-destructive">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button variant="default" className="mt-4 w-full" asChild>
          <NextLink href="/projects">Go to projects</NextLink>
        </Button>
      </div>
    );
  }

  // If we have a shared project, show the import dialog
  if (sharedProject) {
    return (
      <SharedProjectImportDialog
        sharedProject={sharedProject}
        onOpenChange={(open) => {
          if (!open) {
            router.push('/projects');
          }
        }}
      />
    );
  }

  // Loading state
  return null;
} 