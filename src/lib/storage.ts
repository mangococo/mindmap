export type StorageKey = 'mindmap-current' | 'mindmap-history';

export interface MindMapHistoryItem {
  id: string;
  data: any;
  timestamp: number;
  title: string;
}

export interface StorageAPI {
  saveCurrentMindMap(data: any): Promise<void>;
  getCurrentMindMap(): Promise<any | null>;
  clearCurrentMindMap(): Promise<void>;
  addToHistory(data: any, title: string): Promise<string>;
  getHistory(): Promise<MindMapHistoryItem[]>;
  deleteFromHistory(id: string): Promise<void>;
  clearHistory(): Promise<void>;
}

class IndexedDBStorage implements StorageAPI {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'MindMapDB';
  private readonly DB_VERSION = 1;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('mindmap')) {
          const store = db.createObjectStore('mindmap', { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.db) {
      await this.init();
    }
  }

  async saveCurrentMindMap(data: any): Promise<void> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction('mindmap', 'readwrite');
      const store = transaction.objectStore('mindmap');

      const item: MindMapHistoryItem = {
        id: 'current',
        data,
        timestamp: Date.now(),
        title: data.root?.text || '未命名画布',
      };

      const request = store.put(item);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getCurrentMindMap(): Promise<any | null> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction('mindmap', 'readonly');
      const store = transaction.objectStore('mindmap');
      const request = store.get('current');

      request.onsuccess = () => {
        const result = request.result as MindMapHistoryItem | undefined;
        resolve(result?.data || null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async clearCurrentMindMap(): Promise<void> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction('mindmap', 'readwrite');
      const store = transaction.objectStore('mindmap');
      const request = store.delete('current');

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async addToHistory(data: any, title: string): Promise<string> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction('mindmap', 'readwrite');
      const store = transaction.objectStore('mindmap');

      const item: MindMapHistoryItem = {
        id: `history-${Date.now()}`,
        data,
        timestamp: Date.now(),
        title: title || data.root?.text || '未命名画布',
      };

      const request = store.add(item);

      request.onsuccess = () => resolve(item.id);
      request.onerror = () => reject(request.error);
    });
  }

  async getHistory(): Promise<MindMapHistoryItem[]> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction('mindmap', 'readonly');
      const store = transaction.objectStore('mindmap');
      const index = store.index('timestamp');
      const request = index.getAll();

      request.onsuccess = () => {
        let results = request.result as MindMapHistoryItem[];
        results = results.filter(item => item.id.startsWith('history-'));
        results.sort((a, b) => b.timestamp - a.timestamp);
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteFromHistory(id: string): Promise<void> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction('mindmap', 'readwrite');
      const store = transaction.objectStore('mindmap');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearHistory(): Promise<void> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction('mindmap', 'readwrite');
      const store = transaction.objectStore('mindmap');
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

let storageInstance: StorageAPI | null = null;

export function getStorage(): StorageAPI {
  if (!storageInstance) {
    storageInstance = new IndexedDBStorage();
  }
  return storageInstance;
}
