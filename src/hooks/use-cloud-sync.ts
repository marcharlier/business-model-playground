'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { projectStorage } from '@/lib/storage/projectStorage';
import { cloudProjectStorage } from '@/lib/storage/cloudProjectStorage';
import type { Project } from '@/lib/storage/types';

export type CloudSyncStatus = 'idle' | 'syncing' | 'migrating' | 'error';

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

  /**
   * Sync a single project to cloud storage.
   */
  const syncProject = useCallback(async (project: Project) => {
    try {
      setStatus('syncing');
      setError(null);
      await cloudProjectStorage.syncProject(project);
      setLastSyncedAt(new Date());
      setStatus('idle');
    } catch (err) {
      console.error('Cloud sync failed:', err);
      setError(err instanceof Error ? err.message : 'Sync failed');
      setStatus('error');
    }
  }, []);

  /**
   * Delete a project from cloud storage.
   */
  const deleteFromCloud = useCallback(async (deletedProjectId: string) => {
    try {
      setStatus('syncing');
      setError(null);
      await cloudProjectStorage.deleteProject(deletedProjectId);
      setLastSyncedAt(new Date());
      setStatus('idle');
    } catch (err) {
      console.error('Cloud delete failed:', err);
      setError(err instanceof Error ? err.message : 'Delete sync failed');
      setStatus('error');
    }
  }, []);

  /**
   * Initial reconciliation: fetch cloud data and merge with local storage.
   */
  const reconcileWithCloud = useCallback(async () => {
    // Prevent multiple simultaneous reconciliations
    if (isReconciling.current) return;
    isReconciling.current = true;

    try {
      setStatus('migrating');
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
        await cloudProjectStorage.syncProjects(projectsToMigrate);
      }

      setLastSyncedAt(new Date());
      setStatus('idle');
      hasInitializedRef.current = true;

      // Notify other parts of the app that projects have changed
      window.dispatchEvent(new Event('projectChange'));
    } catch (err) {
      console.error('Cloud reconciliation failed:', err);
      setError(err instanceof Error ? err.message : 'Reconciliation failed');
      setStatus('error');
      hasInitializedRef.current = true; // Still mark as initialized to allow local-only usage
    } finally {
      isReconciling.current = false;
    }
  }, []);

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

