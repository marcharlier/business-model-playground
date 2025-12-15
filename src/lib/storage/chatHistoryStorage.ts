import { supabase, withUserContext } from '../supabase/client';
import { userStorage } from './userStorage';
import type { UIMessage } from 'ai';

/**
 * Storage type for chat messages - matches AI SDK UIMessage format
 */
export type StoredChatMessage = UIMessage;

export const chatHistoryStorage = {
  /**
   * Fetch chat history for a specific project from Supabase.
   */
  async fetchChatHistory(projectId: string): Promise<StoredChatMessage[]> {
    const userId = userStorage.getUserId();

    return withUserContext(async () => {
      const { data, error } = await supabase
        .from('user_projects')
        .select('chat_history')
        .eq('user_id', userId)
        .eq('project_id', projectId)
        .single();

      if (error) {
        // Return empty array for any error - project might not be synced yet
        // or chat_history column might not exist
        console.warn('Could not fetch chat history (may not be synced yet):', error.message);
        return [];
      }

      return (data?.chat_history as StoredChatMessage[]) || [];
    }, userId);
  },

  /**
   * Save chat history for a specific project to Supabase.
   * This replaces the entire chat history for the project.
   */
  async saveChatHistory(projectId: string, messages: StoredChatMessage[]): Promise<void> {
    const userId = userStorage.getUserId();

    return withUserContext(async () => {
      const now = new Date().toISOString();

      const { error } = await supabase
        .from('user_projects')
        .update({
          chat_history: messages,
          updated_at: now,
        })
        .eq('user_id', userId)
        .eq('project_id', projectId);

      if (error) {
        // Don't throw - project might not be synced to cloud yet
        // This is expected for newly created local projects
        console.warn('Could not save chat history (project may not be synced yet):', error.message);
      }
    }, userId);
  },

  /**
   * Append a single message to the chat history.
   * More efficient than fetching and re-saving the entire history.
   */
  async appendMessage(projectId: string, message: StoredChatMessage): Promise<void> {
    const userId = userStorage.getUserId();

    return withUserContext(async () => {
      const now = new Date().toISOString();

      // Use Postgres JSONB append operation for efficiency
      const { error } = await supabase.rpc('append_chat_message', {
        p_user_id: userId,
        p_project_id: projectId,
        p_message: message,
        p_updated_at: now,
      });

      // If the RPC function doesn't exist, fall back to fetch and update
      if (error) {
        console.warn('append_chat_message RPC not available, using fallback:', error.message);
        const history = await this.fetchChatHistory(projectId);
        history.push(message);
        await this.saveChatHistory(projectId, history);
      }
    }, userId);
  },

  /**
   * Clear chat history for a specific project.
   */
  async clearChatHistory(projectId: string): Promise<void> {
    const userId = userStorage.getUserId();

    return withUserContext(async () => {
      const now = new Date().toISOString();

      const { error } = await supabase
        .from('user_projects')
        .update({
          chat_history: [],
          updated_at: now,
        })
        .eq('user_id', userId)
        .eq('project_id', projectId);

      if (error) {
        console.error('Error clearing chat history:', error);
        throw new Error('Failed to clear chat history');
      }
    }, userId);
  },

  /**
   * Get the last N messages from chat history.
   * Useful for providing context to the AI without loading entire history.
   */
  async getRecentMessages(projectId: string, count: number = 10): Promise<StoredChatMessage[]> {
    const history = await this.fetchChatHistory(projectId);
    return history.slice(-count);
  },
};
