import { useCallback, useSyncExternalStore } from 'react';
import { projectStorage } from '@/lib/storage/projectStorage';
import { cloudProjectStorage } from '@/lib/storage/cloudProjectStorage';
import { sharedProjectStorage } from '@/lib/storage/sharedProjectStorage';
import type { Project } from '@/lib/storage/types';

// Simple store for projects with subscription support
let projectsCache: Project[] | null = null;
const listeners: Set<() => void> = new Set();
// Cached empty array for server snapshot to avoid infinite loop
const EMPTY_PROJECTS: Project[] = [];

function notifyListeners() {
  listeners.forEach(listener => listener());
}

function subscribeToProjects(callback: () => void) {
  listeners.add(callback);
  
  // Set up storage event listener
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'business-model-playground-projects') {
      projectsCache = null; // Invalidate cache
      notifyListeners();
    }
  };

  // Custom event for same-window updates
  const handleProjectChange = () => {
    projectsCache = null; // Invalidate cache
    notifyListeners();
  };

  window.addEventListener('storage', handleStorageChange);
  window.addEventListener('projectChange', handleProjectChange);

  return () => {
    listeners.delete(callback);
    window.removeEventListener('storage', handleStorageChange);
    window.removeEventListener('projectChange', handleProjectChange);
  };
}

function getProjectsSnapshot(): Project[] {
  if (projectsCache === null) {
    projectsCache = projectStorage.getAllProjects();
  }
  return projectsCache;
}

function getServerSnapshot(): Project[] {
  // Must return a cached value to avoid infinite loop
  return EMPTY_PROJECTS;
}

export function useProjects() {
  const projects = useSyncExternalStore(
    subscribeToProjects,
    getProjectsSnapshot,
    getServerSnapshot
  );
  
  // Derive loading state from whether we have data yet
  // useSyncExternalStore returns [] on server, so we're loading until we have client data
  const isLoading = projects.length === 0 && typeof window === 'undefined';

  /**
   * Delete a project from both local and cloud storage.
   * Also cleans up any associated shared_projects entry if the project was shared.
   * Updates local state immediately for responsive UI.
   */
  const deleteProject = useCallback(async (projectId: string) => {
    try {
      // Get the project first to check if it has a sharedId
      const project = projectStorage.getProjectById(projectId);
      
      // If the project has a sharedId, delete the shared project entry first
      if (project?.sharedId) {
        try {
          await sharedProjectStorage.deleteSharedProject(project.sharedId);
        } catch (error) {
          // Log but don't fail the deletion if shared project cleanup fails
          // (e.g., if it was already deleted or user doesn't have permission)
          console.warn('Error deleting shared project entry:', error);
        }
      }
      
      // Delete from local storage
      projectStorage.deleteProject(projectId);
      
      // Invalidate cache and notify listeners
      projectsCache = null;
      notifyListeners();

      // Delete from cloud storage (fire and forget, but log errors)
      cloudProjectStorage.deleteProject(projectId).catch((error) => {
        console.error('Error deleting project from cloud:', error);
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }, []);

  return { projects, deleteProject, isLoading };
} 