import { useState, useEffect } from 'react';
import { projectStorage } from '@/lib/storage/projectStorage';
import type { Project } from '@/lib/storage/types';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    // Initial load
    const loadProjects = () => {
      const loadedProjects = projectStorage.getAllProjects();
      setProjects(loadedProjects);
    };

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
  }, []);

  return projects;
} 