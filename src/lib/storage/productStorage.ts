import type { Product } from './types';
import { projectStorage } from './projectStorage';
import { generateUUID } from '@/lib/utils';

class ProductStorage {
  createProduct(product: Product, projectId: string): void {
    const project = projectStorage.getProjectById(projectId);
    if (!project) {
      throw new Error(`Project with ID ${projectId} not found`);
    }

    const updatedProject = {
      ...project,
      revenueStreams: {
        ...project.revenueStreams,
        products: [...project.revenueStreams.products, product]
      }
    };

    projectStorage.updateProject(updatedProject);
  }

  updateProduct(product: Product, projectId: string): void {
    const project = projectStorage.getProjectById(projectId);
    if (!project) {
      throw new Error(`Project with ID ${projectId} not found`);
    }

    const updatedProducts = project.revenueStreams.products.map(p => 
      p.id === product.id ? product : p
    );

    const updatedProject = {
      ...project,
      revenueStreams: {
        ...project.revenueStreams,
        products: updatedProducts
      }
    };

    projectStorage.updateProject(updatedProject);
  }

  getProducts(projectId: string): Product[] {
    const project = projectStorage.getProjectById(projectId);
    if (!project) {
      console.error('Project not found:', projectId);
      return [];
    }
    return project.revenueStreams.products || [];
  }

  duplicateProduct(productId: string, projectId: string): Product | null {
    console.log('Duplicating product:', productId);
    const project = projectStorage.getProjectById(projectId);
    if (!project) {
      console.error('Project not found:', projectId);
      return null;
    }

    const product = (project.revenueStreams.products || []).find(p => p.id === productId);
    if (!product) {
      console.log('Product not found:', productId);
      return null;
    }

    const newId = generateUUID();
    const newProduct: Product = {
      id: newId,
      name: `${product.name} (Copy)`,
      price: product.price,
      associatedCosts: product.associatedCosts.map(cost => ({
        ...cost,
        id: generateUUID(),
        productId: newId,
        projectId
      })),
      projectId,
      sales: product.sales
    };

    const updatedProject = {
      ...project,
      revenueStreams: {
        ...project.revenueStreams,
        products: [...(project.revenueStreams.products || []), newProduct]
      }
    };
    projectStorage.updateProject(updatedProject);
    console.log('Product duplicated and project updated');
    
    return newProduct;
  }

  deleteProduct(productId: string, projectId: string): boolean {
    console.log('Deleting product:', productId, 'from project:', projectId);
    const project = projectStorage.getProjectById(projectId);
    if (!project) {
      console.error('Project not found:', projectId);
      return false;
    }

    const updatedProducts = (project.revenueStreams.products || []).filter(p => p.id !== productId);
    const updatedProject = {
      ...project,
      revenueStreams: {
        ...project.revenueStreams,
        products: updatedProducts
      }
    };
    projectStorage.updateProject(updatedProject);
    console.log('Product deleted and project updated');
    
    return true;
  }
}

export const productStorage = new ProductStorage(); 