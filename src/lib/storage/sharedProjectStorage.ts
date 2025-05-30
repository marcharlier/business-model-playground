import { supabase } from '../supabase/client';
import type { Project } from './types';

export const sharedProjectStorage = {
  async createSharedProject(project: Project, authorAvatar: string) {
    const { data, error } = await supabase
      .from('shared_projects')
      .insert({
        project_data: project,
        author_avatar: authorAvatar,
      })
      .select('*')
      .single();

    if (error) {
      throw new Error('Failed to create shared project');
    }

    return {
      id: data.id,
      projectData: data.project_data as Project,
      authorAvatar: data.author_avatar as string,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  },

  async getSharedProject(id: string) {
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

    return {
      id: data.id,
      projectData: data.project_data as Project,
      authorAvatar: data.author_avatar as string,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  },

  async updateSharedProject(id: string, project: Project) {
    console.log('Updating shared project:', {
      id,
      projectName: project.name,
      projectData: project,
    });

    // First verify the project exists
    const { data: existingProject, error: fetchError } = await supabase
      .from('shared_projects')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingProject) {
      console.error('Error fetching existing project:', fetchError);
      throw new Error('Shared project not found');
    }

    console.log('Found existing project:', {
      id: existingProject.id,
      currentName: existingProject.project_data.name,
      currentData: existingProject.project_data,
    });

    const now = new Date().toISOString();

    // Then update the existing project
    const { data, error } = await supabase
      .from('shared_projects')
      .update({
        project_data: project, // Update the entire project data
        updated_at: now,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating shared project:', error);
      throw new Error('Failed to update shared project');
    }

    console.log('Successfully updated shared project:', {
      id: data.id,
      newName: data.project_data.name,
      updated_at: data.updated_at,
      projectData: data.project_data,
    });

    return {
      id: data.id,
      projectData: data.project_data as Project,
      authorAvatar: data.author_avatar as string,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  },

  async deleteSharedProject(id: string) {
    const { error } = await supabase
      .from('shared_projects')
      .delete()
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error deleting shared project:', error);
      throw new Error('Failed to delete shared project');
    }
  },
}; 