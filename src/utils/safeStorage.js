/**
 * Safe wrapper for working with localStorage / sessionStorage.
 * Prevents critical errors in Safari Private Browsing and restricted environments.
 */

export const safeStorage = {
  getItem: (key, fallback = null) => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return fallback;
      const val = window.localStorage.getItem(key);
      return val !== null ? val : fallback;
    } catch (e) {
      console.warn(`[safeStorage] Failed to read key "${key}":`, e);
      return fallback;
    }
  },

  setItem: (key, value) => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      window.localStorage.setItem(key, typeof value === 'string' ? value : String(value));
    } catch (e) {
      console.warn(`[safeStorage] Failed to save key "${key}":`, e);
    }
  },

  removeItem: (key) => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      window.localStorage.removeItem(key);
    } catch (e) {
      console.warn(`[safeStorage] Failed to remove key "${key}":`, e);
    }
  }
};

export default safeStorage;
