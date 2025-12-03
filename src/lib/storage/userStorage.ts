import { generateUUID } from '@/lib/utils';

const USER_ID_STORAGE_KEY = 'business-model-playground-user-id';

const isBrowser = typeof window !== 'undefined';

export const userStorage = {
  /**
   * Get the user's unique ID, generating one if it doesn't exist.
   * This ID is used to associate projects with a user in cloud storage.
   */
  getUserId(): string {
    if (!isBrowser) {
      throw new Error('Cannot access user ID during server-side rendering');
    }

    let userId = localStorage.getItem(USER_ID_STORAGE_KEY);
    
    if (!userId) {
      userId = generateUUID();
      localStorage.setItem(USER_ID_STORAGE_KEY, userId);
    }
    
    return userId;
  },

  /**
   * Check if a user ID exists in storage.
   */
  hasUserId(): boolean {
    if (!isBrowser) return false;
    return localStorage.getItem(USER_ID_STORAGE_KEY) !== null;
  },
};

