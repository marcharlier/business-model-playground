import type { FixedCost, Project } from './types';
import { projectStorage } from './projectStorage';
import { generateUUID } from '@/lib/utils';

export const fixedCostStorage = {
  getFixedCostsByProjectId: (projectId: string): FixedCost[] => {
    const project = projectStorage.getProjectById(projectId);
    return project?.costStructure.fixedRunningCosts || [];
  },
  
  getFixedCostById: (projectId: string, costId: string): FixedCost | null => {
    const project = projectStorage.getProjectById(projectId);
    if (!project) return null;
    
    return project.costStructure.fixedRunningCosts.find(cost => cost.id === costId) || null;
  },
  
  createFixedCost: (
    projectId: string, 
    name: string, 
    amount: number, 
    frequency: FixedCost['frequency'],
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
      costStructure: {
        ...project.costStructure,
        fixedRunningCosts: [...project.costStructure.fixedRunningCosts, newFixedCost]
      }
    };
    
    projectStorage.updateProject(updatedProject);
    return newFixedCost;
  },
  
  updateFixedCost: (projectId: string, fixedCost: FixedCost): FixedCost => {
    const project = projectStorage.getProjectById(projectId);
    if (!project) {
      throw new Error(`Project with ID ${projectId} not found`);
    }
    
    const updatedFixedCosts = project.costStructure.fixedRunningCosts.map(cost => 
      cost.id === fixedCost.id ? fixedCost : cost
    );
    
    const updatedProject: Project = {
      ...project,
      costStructure: {
        ...project.costStructure,
        fixedRunningCosts: updatedFixedCosts
      }
    };
    
    projectStorage.updateProject(updatedProject);
    return fixedCost;
  },
  
  deleteFixedCost: (projectId: string, costId: string): void => {
    const project = projectStorage.getProjectById(projectId);
    if (!project) {
      throw new Error(`Project with ID ${projectId} not found`);
    }
    
    const updatedFixedCosts = project.costStructure.fixedRunningCosts.filter(cost => cost.id !== costId);
    
    const updatedProject: Project = {
      ...project,
      costStructure: {
        ...project.costStructure,
        fixedRunningCosts: updatedFixedCosts
      }
    };
    
    projectStorage.updateProject(updatedProject);
  }
}; 