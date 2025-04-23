import type { TypingScore } from '~/types'

export function useSyncScores() {
  const { getUnsyncedScores, markAsSynced } = useIndexedDB()
  const { saveScore } = useSupabaseDB()
  const user = useSupabaseUser()
  
  const isSyncing = ref(false)
  const lastSyncTime = ref<Date | null>(null)
  const syncError = ref<string | null>(null)

  // Sync a single new score
  const syncNewScore = async (score: TypingScore) => {
    if (!navigator.onLine) return false
    
    try {
      isSyncing.value = true
      syncError.value = null
      
      // Add user ID if logged in
      if (user.value?.id) {
        score.userId = user.value.id
      }
      
      await saveScore({
        wpm: score.wpm,
        accuracy: score.accuracy,
        date: score.date,
        wordCount: score.wordCount,
        duration: score.duration,
        userId: score.userId
      })
      
      // Mark as synced in IndexedDB
      if (score.id) {
        await markAsSynced([score.id])
      }
      
      lastSyncTime.value = new Date()
      return true
    } catch (error: any) {
      syncError.value = error.message || 'Failed to sync score'
      return false
    } finally {
      isSyncing.value = false
    }
  }

  // Sync all unsynced scores
  const syncAllScores = async () => {
    if (!navigator.onLine) return false
    
    try {
      isSyncing.value = true
      syncError.value = null
      
      const unsyncedScores = await getUnsyncedScores()
      if (unsyncedScores.length === 0) {
        lastSyncTime.value = new Date()
        return true
      }
      
      const syncedIds: number[] = []
      
      for (const score of unsyncedScores) {
        try {
          // Add user ID if logged in
          if (user.value?.id) {
            score.userId = user.value.id
          }
          
          await saveScore({
            wpm: score.wpm,
            accuracy: score.accuracy,
            date: score.date,
            wordCount: score.wordCount,
            duration: score.duration,
            userId: score.userId
          })
          
          if (score.id) {
            syncedIds.push(score.id)
          }
        } catch (error) {
          console.error('Error syncing score:', error)
        }
      }
      
      // Mark synced scores in IndexedDB
      if (syncedIds.length > 0) {
        await markAsSynced(syncedIds)
      }
      
      lastSyncTime.value = new Date()
      return syncedIds.length === unsyncedScores.length
    } catch (error: any) {
      syncError.value = error.message || 'Failed to sync scores'
      return false
    } finally {
      isSyncing.value = false
    }
  }

  // Setup online/offline listeners to sync when connection is restored
  onMounted(() => {
    if (process.client) {
      window.addEventListener('online', () => {
        syncAllScores()
      })
    }
  })

  onUnmounted(() => {
    if (process.client) {
      window.removeEventListener('online', () => {
        syncAllScores()
      })
    }
  })

  return {
    syncNewScore,
    syncAllScores,
    isSyncing,
    lastSyncTime,
    syncError
  }
}
