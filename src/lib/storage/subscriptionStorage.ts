import type { Subscription, RevenueStream, SubscriptionRevenueStream } from './types';
import { projectStorage } from './projectStorage';
import { generateUUID } from '@/lib/utils';

class SubscriptionStorage {
  createSubscription(subscription: Subscription, projectId: string): void {
    const project = projectStorage.getProjectById(projectId);
    if (!project) {
      throw new Error(`Project with ID ${projectId} not found`);
    }

    // Convert legacy Subscription to SubscriptionRevenueStream for revenueStreams.items
    const subscriptionWithType: SubscriptionRevenueStream = { 
      ...subscription, 
      type: 'subscription' as const 
    };

    const updatedProject = {
      ...project,
      revenueStreams: {
        items: [...(project.revenueStreams.items || []), subscriptionWithType]
      }
    };

    projectStorage.updateProject(updatedProject);
  }

  updateSubscription(subscription: Subscription, projectId: string): void {
    const project = projectStorage.getProjectById(projectId);
    if (!project) {
      throw new Error(`Project with ID ${projectId} not found`);
    }

    const updatedItems = (project.revenueStreams.items || []).map((item: RevenueStream) => 
      item.id === subscription.id ? { ...subscription, type: 'subscription' as const } as SubscriptionRevenueStream : item
    );

    const updatedProject = {
      ...project,
      revenueStreams: {
        items: updatedItems
      }
    };

    projectStorage.updateProject(updatedProject);
  }

  getSubscriptions(projectId: string): SubscriptionRevenueStream[] {
    const project = projectStorage.getProjectById(projectId);
    if (!project) {
      console.error('Project not found:', projectId);
      return [];
    }
    return (project.revenueStreams.items || []).filter((item: RevenueStream): item is SubscriptionRevenueStream => item.type === 'subscription');
  }

  duplicateSubscription(subscriptionId: string, projectId: string): SubscriptionRevenueStream | null {
    console.log('Duplicating subscription:', subscriptionId);
    const project = projectStorage.getProjectById(projectId);
    if (!project) {
      console.error('Project not found:', projectId);
      return null;
    }

    const subscription = (project.revenueStreams.items || []).find((item: RevenueStream): item is SubscriptionRevenueStream => item.type === 'subscription' && item.id === subscriptionId);
    if (!subscription) {
      console.log('Subscription not found:', subscriptionId);
      return null;
    }

    const newId = generateUUID();
    const newSubscription: SubscriptionRevenueStream = {
      id: newId,
      name: `${subscription.name} (Copy)`,
      type: 'subscription' as const,
      price: subscription.price,
      pricePeriod: subscription.pricePeriod || 'monthly',
      subscribers: subscription.subscribers,
      associatedCosts: subscription.associatedCosts.map((cost) => ({
        ...cost,
        id: generateUUID(),
        revenueStreamId: newId,
        projectId
      })),
      projectId
    };

    const updatedProject = {
      ...project,
      revenueStreams: {
        items: [...(project.revenueStreams.items || []), newSubscription]
      }
    };
    projectStorage.updateProject(updatedProject);
    console.log('Subscription duplicated and project updated');
    
    return newSubscription;
  }

  deleteSubscription(subscriptionId: string, projectId: string): boolean {
    console.log('Deleting subscription:', subscriptionId, 'from project:', projectId);
    const project = projectStorage.getProjectById(projectId);
    if (!project) {
      console.error('Project not found:', projectId);
      return false;
    }

    const updatedItems = (project.revenueStreams.items || []).filter((item: RevenueStream) => item.id !== subscriptionId);
    const updatedProject = {
      ...project,
      revenueStreams: {
        items: updatedItems
      }
    };
    projectStorage.updateProject(updatedProject);
    console.log('Subscription deleted and project updated');
    
    return true;
  }
}

export const subscriptionStorage = new SubscriptionStorage();
