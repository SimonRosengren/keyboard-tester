import type { TypingScore } from '~/types'

export function useHighScores() {
  const { getHighestScore } = useIndexedDB()
  const { getLeaderboard } = useSupabaseDB()
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // Get combined high scores from both local IndexedDB and remote Supabase
  const getCombinedHighScores = async (limit = 15) => {
    loading.value = true
    error.value = null
    
    try {
      // Get scores from both sources
      const [localScore, remoteScores] = await Promise.all([
        getHighestScore(),
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
      // For synced scores, check if we should replace the remote version
      if (localScore?.synced && localScore?.id) {
        const remoteKey = `remote-${localScore?.id}`
        const remoteScore = scoreMap.get(remoteKey)
        // Only replace if the local score is better
        if (remoteScore && localScore.wpm > remoteScore.wpm) {
          scoreMap.set(remoteKey, { ...localScore, remote: false })
        }
      } else if (localScore?.id && !localScore?.synced) {
        // For unsynced scores, add them with a local key
        const localKey = `local-${localScore.id}`
        scoreMap.set(localKey, { ...localScore, remote: false })
      }
      // Convert map to array, sort by WPM, and take top scores
      const combinedScores = Array.from(scoreMap.values())
        .sort((a, b) => b.wpm - a.wpm)
        .slice(0, limit)
      return combinedScores
    } catch (err: any) {
      console.error(err)
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
