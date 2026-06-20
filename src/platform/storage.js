/** localStorage-backed StoragePort. Fails soft if storage is unavailable. */
export const LocalStorageAdapter = {
    read(key) {
        try {
            return localStorage.getItem(key);
        }
        catch {
            return null;
        }
    },
    write(key, value) {
        try {
            localStorage.setItem(key, value);
        }
        catch {
            /* ignore quota / unavailable storage */
        }
    },
};
/** In-memory StoragePort for tests and SSR-less fallback. */
export function createMemoryStorage(initial = {}) {
    const map = new Map(Object.entries(initial));
    return {
        read: (key) => (map.has(key) ? map.get(key) : null),
        write: (key, value) => {
            map.set(key, value);
        },
    };
}
