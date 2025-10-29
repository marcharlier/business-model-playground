import type { Project, ProductSales } from './types';
import { projectStorage } from './projectStorage';

export const productSalesStorage = {
  getSalesByProjectId: (projectId: string): Record<string, ProductSales> => {
    const project = projectStorage.getProjectById(projectId);
    return (project?.productSales || {}) as Record<string, ProductSales>;
  },

  setSalesForProduct: (projectId: string, productId: string, sales: ProductSales): void => {
    const project = projectStorage.getProjectById(projectId);
    if (!project) throw new Error(`Project with ID ${projectId} not found`);
    const updatedSales = { ...(project.productSales || {}), [productId]: sales };
    const updatedProject: Project = { ...project, productSales: updatedSales } as Project;
    projectStorage.updateProject(updatedProject);
  },
};


