import type { Subscription } from './types';
import { projectStorage } from './projectStorage';
import { generateUUID } from '@/lib/utils';

class SubscriptionStorage {
  createSubscription(subscription: Subscription, projectId: string): void {
    const project = projectStorage.getProjectById(projectId);
    if (!project) {
      throw new Error(`Project with ID ${projectId} not found`);
    }

    const updatedProject = {
      ...project,
      revenueStreams: {
        ...project.revenueStreams,
        subscriptions: [...(project.revenueStreams.subscriptions || []), subscription]
      }
    };

    projectStorage.updateProject(updatedProject);
  }

  updateSubscription(subscription: Subscription, projectId: string): void {
    const project = projectStorage.getProjectById(projectId);
    if (!project) {
      throw new Error(`Project with ID ${projectId} not found`);
    }

    const updatedSubscriptions = (project.revenueStreams.subscriptions || []).map(s => 
      s.id === subscription.id ? subscription : s
    );

    const updatedProject = {
      ...project,
      revenueStreams: {
        ...project.revenueStreams,
        subscriptions: updatedSubscriptions
      }
    };

    projectStorage.updateProject(updatedProject);
  }

  getSubscriptions(projectId: string): Subscription[] {
    const project = projectStorage.getProjectById(projectId);
    if (!project) {
      console.error('Project not found:', projectId);
      return [];
    }
    return project.revenueStreams.subscriptions || [];
  }

  duplicateSubscription(subscriptionId: string, projectId: string): Subscription | null {
    console.log('Duplicating subscription:', subscriptionId);
    const project = projectStorage.getProjectById(projectId);
    if (!project) {
      console.error('Project not found:', projectId);
      return null;
    }

    const subscription = (project.revenueStreams.subscriptions || []).find(s => s.id === subscriptionId);
    if (!subscription) {
      console.log('Subscription not found:', subscriptionId);
      return null;
    }

    const newId = generateUUID();
    const newSubscription: Subscription = {
      id: newId,
      name: `${subscription.name} (Copy)`,
      price: subscription.price,
      pricePeriod: subscription.pricePeriod || 'monthly',
      subscribers: subscription.subscribers,
      associatedCosts: subscription.associatedCosts.map(cost => ({
        ...cost,
        id: generateUUID(),
        subscriptionId: newId,
        projectId
      })),
      projectId
    };

    const updatedProject = {
      ...project,
      revenueStreams: {
        ...project.revenueStreams,
        subscriptions: [...(project.revenueStreams.subscriptions || []), newSubscription]
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

    const updatedSubscriptions = (project.revenueStreams.subscriptions || []).filter(s => s.id !== subscriptionId);
    const updatedProject = {
      ...project,
      revenueStreams: {
        ...project.revenueStreams,
        subscriptions: updatedSubscriptions
      }
    };
    projectStorage.updateProject(updatedProject);
    console.log('Subscription deleted and project updated');
    
    return true;
  }
}

export const subscriptionStorage = new SubscriptionStorage();

