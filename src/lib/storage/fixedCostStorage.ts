import type { FixedCost, Project } from './types';
import { projectStorage } from './projectStorage';
import { generateUUID } from '@/lib/utils';

export const fixedCostStorage = {
  getFixedCostsByProjectId: (projectId: string): FixedCost[] => {
    const project = projectStorage.getProjectById(projectId);
    return project?.fixedCosts || [];
  },
  
  getFixedCostById: (projectId: string, costId: string): FixedCost | null => {
    const project = projectStorage.getProjectById(projectId);
    if (!project) return null;
    
    return project.fixedCosts.find(cost => cost.id === costId) || null;
  },
  
  createFixedCost: (
    projectId: string, 
    name: string, 
    amount: number, 
    frequency: 'monthly' | 'annual' | 'upfront',
    category: string
  ): FixedCost => {
    const project = projectStorage.getProjectById(projectId);
    if (!project) {
      throw new Error(`Project with ID ${projectId} not found`);
    }
    
    const newFixedCost: FixedCost = {
      id: generateUUID(),
      name,
      amount,
      frequency,
      category,
      projectId
    };
    
    const updatedProject: Project = {
      ...project,
      fixedCosts: [...project.fixedCosts, newFixedCost]
    };
    
    projectStorage.updateProject(updatedProject);
    return newFixedCost;
  },
  
  updateFixedCost: (projectId: string, fixedCost: FixedCost): FixedCost => {
    const project = projectStorage.getProjectById(projectId);
    if (!project) {
      throw new Error(`Project with ID ${projectId} not found`);
    }
    
    const updatedFixedCosts = project.fixedCosts.map(cost => 
      cost.id === fixedCost.id ? fixedCost : cost
    );
    
    const updatedProject: Project = {
      ...project,
      fixedCosts: updatedFixedCosts
    };
    
    projectStorage.updateProject(updatedProject);
    return fixedCost;
  },
  
  deleteFixedCost: (projectId: string, costId: string): void => {
    const project = projectStorage.getProjectById(projectId);
    if (!project) {
      throw new Error(`Project with ID ${projectId} not found`);
    }
    
    const updatedFixedCosts = project.fixedCosts.filter(cost => cost.id !== costId);
    
    const updatedProject: Project = {
      ...project,
      fixedCosts: updatedFixedCosts
    };
    
    projectStorage.updateProject(updatedProject);
  }
}; 