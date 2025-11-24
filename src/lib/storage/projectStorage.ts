import type { Project, Currency } from './types';
import { Project as ProjectSchema } from '../domain/schema';
import { migrateProject } from '../domain/migrations';
import { generateUUID } from '@/lib/utils';

const STORAGE_KEY = 'business-model-playground-projects';

const isBrowser = typeof window !== 'undefined';

// Helper function to dispatch project change event
const notifyProjectChange = () => {
  if (isBrowser) {
    window.dispatchEvent(new Event('projectChange'));
  }
};

export const projectStorage = {
  getAllProjects: (): Project[] => {
    if (!isBrowser) return [];
    
    const projectsJson = localStorage.getItem(STORAGE_KEY);
    if (!projectsJson) return [];
    
    try {
      const raw = JSON.parse(projectsJson);
      const arr: unknown[] = Array.isArray(raw) ? raw : [];
      const migrated: Project[] = [];
      for (const item of arr) {
        try {
          migrated.push(migrateProject(item));
        } catch {
          // skip invalid item
        }
      }
      return migrated;
    } catch (error) {
      console.error('Error parsing projects from localStorage:', error);
      return [];
    }
  },
  
  getProjectById: (id: string): Project | null => {
    if (!isBrowser) return null;
    const projects = projectStorage.getAllProjects();
    return projects.find(project => project.id === id) || null;
  },
  
  createProject: (nameOrProject: string | Project, currency: Currency = 'GBP'): Project => {
    if (!isBrowser) {
      throw new Error('Cannot create project during server-side rendering');
    }
    
    const projects = projectStorage.getAllProjects();
    
    let newProject: Project;
    
    if (typeof nameOrProject === 'string') {
      // Create a new empty project (version 2 structure)
      newProject = {
        version: 2,
        id: generateUUID(),
        name: nameOrProject,
        currency,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        costStructure: {
          fixedRunningCosts: [],
          upfrontCosts: [],
        },
        revenueStreams: {
          products: [],
        },
        partnerships: [],
        activities: [],
        valueProposition: [],
        customerRelationships: [],
        customerSegments: [],
        resources: [],
        channels: [],
      } as Project;
    } else {
      // Import an existing project
      const migrated = migrateProject(nameOrProject);
      newProject = {
        ...migrated,
        id: generateUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Project;
    }
    
    // validate before persisting
    const validated = ProjectSchema.parse(newProject);
    const updatedProjects = [...projects, validated];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProjects));
    notifyProjectChange();
    
    return validated;
  },
  
  updateProject: (project: Project): Project => {
    if (!isBrowser) {
      throw new Error('Cannot update project during server-side rendering');
    }
    
    const projects = projectStorage.getAllProjects();
    const now = new Date().toISOString();
    const normalized = migrateProject({ ...project, updatedAt: now });
    const validated = ProjectSchema.parse(normalized);
    const updatedProjects = projects.map(p => p.id === project.id ? validated : p);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProjects));
    notifyProjectChange();
    return validated;
  },
  
  deleteProject: (id: string): void => {
    if (!isBrowser) {
      throw new Error('Cannot delete project during server-side rendering');
    }
    
    const projects = projectStorage.getAllProjects();
    const filteredProjects = projects.filter(project => project.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredProjects));
    notifyProjectChange();
  }
}; 