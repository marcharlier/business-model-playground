import { supabase, withUserContext } from '../supabase/client';
import type { Project } from './types';
import { migrateProject } from '../domain/migrations';
import { userStorage } from './userStorage';

export const sharedProjectStorage = {
  async createSharedProject(project: Project, authorAvatar: string) {
    const userId = userStorage.getUserId();
    
    return withUserContext(async () => {
      const normalized = migrateProject(project);
      const { data, error } = await supabase
        .from('shared_projects')
        .insert({
          project_data: normalized,
          author_avatar: authorAvatar,
          user_id: userId, // Store user_id for ownership
        })
        .select('*')
        .single();

      if (error) {
        throw new Error('Failed to create shared project');
      }

      return {
        id: data.id,
        projectData: migrateProject(data.project_data) as Project,
        authorAvatar: data.author_avatar as string,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    }, userId); // Pass userId instead of authorAvatar
  },

  async getSharedProject(id: string) {
    // For read operations, we don't need to set the user context
    const { data, error } = await supabase
      .from('shared_projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Shared project not found');
      }
      throw new Error('Failed to fetch shared project');
    }

    const normalized = migrateProject(data.project_data);
    return {
      id: data.id,
      projectData: normalized as Project,
      authorAvatar: data.author_avatar as string,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  },

  async updateSharedProject(id: string, project: Project) {
    const userId = userStorage.getUserId();
    
    return withUserContext(async () => {
      // Verify project exists and user is the author (check user_id)
      const { data: existingProject, error: fetchError } = await supabase
        .from('shared_projects')
        .select('user_id')
        .eq('id', id)
        .single();

      if (fetchError || !existingProject) {
        throw new Error('Shared project not found');
      }

      if (existingProject.user_id !== userId) {
        throw new Error('You are not the author of this shared project');
      }

      // Update without manually setting updated_at (let trigger handle it)
      const { data, error } = await supabase
        .from('shared_projects')
        .update({
          project_data: migrateProject(project),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating shared project:', error);
        throw new Error(`Failed to update shared project: ${error.message}`);
      }

      return {
        id: data.id,
        projectData: migrateProject(data.project_data) as Project,
        authorAvatar: data.author_avatar as string,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    }, userId); // Pass userId instead of authorAvatar
  },

  async deleteSharedProject(id: string) {
    const userId = userStorage.getUserId();
    
    return withUserContext(async () => {
      // Verify project exists and user is the author (check user_id)
      const { data: existingProject, error: fetchError } = await supabase
        .from('shared_projects')
        .select('user_id')
        .eq('id', id)
        .single();

      if (fetchError || !existingProject) {
        throw new Error('Shared project not found');
      }

      if (existingProject.user_id !== userId) {
        throw new Error('You are not the author of this shared project');
      }

      const { data, error } = await supabase
        .from('shared_projects')
        .delete()
        .eq('id', id)
        .select();

      if (error) {
        console.error('Error deleting shared project:', error);
        throw new Error(`Failed to delete shared project: ${error.message}`);
      }

      if (!data || data.length === 0) {
        throw new Error('No rows were deleted. The shared project may not exist or you may not have permission.');
      }
    }, userId); // Pass userId instead of authorAvatar
  },
}; 