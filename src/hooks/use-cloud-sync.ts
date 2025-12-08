'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { projectStorage } from '@/lib/storage/projectStorage';
import { cloudProjectStorage } from '@/lib/storage/cloudProjectStorage';
import type { Project } from '@/lib/storage/types';

export type CloudSyncStatus = 'idle' | 'syncing' | 'migrating' | 'error' | 'offline';

interface UseCloudSyncOptions {
  /** Debounce delay in ms before syncing after a change. Default: 300 */
  debounceMs?: number;
  /** Current project ID to sync (if in single-project context) */
  projectId?: string;
}

interface UseCloudSyncReturn {
  status: CloudSyncStatus;
  error: string | null;
  lastSyncedAt: Date | null;
  /** Manually trigger a sync for the current project */
  syncNow: () => Promise<void>;
  /** Force retry after an error */
  retry: () => Promise<void>;
}

export function useCloudSync(options: UseCloudSyncOptions = {}): UseCloudSyncReturn {
  const { debounceMs = 300, projectId } = options;

  const [status, setStatus] = useState<CloudSyncStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingSyncRef = useRef<string | null>(null);
  const hasInitializedRef = useRef(false);
  const isReconciling = useRef(false);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      if (status === 'offline') {
        setStatus('idle');
      }
    };
    const handleOffline = () => {
      setStatus('offline');
      setError(null); // Clear any previous error since we now know it's just offline
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [status]);

  /**
   * Check if an error is likely due to being offline.
   */
  const isNetworkError = useCallback((err: unknown): boolean => {
    if (!navigator.onLine) return true;
    if (err instanceof TypeError && err.message.includes('fetch')) return true;
    if (err instanceof Error) {
      const msg = err.message.toLowerCase();
      return msg.includes('network') || msg.includes('failed to fetch') || msg.includes('offline');
    }
    return false;
  }, []);

  /**
   * Sync a single project to cloud storage.
   */
  const syncProject = useCallback(async (project: Project) => {
    // Don't attempt sync if offline
    if (!navigator.onLine) {
      setStatus('offline');
      return;
    }

    try {
      setStatus('syncing');
      setError(null);
      await cloudProjectStorage.syncProject(project);
      setLastSyncedAt(new Date());
      setStatus('idle');
    } catch (err) {
      console.error('Cloud sync failed:', err);
      if (isNetworkError(err)) {
        setStatus('offline');
        setError(null);
      } else {
        setError(err instanceof Error ? err.message : 'Sync failed');
        setStatus('error');
      }
    }
  }, [isNetworkError]);

  /**
   * Delete a project from cloud storage.
   */
  const deleteFromCloud = useCallback(async (deletedProjectId: string) => {
    // Don't attempt delete if offline
    if (!navigator.onLine) {
      setStatus('offline');
      return;
    }

    try {
      setStatus('syncing');
      setError(null);
      await cloudProjectStorage.deleteProject(deletedProjectId);
      setLastSyncedAt(new Date());
      setStatus('idle');
    } catch (err) {
      console.error('Cloud delete failed:', err);
      if (isNetworkError(err)) {
        setStatus('offline');
        setError(null);
      } else {
        setError(err instanceof Error ? err.message : 'Delete sync failed');
        setStatus('error');
      }
    }
  }, [isNetworkError]);

  /**
   * Initial reconciliation: fetch cloud data and merge with local storage.
   */
  const reconcileWithCloud = useCallback(async () => {
    // Prevent multiple simultaneous reconciliations
    if (isReconciling.current) return;
    isReconciling.current = true;

    // If offline, skip reconciliation and allow local-only usage
    if (!navigator.onLine) {
      setStatus('offline');
      hasInitializedRef.current = true;
      isReconciling.current = false;
      return;
    }

    try {
      setStatus('syncing');
      setError(null);

      // Fetch all cloud projects
      const cloudProjects = await cloudProjectStorage.fetchUserProjects();
      const cloudProjectMap = new Map(
        cloudProjects.map((cp) => [cp.projectId, cp])
      );

      // Get all local projects
      const localProjects = projectStorage.getAllProjects();

      // Reconciliation logic:
      // 1. Cloud projects override matching local projects (cloud is source of truth)
      // 2. Local-only projects get migrated to cloud

      const reconciledProjects: Project[] = [];
      const projectsToMigrate: Project[] = [];

      // Process cloud projects first (they take precedence)
      for (const cloudProject of cloudProjects) {
        reconciledProjects.push(cloudProject.projectData);
      }

      // Find local-only projects that need migration
      for (const localProject of localProjects) {
        if (!cloudProjectMap.has(localProject.id)) {
          // This project only exists locally - needs migration
          projectsToMigrate.push(localProject);
          reconciledProjects.push(localProject);
        }
      }

      // Update localStorage with reconciled data
      const STORAGE_KEY = 'business-model-playground-projects';
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reconciledProjects));

      // Migrate local-only projects to cloud
      if (projectsToMigrate.length > 0) {
        setStatus('migrating');
        await cloudProjectStorage.syncProjects(projectsToMigrate);
      }

      setLastSyncedAt(new Date());
      setStatus('idle');
      hasInitializedRef.current = true;

      // Notify other parts of the app that projects have changed
      window.dispatchEvent(new Event('projectChange'));
    } catch (err) {
      console.error('Cloud reconciliation failed:', err);
      if (isNetworkError(err)) {
        setStatus('offline');
        setError(null);
      } else {
        setError(err instanceof Error ? err.message : 'Reconciliation failed');
        setStatus('error');
      }
      hasInitializedRef.current = true; // Still mark as initialized to allow local-only usage
    } finally {
      isReconciling.current = false;
    }
  }, [isNetworkError]);

  /**
   * Handle project changes from localStorage (debounced sync).
   */
  const handleProjectChange = useCallback(() => {
    // Don't sync during initial reconciliation or while reconciling
    if (!hasInitializedRef.current || isReconciling.current) return;

    // Clear any existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // If we have a specific project ID, sync that project
    if (projectId) {
      pendingSyncRef.current = projectId;
    }

    debounceTimerRef.current = setTimeout(async () => {
      if (projectId) {
        const project = projectStorage.getProjectById(projectId);
        if (project) {
          await syncProject(project);
        } else {
          // Project was deleted
          await deleteFromCloud(projectId);
        }
      }
    }, debounceMs);
  }, [projectId, debounceMs, syncProject, deleteFromCloud]);

  /**
   * Manually trigger a sync for the current project.
   */
  const syncNow = useCallback(async () => {
    if (projectId) {
      const project = projectStorage.getProjectById(projectId);
      if (project) {
        await syncProject(project);
      }
    }
  }, [projectId, syncProject]);

  /**
   * Retry after an error.
   */
  const retry = useCallback(async () => {
    if (!hasInitializedRef.current) {
      await reconcileWithCloud();
    } else {
      await syncNow();
    }
  }, [reconcileWithCloud, syncNow]);

  // Initial reconciliation on mount
  useEffect(() => {
    reconcileWithCloud();
  }, [reconcileWithCloud]);

  // Listen for project changes
  useEffect(() => {
    window.addEventListener('projectChange', handleProjectChange);
    return () => {
      window.removeEventListener('projectChange', handleProjectChange);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [handleProjectChange]);

  return {
    status,
    error,
    lastSyncedAt,
    syncNow,
    retry,
  };
}

