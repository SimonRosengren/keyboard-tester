import { ref, onMounted } from 'vue';
import type { TypingScore } from '~/types';

export function useIndexedDB() {
  const db = ref<IDBDatabase | null>(null);
  const isReady = ref(false);
  const error = ref<string | null>(null);

  // Initialize the database
  const initDB = () => {
    return new Promise<void>((resolve, reject) => {
      if (!process.client) {
        reject('IndexedDB is only available in the browser');
        return;
      }

      const request = indexedDB.open('typingTestDB', 1);

      request.onerror = (event) => {
        error.value = 'Failed to open database';
        reject('Failed to open database');
      };

      request.onsuccess = (event) => {
        db.value = request.result;
        isReady.value = true;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = request.result;
        
        // Create scores store with auto-incrementing id
        if (!db.objectStoreNames.contains('scores')) {
          const store = db.createObjectStore('scores', { keyPath: 'id', autoIncrement: true });
          store.createIndex('date', 'date', { unique: false });
          store.createIndex('wpm', 'wpm', { unique: false });
          store.createIndex('synced', 'synced', { unique: false });
          store.createIndex('userId', 'userId', { unique: false });
        }
      };
    });
  };

  // Save a new score
  const saveScore = async (score: Omit<TypingScore, 'id'>) => {
    if (!db.value) {
      await initDB();
    }

    return new Promise<number>((resolve, reject) => {
      if (!db.value) {
        reject('Database not initialized');
        return;
      }

      const transaction = db.value.transaction(['scores'], 'readwrite');
      const store = transaction.objectStore('scores');
      const request = store.add(score);

      request.onsuccess = () => {
        resolve(request.result as number);
      };

      request.onerror = () => {
        reject('Error saving score');
      };
    });
  };

  // Get all scores
  const getScores = async () => {
    if (!db.value) {
      await initDB();
    }

    return new Promise<TypingScore[]>((resolve, reject) => {
      if (!db.value) {
        reject('Database not initialized');
        return;
      }

      const transaction = db.value.transaction(['scores'], 'readonly');
      const store = transaction.objectStore('scores');
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject('Error getting scores');
      };
    });
  };

  // Get highest score
  const getHighestScore = async () => {
    if (!db.value) {
      await initDB();
    }

    return new Promise<TypingScore | null>((resolve, reject) => {
      if (!db.value) {
        reject('Database not initialized');
        return;
      }

      const transaction = db.value.transaction(['scores'], 'readonly');
      const store = transaction.objectStore('scores');
      const index = store.index('wpm');
      const request = index.openCursor(null, 'prev');

      request.onsuccess = (event) => {
        const cursor = request.result;
        if (cursor) {
          resolve(cursor.value);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        reject('Error getting highest score');
      };
    });
  };

  // Get unsynchronized scores
  const getUnsyncedScores = async () => {
    if (!db.value) {
      await initDB();
    }

    return new Promise<TypingScore[]>((resolve, reject) => {
      if (!db.value) {
        reject('Database not initialized');
        return;
      }

      const transaction = db.value.transaction(['scores'], 'readonly');
      const store = transaction.objectStore('scores');
      const index = store.index('synced');
      const request = index.getAll(IDBKeyRange.only(false));

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject('Error getting unsynced scores');
      };
    });
  };

  // Mark scores as synced
  const markAsSynced = async (ids: number[]) => {
    if (!db.value) {
      await initDB();
    }

    return new Promise<void>((resolve, reject) => {
      if (!db.value) {
        reject('Database not initialized');
        return;
      }

      const transaction = db.value.transaction(['scores'], 'readwrite');
      const store = transaction.objectStore('scores');
      
      let completed = 0;
      let errors = 0;

      ids.forEach(id => {
        const getRequest = store.get(id);
        
        getRequest.onsuccess = () => {
          const score = getRequest.result;
          if (score) {
            score.synced = true;
            const updateRequest = store.put(score);
            
            updateRequest.onsuccess = () => {
              completed++;
              if (completed + errors === ids.length) {
                if (errors === 0) {
                  resolve();
                } else {
                  reject(`${errors} errors occurred while marking scores as synced`);
                }
              }
            };
            
            updateRequest.onerror = () => {
              errors++;
              if (completed + errors === ids.length) {
                reject(`${errors} errors occurred while marking scores as synced`);
              }
            };
          } else {
            errors++;
            if (completed + errors === ids.length) {
              reject(`${errors} errors occurred while marking scores as synced`);
            }
          }
        };
        
        getRequest.onerror = () => {
          errors++;
          if (completed + errors === ids.length) {
            reject(`${errors} errors occurred while marking scores as synced`);
          }
        };
      });
    });
  };

  // Update user ID for scores (for when a user logs in)
  const updateUserIdForScores = async (userId: string) => {
    if (!db.value) {
      await initDB();
    }

    return new Promise<number>((resolve, reject) => {
      if (!db.value) {
        reject('Database not initialized');
        return;
      }

      const transaction = db.value.transaction(['scores'], 'readwrite');
      const store = transaction.objectStore('scores');
      const request = store.getAll();
      
      request.onsuccess = () => {
        const scores = request.result;
        const anonymousScores = scores.filter(score => !score.userId);
        let updated = 0;
        
        if (anonymousScores.length === 0) {
          resolve(0);
          return;
        }
        
        const updateTransaction = db.value!.transaction(['scores'], 'readwrite');
        const updateStore = updateTransaction.objectStore('scores');
        
        anonymousScores.forEach(score => {
          score.userId = userId;
          score.synced = false; // Mark for re-sync with new userId
          const updateRequest = updateStore.put(score);
          
          updateRequest.onsuccess = () => {
            updated++;
            if (updated === anonymousScores.length) {
              resolve(updated);
            }
          };
          
          updateRequest.onerror = () => {
            reject('Error updating user ID for scores');
          };
        });
      };
      
      request.onerror = () => {
        reject('Error getting scores to update user ID');
      };
    });
  };

  // Register lifecycle hooks before any async operations
  let initialized = false;
  
  if (process.client) {
    onMounted(() => {
      if (!initialized) {
        initDB();
        initialized = true;
      }
    });
  }

  const getAnonymousId = () => {
    if (!process.client) return '';
    
    // Check if we already have an anonymous ID in localStorage
    let anonymousId = localStorage.getItem('anonymousId');
    
    // If not, create a new one and store it
    if (!anonymousId) {
      anonymousId = crypto.randomUUID();
      localStorage.setItem('anonymousId', anonymousId);
    }
    
    return anonymousId;
  }

  return {
    isReady,
    error,
    saveScore,
    getScores,
    getHighestScore,
    getAnonymousId,
    getUnsyncedScores,
    markAsSynced,
    updateUserIdForScores
  };
}
