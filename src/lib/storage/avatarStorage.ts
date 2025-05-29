const AVATAR_STORAGE_KEY = 'business-model-playground-avatar-emoji';

export const avatarStorage = {
  getAvatar(): string {
    return localStorage.getItem(AVATAR_STORAGE_KEY) || '👤';
  },
}; 