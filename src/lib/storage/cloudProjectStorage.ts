import { supabase, withUserContext } from '../supabase/client';
import { userStorage } from './userStorage';
import { migrateProject } from '../domain/migrations';
import type { Project } from './types';

export interface CloudProject {
  id: string;
  userId: string;
  projectId: string;
  projectData: Project;
  createdAt: string;
  updatedAt: string;
}

export const cloudProjectStorage = {
  /**
   * Fetch all projects for the current user from cloud storage.
   */
  async fetchUserProjects(): Promise<CloudProject[]> {
    const userId = userStorage.getUserId();

    return withUserContext(async () => {
      const { data, error } = await supabase
        .from('user_projects')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user projects:', error);
        throw new Error('Failed to fetch projects from cloud');
      }

      return (data || []).map((row) => ({
        id: row.id,
        userId: row.user_id,
        projectId: row.project_id,
        projectData: migrateProject(row.project_data) as Project,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    }, userId);
  },

  /**
   * Sync a project to cloud storage (upsert).
   * Creates a new record if the project doesn't exist, updates if it does.
   */
  async syncProject(project: Project): Promise<CloudProject> {
    const userId = userStorage.getUserId();

    return withUserContext(async () => {
      const normalized = migrateProject(project);
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('user_projects')
        .upsert(
          {
            user_id: userId,
            project_id: project.id,
            project_data: normalized,
            updated_at: now,
          },
          {
            onConflict: 'user_id,project_id',
          }
        )
        .select()
        .single();

      if (error) {
        console.error('Error syncing project to cloud:', error);
        throw new Error('Failed to sync project to cloud');
      }

      return {
        id: data.id,
        userId: data.user_id,
        projectId: data.project_id,
        projectData: migrateProject(data.project_data) as Project,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    }, userId);
  },

  /**
   * Delete a project from cloud storage.
   */
  async deleteProject(projectId: string): Promise<void> {
    const userId = userStorage.getUserId();

    return withUserContext(async () => {
      const { error } = await supabase
        .from('user_projects')
        .delete()
        .eq('user_id', userId)
        .eq('project_id', projectId);

      if (error) {
        console.error('Error deleting project from cloud:', error);
        throw new Error('Failed to delete project from cloud');
      }
    }, userId);
  },

  /**
   * Sync multiple projects to cloud storage in a batch.
   */
  async syncProjects(projects: Project[]): Promise<void> {
    const userId = userStorage.getUserId();

    return withUserContext(async () => {
      const now = new Date().toISOString();
      const records = projects.map((project) => ({
        user_id: userId,
        project_id: project.id,
        project_data: migrateProject(project),
        updated_at: now,
      }));

      const { error } = await supabase
        .from('user_projects')
        .upsert(records, {
          onConflict: 'user_id,project_id',
        });

      if (error) {
        console.error('Error batch syncing projects to cloud:', error);
        throw new Error('Failed to sync projects to cloud');
      }
    }, userId);
  },
};

