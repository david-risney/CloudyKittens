import type { StoragePort } from '../game/ports.js';

/** localStorage-backed StoragePort. Fails soft if storage is unavailable. */
export const LocalStorageAdapter: StoragePort = {
  read(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  write(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* ignore quota / unavailable storage */
    }
  },
};

/** In-memory StoragePort for tests and SSR-less fallback. */
export function createMemoryStorage(initial: Record<string, string> = {}): StoragePort {
  const map = new Map<string, string>(Object.entries(initial));
  return {
    read: (key) => (map.has(key) ? map.get(key)! : null),
    write: (key, value) => {
      map.set(key, value);
    },
  };
}
