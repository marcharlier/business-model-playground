import type { RevenueStream, ProductRevenueStream, SubscriptionRevenueStream } from './types';
import { projectStorage } from './projectStorage';
import { generateUUID } from '@/lib/utils';

/**
 * Unified storage layer for revenue streams (products and subscriptions).
 * All operations work with the unified RevenueStream type and persist via projectStorage.
 */
class RevenueStreamStorage {
  /**
   * Create a new revenue stream
   */
  createRevenueStream(revenueStream: RevenueStream, projectId: string): void {
    const project = projectStorage.getProjectById(projectId);
    if (!project) {
      throw new Error(`Project with ID ${projectId} not found`);
    }

    const updatedProject = {
      ...project,
      revenueStreams: {
        ...project.revenueStreams,
        items: [...project.revenueStreams.items, revenueStream],
      },
    };

    projectStorage.updateProject(updatedProject);
  }

  /**
   * Update an existing revenue stream.
   * This handles type changes seamlessly - the ID stays the same even if switching between product/subscription.
   */
  updateRevenueStream(revenueStream: RevenueStream, projectId: string): void {
    const project = projectStorage.getProjectById(projectId);
    if (!project) {
      throw new Error(`Project with ID ${projectId} not found`);
    }

    const updatedItems = project.revenueStreams.items.map((item) =>
      item.id === revenueStream.id ? revenueStream : item
    );

    const updatedProject = {
      ...project,
      revenueStreams: {
        ...project.revenueStreams,
        items: updatedItems,
      },
    };

    projectStorage.updateProject(updatedProject);
  }

  /**
   * Get all revenue streams for a project
   */
  getRevenueStreams(projectId: string): RevenueStream[] {
    const project = projectStorage.getProjectById(projectId);
    if (!project) {
      console.error('Project not found:', projectId);
      return [];
    }
    return project.revenueStreams.items || [];
  }

  /**
   * Get only product revenue streams
   */
  getProducts(projectId: string): ProductRevenueStream[] {
    return this.getRevenueStreams(projectId).filter(
      (item): item is ProductRevenueStream => item.type === 'product'
    );
  }

  /**
   * Get only subscription revenue streams
   */
  getSubscriptions(projectId: string): SubscriptionRevenueStream[] {
    return this.getRevenueStreams(projectId).filter(
      (item): item is SubscriptionRevenueStream => item.type === 'subscription'
    );
  }

  /**
   * Get a single revenue stream by ID
   */
  getRevenueStreamById(
    projectId: string,
    revenueStreamId: string
  ): RevenueStream | null {
    const items = this.getRevenueStreams(projectId);
    return items.find((item) => item.id === revenueStreamId) || null;
  }

  /**
   * Duplicate a revenue stream
   */
  duplicateRevenueStream(
    revenueStreamId: string,
    projectId: string
  ): RevenueStream | null {
    console.log('Duplicating revenue stream:', revenueStreamId);
    const project = projectStorage.getProjectById(projectId);
    if (!project) {
      console.error('Project not found:', projectId);
      return null;
    }

    const revenueStream = project.revenueStreams.items.find(
      (item) => item.id === revenueStreamId
    );
    if (!revenueStream) {
      console.log('Revenue stream not found:', revenueStreamId);
      return null;
    }

    const newId = generateUUID();

    // Create a copy with a new ID and updated associated costs
    const newRevenueStream: RevenueStream =
      revenueStream.type === 'product'
        ? {
            ...revenueStream,
            id: newId,
            name: `${revenueStream.name} (Copy)`,
            associatedCosts: revenueStream.associatedCosts.map((cost) => ({
              ...cost,
              id: generateUUID(),
              revenueStreamId: newId,
              projectId,
            })),
          }
        : {
            ...revenueStream,
            id: newId,
            name: `${revenueStream.name} (Copy)`,
            associatedCosts: revenueStream.associatedCosts.map((cost) => ({
              ...cost,
              id: generateUUID(),
              revenueStreamId: newId,
              projectId,
            })),
          };

    const updatedProject = {
      ...project,
      revenueStreams: {
        ...project.revenueStreams,
        items: [...project.revenueStreams.items, newRevenueStream],
      },
    };
    projectStorage.updateProject(updatedProject);
    console.log('Revenue stream duplicated and project updated');

    return newRevenueStream;
  }

  /**
   * Delete a revenue stream
   */
  deleteRevenueStream(revenueStreamId: string, projectId: string): boolean {
    console.log(
      'Deleting revenue stream:',
      revenueStreamId,
      'from project:',
      projectId
    );
    const project = projectStorage.getProjectById(projectId);
    if (!project) {
      console.error('Project not found:', projectId);
      return false;
    }

    const updatedItems = project.revenueStreams.items.filter(
      (item) => item.id !== revenueStreamId
    );
    const updatedProject = {
      ...project,
      revenueStreams: {
        ...project.revenueStreams,
        items: updatedItems,
      },
    };
    projectStorage.updateProject(updatedProject);
    console.log('Revenue stream deleted and project updated');

    return true;
  }
}

export const revenueStreamStorage = new RevenueStreamStorage();
