import { isNone } from './core';
import { InvertedIndex, Serializable } from '../search/inverted-index';

export type StorageConfig = {
  storageKey?: string;
};

export type SaveConfig = { ttl?: number };

export type Storage = {
  isSaved: () => boolean;
  getKey: () => string;
  save: (arg0?: SaveConfig) => Promise<boolean>;
  load: () => Promise<boolean>;
  clear: () => Promise<void>;
};

const DEFAULT_STORAGE_KEY = 'lofi-dx:index';

/**
 * Local storage support for an InvertedIndex instance.
 */
export function createStorage(
  index: InvertedIndex,
  config: StorageConfig = {}
) {
  const storageKey = config.storageKey || DEFAULT_STORAGE_KEY;

  function getKey() {
    return storageKey;
  }

  function isSaved(): boolean {
    return Boolean(localStorage.getItem(storageKey));
  }

  // Saves a snapshot of the index and its documents locally.
  function save({ ttl = 0 } = {}): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        const item = { expiry: Date.now() + ttl, value: index.toJSON() };
        localStorage.setItem(storageKey, JSON.stringify(item));
        resolve(true);
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  }

  // Sets a previously stored index and its documents.
  function load(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const itemStr = localStorage.getItem(storageKey);

      if (!itemStr) {
        resolve(false);
        return;
      }

      try {
        const item = JSON.parse(itemStr) as {
          expiry: number;
          value: Serializable;
        };

        index.loadFromStorage(item.value || item);

        // Invalidate if it's non-expirable, or expired
        if (isNone(item.expiry) || Date.now() > item.expiry) {
          localStorage.removeItem(storageKey);
        }

        resolve(true);
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  }

  // Clears stored index and its documents.
  function clear(): Promise<void> {
    return new Promise((resolve) => {
      localStorage.removeItem(storageKey);
      resolve();
    });
  }

  // Public API
  return { isSaved, getKey, save, load, clear };
}
