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
  
  // Get personal high scores from both local IndexedDB and remote Supabase
  const getPersonalHighScores = async (limit = 5) => {
    loading.value = true
    error.value = null
    
    try {
      const { getUserScores } = useSupabaseDB()
      const { getScores } = useIndexedDB()
      const user = useSupabaseUser()
      const { getAnonymousId } = useIndexedDB()
      const anonymousId = getAnonymousId()
      
      // Get scores from both sources
      const localScores = await getScores();
      let remoteScores = await getUserScores();

      // Create a map to track scores by ID to avoid duplicates
      const scoreMap = new Map<string, TypingScore>()
      
      // Add local scores to the map
      localScores.forEach(score => {
        const key = `local-${score.id}`
        scoreMap.set(key, { ...score, remote: false })
      })
      
      // Add remote scores to the map, avoiding duplicates
      remoteScores.forEach(score => {
        const key = `remote-${score.id}`
        scoreMap.set(key, { ...score, remote: true })
      })
      console.log(Array.from(scoreMap.values()))
      // Convert map to array, filter for current user, sort by WPM, and take top scores
      const personalScores = Array.from(scoreMap.values())
        .filter(score => {
          // Filter to only include scores from this user
          return (user.value && score.userId === user.value.id) || 
                 score.anonymousId === anonymousId || !score.synced
        })
        .sort((a, b) => b.wpm - a.wpm)
        .slice(0, limit)
      return personalScores
    } catch (err: any) {
      console.error(err)
      return []
    } finally {
      loading.value = false
    }
  }
  
  // Get the personal best score (highest WPM)
  const getPersonalHighscore = async (): Promise<TypingScore | null> => {
    loading.value = true
    error.value = null
    
    try {
      const personalScores = await getPersonalHighScores(1)
      return personalScores.length > 0 ? personalScores[0] : null
    } catch (err: any) {
      console.error(err)
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    getCombinedHighScores,
    getPersonalHighScores,
    getPersonalHighscore,
    loading,
    error
  }
}
