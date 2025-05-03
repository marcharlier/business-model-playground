import type { Project, Currency } from './types';
import { generateUUID } from '@/lib/utils';

const STORAGE_KEY = 'business-model-playground-projects';

export const projectStorage = {
  getAllProjects: (): Project[] => {
    if (typeof window === 'undefined') return [];
    
    const projectsJson = localStorage.getItem(STORAGE_KEY);
    if (!projectsJson) return [];
    
    try {
      return JSON.parse(projectsJson);
    } catch (error) {
      console.error('Error parsing projects from localStorage:', error);
      return [];
    }
  },
  
  getProjectById: (id: string): Project | null => {
    const projects = projectStorage.getAllProjects();
    return projects.find(project => project.id === id) || null;
  },
  
  createProject: (name: string, currency: Currency = 'GBP'): Project => {
    const projects = projectStorage.getAllProjects();
    
    const newProject: Project = {
      id: generateUUID(),
      name,
      currency,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      fixedCosts: [],
      products: []
    };
    
    const updatedProjects = [...projects, newProject];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProjects));
    
    return newProject;
  },
  
  updateProject: (project: Project): Project => {
    const projects = projectStorage.getAllProjects();
    const updatedProjects = projects.map(p => 
      p.id === project.id 
        ? { ...project, updatedAt: new Date().toISOString() } 
        : p
    );
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProjects));
    return { ...project, updatedAt: new Date().toISOString() };
  },
  
  deleteProject: (id: string): void => {
    const projects = projectStorage.getAllProjects();
    const filteredProjects = projects.filter(project => project.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredProjects));
  }
}; 