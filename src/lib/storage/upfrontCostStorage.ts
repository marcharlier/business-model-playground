import type { UpfrontCost, Project } from './types';
import { projectStorage } from './projectStorage';
import { generateUUID } from '@/lib/utils';

export const upfrontCostStorage = {
  getUpfrontCostsByProjectId: (projectId: string): UpfrontCost[] => {
    const project = projectStorage.getProjectById(projectId);
    return project?.upfrontCosts || [];
  },

  createUpfrontCost: (projectId: string, name: string, amount: number): UpfrontCost => {
    const project = projectStorage.getProjectById(projectId);
    if (!project) throw new Error(`Project with ID ${projectId} not found`);
    const newCost: UpfrontCost = { id: generateUUID(), name, amount, projectId } as UpfrontCost;
    const updatedProject: Project = { ...project, upfrontCosts: [newCost, ...(project.upfrontCosts || [])] } as Project;
    projectStorage.updateProject(updatedProject);
    return newCost;
  },

  updateUpfrontCost: (projectId: string, cost: UpfrontCost): UpfrontCost => {
    const project = projectStorage.getProjectById(projectId);
    if (!project) throw new Error(`Project with ID ${projectId} not found`);
    const updated = (project.upfrontCosts || []).map(c => c.id === cost.id ? cost : c);
    const updatedProject: Project = { ...project, upfrontCosts: updated } as Project;
    projectStorage.updateProject(updatedProject);
    return cost;
  },

  deleteUpfrontCost: (projectId: string, costId: string): void => {
    const project = projectStorage.getProjectById(projectId);
    if (!project) throw new Error(`Project with ID ${projectId} not found`);
    const updated = (project.upfrontCosts || []).filter(c => c.id !== costId);
    const updatedProject: Project = { ...project, upfrontCosts: updated } as Project;
    projectStorage.updateProject(updatedProject);
  },
};


