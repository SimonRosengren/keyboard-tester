import type { TypingScore } from '~/types'

export function useSupabaseDB() {
  const client = useSupabaseClient()
  const user = useSupabaseUser()

  // Save a score to Supabase
  const saveScore = async (score: Omit<TypingScore, 'id' | 'synced'>) => {
    const { getAnonymousId } = useIndexedDB()
    const anonymousId = getAnonymousId()
    
    try {
      const { data, error } = await client
        .from('scores')
        .insert({
          wpm: score.wpm,
          accuracy: score.accuracy,
          date: score.date,
          word_count: score.wordCount,
          duration: score.duration,
          user_id: user.value?.id || null,
          anonymous_id: anonymousId
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error: any) {
      console.error('Error saving score to Supabase:', error.message)
      throw error
    }
  }

  // Get all scores for the current user
  const getUserScores = async () => {
    try {
      const { getAnonymousId } = useIndexedDB()
      const anonymousId = getAnonymousId()
      
      let query = client
        .from('scores')
        .select('*')
        .order('date', { ascending: false })
      
      // If user is logged in, get their scores by user_id
      // Otherwise get scores by anonymous_id
      if (user.value?.id) {
        query = query.eq('user_id', user.value.id)
      } else if (anonymousId) {
        query = query.eq('anonymous_id', anonymousId)
      } else {
        // No user ID and no anonymous ID, return empty array
        return []
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      // Convert from snake_case to camelCase for frontend use
      return data.map(score => ({
        id: score.id,
        userId: score.user_id,
        anonymousId: score.anonymous_id,
        wpm: score.wpm,
        accuracy: score.accuracy,
        date: new Date(score.date),
        wordCount: score.word_count,
        duration: score.duration,
        synced: true,
        remote: true
      })) as TypingScore[]
    } catch (error: any) {
      console.error('Error getting user scores from Supabase:', error.message)
      return []
    }
  }

  // Get global leaderboard (top scores)
  const getLeaderboard = async (limit = 10) => {
    try {
      const { data, error } = await client
        .from('scores')
        .select('*')
        .order('wpm', { ascending: false })
        .limit(limit)

      if (error) throw error
      
      // Convert from snake_case to camelCase for frontend use
      return data.map(score => ({
        id: score.id,
        userId: score.user_id,
        anonymousId: score.anonymous_id,
        wpm: score.wpm,
        accuracy: score.accuracy,
        date: new Date(score.date),
        wordCount: score.word_count,
        duration: score.duration,
        synced: true,
        remote: true
      })) as TypingScore[]
    } catch (error: any) {
      console.error('Error getting leaderboard from Supabase:', error.message)
      return []
    }
  }

  // Claim anonymous scores by updating their user_id
  const claimAnonymousScores = async () => {
    if (!user.value?.id) return false
    
    const { getAnonymousId } = useIndexedDB()
    const anonymousId = getAnonymousId()

    try {
      const { error } = await client
        .from('scores')
        .update({ user_id: user.value.id })
        .eq('anonymous_id', anonymousId)
        .is('user_id', null)

      if (error) throw error
      return true
    } catch (error: any) {
      console.error('Error claiming anonymous scores:', error.message)
      return false
    }
  }

  return {
    saveScore,
    getUserScores,
    getLeaderboard,
    claimAnonymousScores
  }
}
