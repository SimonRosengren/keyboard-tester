import type { TypingScore } from '~/types'

export function useHighScores() {
  const { getAllHighScores } = useIndexedDB()
  const { getLeaderboard } = useSupabaseDB()
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // Get combined high scores from both local IndexedDB and remote Supabase
  const getCombinedHighScores = async (limit = 15) => {
    loading.value = true
    error.value = null
    
    try {
      // Get scores from both sources
      const [localScores, remoteScores] = await Promise.all([
        getAllHighScores(),
        getLeaderboard(limit)
      ])
      
      // Create a map to track scores by ID to avoid duplicates
      const scoreMap = new Map<string, TypingScore>()
      
      // Add remote scores to the map
      remoteScores.forEach(score => {
        const key = `remote-${score.id}`
        scoreMap.set(key, score)
      })
      
      // Add local scores to the map, potentially overwriting remote scores
      // if they have higher WPM (like unsynced improvements)
      localScores.forEach(score => {
        // For synced scores, check if we should replace the remote version
        if (score.synced && score.id) {
          const remoteKey = `remote-${score.id}`
          const remoteScore = scoreMap.get(remoteKey)
          
          // Only replace if the local score is better
          if (remoteScore && score.wpm > remoteScore.wpm) {
            scoreMap.set(remoteKey, { ...score, remote: false })
          }
        } else {
          // For unsynced scores, add them with a local key
          const localKey = `local-${score.id}`
          scoreMap.set(localKey, { ...score, remote: false })
        }
      })
      
      // Convert map to array, sort by WPM, and take top scores
      const combinedScores = Array.from(scoreMap.values())
        .sort((a, b) => b.wpm - a.wpm)
        .slice(0, limit)
      
      return combinedScores
    } catch (err: any) {
      error.value = err.message || 'Failed to load high scores'
      return []
    } finally {
      loading.value = false
    }
  }
  
  return {
    getCombinedHighScores,
    loading,
    error
  }
}
