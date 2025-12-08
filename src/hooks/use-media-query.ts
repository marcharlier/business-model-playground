import { useCallback, useSyncExternalStore } from 'react';

// Stable server snapshot - returns false during SSR
function getServerSnapshot(): boolean {
  return false;
}

export function useMediaQuery(query: string) {
  const subscribe = useCallback((callback: () => void) => {
    const media = window.matchMedia(query);
    media.addEventListener('change', callback);
    return () => media.removeEventListener('change', callback);
  }, [query]);

  const getSnapshot = useCallback(() => {
    return window.matchMedia(query).matches;
  }, [query]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
} 