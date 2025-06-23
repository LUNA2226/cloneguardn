// Utility functions for managing localStorage
export const LocalStorageKeys = {
  SPECIAL_OFFER_SHOWN: 'special_offer_shown',
  USER_PREFERENCES: 'user_preferences',
} as const;

export const localStorage = {
  // Special offer tracking
  hasSpecialOfferBeenShown: (): boolean => {
    try {
      return window.localStorage.getItem(LocalStorageKeys.SPECIAL_OFFER_SHOWN) === 'true';
    } catch {
      return false;
    }
  },

  markSpecialOfferAsShown: (): void => {
    try {
      window.localStorage.setItem(LocalStorageKeys.SPECIAL_OFFER_SHOWN, 'true');
    } catch {
      // Silently fail if localStorage is not available
    }
  },

  resetSpecialOfferFlag: (): void => {
    try {
      window.localStorage.removeItem(LocalStorageKeys.SPECIAL_OFFER_SHOWN);
    } catch {
      // Silently fail if localStorage is not available
    }
  },

  // Generic localStorage utilities
  setItem: (key: string, value: any): void => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Silently fail if localStorage is not available
    }
  },

  getItem: <T>(key: string, defaultValue: T): T => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  removeItem: (key: string): void => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Silently fail if localStorage is not available
    }
  },
};