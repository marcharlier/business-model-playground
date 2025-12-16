import type { Project, ProductSales, RevenueStream } from './types';
import { projectStorage } from './projectStorage';

export const productSalesStorage = {
  getSalesByProjectId: (projectId: string): Record<string, ProductSales> => {
    const project = projectStorage.getProjectById(projectId);
    if (!project) return {};
    
    // Extract sales from products in revenueStreams
    const sales: Record<string, ProductSales> = {};
    (project.revenueStreams.items || []).forEach((item: RevenueStream) => {
      if (item.type === 'product' && item.sales) {
        sales[item.id] = item.sales;
      }
    });
    return sales;
  },

  setSalesForProduct: (projectId: string, productId: string, sales: ProductSales): void => {
    const project = projectStorage.getProjectById(projectId);
    if (!project) throw new Error(`Project with ID ${projectId} not found`);
    
    // Update the product's sales field in revenueStreams
    const updatedItems = (project.revenueStreams.items || []).map((item: RevenueStream) =>
      item.type === 'product' && item.id === productId ? { ...item, sales } : item
    );
    
    const updatedProject: Project = {
      ...project,
      revenueStreams: {
        items: updatedItems,
      },
    };
    projectStorage.updateProject(updatedProject);
  },
};
