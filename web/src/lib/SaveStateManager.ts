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
  universalData?: UniversalGameState;
}

export interface UniversalGameState {
  globalCoins: number;
  globalStars: number;
  unlockedBoards: string[];
  unlockedMinigames: string[];
}

export class SaveStateManager {
  private readonly DB_NAME = 'MarioPartyWebEngine';
  private readonly STORE_NAME = 'SaveStates';
  private readonly DB_VERSION = 2; // Incremented for schema change

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
   * Extracts known universal metrics (coins, stars) from a raw memory buffer
   * using specific hardcoded game offsets to establish cross-game continuity.
   * Note: These offsets will be dynamically mapped as decompilation finishes.
   */
  private extractUniversalState(gameId: string, memory: Uint8Array): UniversalGameState {
      // Mock translation logic based on IDEAS.md concept
      return {
          globalCoins: 100, // TODO: map to actual N64 RDRAM offset for coins
          globalStars: 5,   // TODO: map to actual N64 RDRAM offset for stars
          unlockedBoards: ['Yoshi\'s Tropical Island'],
          unlockedMinigames: ['Bumper Balls']
      };
  }

  /**
   * Stores a binary memory snapshot extracted from the WASM emulator,
   * alongside a translated JSON "Universal State" for cross-game sync.
   */
  public async saveState(gameId: string, memorySnapshot: Uint8Array): Promise<void> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);

      const universalData = this.extractUniversalState(gameId, memorySnapshot);

      const state: SaveState = {
        gameId,
        timestamp: Date.now(),
        data: memorySnapshot,
        universalData
      };

      store.put(state);

      return new Promise((resolve, reject) => {
        transaction.oncomplete = () => {
          console.log(`SaveStateManager: Successfully persisted save state and universal translation for ${gameId}.`);
          resolve();
        };
        transaction.onerror = () => reject(transaction.error);
      });
    } catch (e) {
      console.error(`SaveStateManager: Error saving state for ${gameId}`, e);
    }
  }

  /**
   * Exports a save state to a JSON string for user download.
   */
  public async exportSave(gameId: string): Promise<string | null> {
    const data = await this.loadState(gameId);
    if (!data) return null;
    const universalData = this.extractUniversalState(gameId, data);
    return JSON.stringify({
      gameId,
      timestamp: Date.now(),
      data: Array.from(data),
      universalData
    });
  }

  /**
   * Imports a save state from a JSON string.
   */
  public async importSave(gameId: string, jsonString: string): Promise<boolean> {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.gameId !== gameId || !parsed.data) return false;
      const dataArray = new Uint8Array(parsed.data);
      await this.saveState(gameId, dataArray);
      return true;
    } catch (e) {
      console.error(`SaveStateManager: Error importing save.`, e);
      return false;
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
            if (result.universalData) {
                console.log(`Universal State Context detected: ${result.universalData.globalCoins} Coins transferred.`);
            }
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
