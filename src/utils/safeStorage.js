/**
 * Безопасная обёртка для работы с localStorage / sessionStorage.
 * Предотвращает критические ошибки в Safari Private Browsing и средах с ограниченными правами.
 */

export const safeStorage = {
  getItem: (key, fallback = null) => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return fallback;
      const val = window.localStorage.getItem(key);
      return val !== null ? val : fallback;
    } catch (e) {
      console.warn(`[safeStorage] Не удалось прочитать ключ "${key}":`, e);
      return fallback;
    }
  },

  setItem: (key, value) => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      window.localStorage.setItem(key, typeof value === 'string' ? value : String(value));
    } catch (e) {
      console.warn(`[safeStorage] Не удалось сохранить ключ "${key}":`, e);
    }
  },

  removeItem: (key) => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      window.localStorage.removeItem(key);
    } catch (e) {
      console.warn(`[safeStorage] Не удалось удалить ключ "${key}":`, e);
    }
  }
};

export default safeStorage;
