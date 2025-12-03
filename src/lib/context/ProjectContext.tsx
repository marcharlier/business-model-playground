'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useParams } from 'next/navigation';
import { projectStorage } from '@/lib/storage/projectStorage';
import type { Project } from '@/lib/storage/types';

type ProjectContextType = {
  project: Project | null;
  isLoading: boolean;
  refreshProject: () => void;
};

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const params = useParams();
  const projectId = params?.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProject = useCallback(() => {
    if (!projectId) return;
    
    try {
      const loadedProject = projectStorage.getProjectById(projectId);
      if (!loadedProject) return;
      setProject(loadedProject);
    } catch (error) {
      console.error('Error loading project:', error);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  // Listen for project changes (including cloud sync updates)
  useEffect(() => {
    const handleProjectChange = () => {
      loadProject();
    };

    window.addEventListener('projectChange', handleProjectChange);
    return () => {
      window.removeEventListener('projectChange', handleProjectChange);
    };
  }, [loadProject]);

  // Memoize refreshProject to prevent it from changing on every render
  const refreshProject = useCallback(() => {
    setIsLoading(true);
    loadProject();
  }, [loadProject]);

  return (
    <ProjectContext.Provider value={{ project, isLoading, refreshProject }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
} 