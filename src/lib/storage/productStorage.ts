import type { Product, RevenueStream, ProductRevenueStream } from './types';
import { projectStorage } from './projectStorage';
import { generateUUID } from '@/lib/utils';

class ProductStorage {
  createProduct(product: Product, projectId: string): void {
    const project = projectStorage.getProjectById(projectId);
    if (!project) {
      throw new Error(`Project with ID ${projectId} not found`);
    }

    // Convert legacy Product to ProductRevenueStream for revenueStreams.items
    const productWithType: ProductRevenueStream = { 
      ...product, 
      type: 'product' as const 
    };

    const updatedProject = {
      ...project,
      revenueStreams: {
        items: [...(project.revenueStreams.items || []), productWithType]
      }
    };

    projectStorage.updateProject(updatedProject);
  }

  updateProduct(product: Product, projectId: string): void {
    const project = projectStorage.getProjectById(projectId);
    if (!project) {
      throw new Error(`Project with ID ${projectId} not found`);
    }

    const updatedItems = (project.revenueStreams.items || []).map((item: RevenueStream) => 
      item.id === product.id ? { ...product, type: 'product' as const } as ProductRevenueStream : item
    );

    const updatedProject = {
      ...project,
      revenueStreams: {
        items: updatedItems
      }
    };

    projectStorage.updateProject(updatedProject);
  }

  getProducts(projectId: string): ProductRevenueStream[] {
    const project = projectStorage.getProjectById(projectId);
    if (!project) {
      console.error('Project not found:', projectId);
      return [];
    }
    return (project.revenueStreams.items || []).filter((item: RevenueStream): item is ProductRevenueStream => item.type === 'product');
  }

  duplicateProduct(productId: string, projectId: string): ProductRevenueStream | null {
    console.log('Duplicating product:', productId);
    const project = projectStorage.getProjectById(projectId);
    if (!project) {
      console.error('Project not found:', projectId);
      return null;
    }

    const product = (project.revenueStreams.items || []).find((item: RevenueStream): item is ProductRevenueStream => item.type === 'product' && item.id === productId);
    if (!product) {
      console.log('Product not found:', productId);
      return null;
    }

    const newId = generateUUID();
    const newProduct: ProductRevenueStream = {
      id: newId,
      name: `${product.name} (Copy)`,
      type: 'product' as const,
      price: product.price,
      associatedCosts: product.associatedCosts.map((cost) => ({
        ...cost,
        id: generateUUID(),
        revenueStreamId: newId,
        projectId
      })),
      projectId,
      sales: product.sales
    };

    const updatedProject = {
      ...project,
      revenueStreams: {
        items: [...(project.revenueStreams.items || []), newProduct]
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

    const updatedItems = (project.revenueStreams.items || []).filter((item: RevenueStream) => item.id !== productId);
    const updatedProject = {
      ...project,
      revenueStreams: {
        items: updatedItems
      }
    };
    projectStorage.updateProject(updatedProject);
    console.log('Product deleted and project updated');
    
    return true;
  }
}

export const productStorage = new ProductStorage();
