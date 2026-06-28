/**
 * SaveStateManager.ts
 *
 * Middleware for persisting WebAssembly emulation core memory snapshots
 * into the browser's IndexedDB. This allows for cross-session progression
 * in legacy N64/GameCube titles.
 */

export interface SaveState {
  gameId: string;
  timestamp: number;
  data: Uint8Array;
}

export class SaveStateManager {
  private readonly DB_NAME = 'MarioPartyWebEngine';
  private readonly STORE_NAME = 'SaveStates';
  private readonly DB_VERSION = 1;

  constructor() {
    this.initDatabase();
  }

  /**
   * Initializes the IndexedDB instance for the emulation hypervisor.
   */
  private initDatabase(): void {
    if (typeof window === 'undefined' || !window.indexedDB) return;

    const request = window.indexedDB.open(this.DB_NAME, this.DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(this.STORE_NAME)) {
        db.createObjectStore(this.STORE_NAME, { keyPath: 'gameId' });
      }
    };

    request.onerror = () => {
      console.error('SaveStateManager: Failed to initialize IndexedDB.');
    };
  }

  private async getDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(this.DB_NAME, this.DB_VERSION);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Stores a binary memory snapshot extracted from the WASM emulator.
   */
  public async saveState(gameId: string, memorySnapshot: Uint8Array): Promise<void> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);

      const state: SaveState = {
        gameId,
        timestamp: Date.now(),
        data: memorySnapshot
      };

      store.put(state);

      return new Promise((resolve, reject) => {
        transaction.oncomplete = () => {
          console.log(`SaveStateManager: Successfully persisted save state for ${gameId}.`);
          resolve();
        };
        transaction.onerror = () => reject(transaction.error);
      });
    } catch (e) {
      console.error(`SaveStateManager: Error saving state for ${gameId}`, e);
    }
  }

  /**
   * Retrieves a previously stored binary memory snapshot.
   */
  public async loadState(gameId: string): Promise<Uint8Array | null> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.get(gameId);

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          const result = request.result as SaveState;
          if (result) {
            console.log(`SaveStateManager: Successfully loaded save state for ${gameId}.`);
            resolve(result.data);
          } else {
            console.log(`SaveStateManager: No save state found for ${gameId}.`);
            resolve(null);
          }
        };
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.error(`SaveStateManager: Error loading state for ${gameId}`, e);
      return null;
    }
  }
}
