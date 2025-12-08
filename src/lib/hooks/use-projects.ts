import { useState, useEffect, useCallback } from 'react';
import { projectStorage } from '@/lib/storage/projectStorage';
import { cloudProjectStorage } from '@/lib/storage/cloudProjectStorage';
import type { Project } from '@/lib/storage/types';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);

  const loadProjects = useCallback(() => {
    const loadedProjects = projectStorage.getAllProjects();
    setProjects(loadedProjects);
  }, []);

  useEffect(() => {
    // Initial load
    loadProjects();

    // Set up storage event listener
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'business-model-playground-projects') {
        loadProjects();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Custom event for same-window updates
    const handleProjectChange = () => {
      loadProjects();
    };

    window.addEventListener('projectChange', handleProjectChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('projectChange', handleProjectChange);
    };
  }, [loadProjects]);

  /**
   * Delete a project from both local and cloud storage.
   * Updates local state immediately for responsive UI.
   */
  const deleteProject = useCallback(async (projectId: string) => {
    // Update local state immediately for responsive UI
    setProjects((prev) => prev.filter((p) => p.id !== projectId));

    try {
      // Delete from local storage
      projectStorage.deleteProject(projectId);

      // Delete from cloud storage (fire and forget, but log errors)
      cloudProjectStorage.deleteProject(projectId).catch((error) => {
        console.error('Error deleting project from cloud:', error);
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      // Reload projects in case of error to restore state
      loadProjects();
      throw error;
    }
  }, [loadProjects]);

  return { projects, deleteProject };
} 