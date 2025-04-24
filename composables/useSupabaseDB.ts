import type { TypingScore } from '~/types'

export function useSupabaseDB() {
  const client = useSupabaseClient()
  const user = useSupabaseUser()

  // Save a score to Supabase
  const saveScore = async (score: Omit<TypingScore, 'id' | 'synced'>) => {
    try {
      const { data, error } = await client
        .from('scores')
        .insert({
          wpm: score.wpm,
          accuracy: score.accuracy,
          date: score.date,
          word_count: score.wordCount,
          duration: score.duration,
          user_id: user.value?.id || null
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
      const { data, error } = await client
        .from('scores')
        .select('*')
        .eq('user_id', user.value?.id)
        .order('date', { ascending: false })

      if (error) throw error
      
      // Convert from snake_case to camelCase for frontend use
      return data.map(score => ({
        id: score.id,
        userId: score.user_id,
        wpm: score.wpm,
        accuracy: score.accuracy,
        date: new Date(score.date),
        wordCount: score.word_count,
        duration: score.duration,
        synced: true
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
      return data
    } catch (error: any) {
      console.error('Error getting leaderboard from Supabase:', error.message)
      return []
    }
  }

  // Claim anonymous scores by updating their user_id
  const claimAnonymousScores = async (scoreIds: number[]) => {
    if (!user.value?.id || scoreIds.length === 0) return

    try {
      const { error } = await client
        .from('scores')
        .update({ user_id: user.value.id })
        .in('id', scoreIds)
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
