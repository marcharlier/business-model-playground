import type { Project, ProductSales } from './types';
import { projectStorage } from './projectStorage';

export const productSalesStorage = {
  getSalesByProjectId: (projectId: string): Record<string, ProductSales> => {
    const project = projectStorage.getProjectById(projectId);
    if (!project) return {};
    
    // Extract sales from products in revenueStreams
    const sales: Record<string, ProductSales> = {};
    project.revenueStreams.products.forEach((product) => {
      if (product.sales) {
        sales[product.id] = product.sales;
      }
    });
    return sales;
  },

  setSalesForProduct: (projectId: string, productId: string, sales: ProductSales): void => {
    const project = projectStorage.getProjectById(projectId);
    if (!project) throw new Error(`Project with ID ${projectId} not found`);
    
    // Update the product's sales field in revenueStreams
    const updatedProducts = project.revenueStreams.products.map((product) =>
      product.id === productId ? { ...product, sales } : product
    );
    
    const updatedProject: Project = {
      ...project,
      revenueStreams: {
        ...project.revenueStreams,
        products: updatedProducts,
      },
    };
    projectStorage.updateProject(updatedProject);
  },
};


