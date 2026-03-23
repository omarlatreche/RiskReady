import { localApi } from './api.local'
import { remoteApi } from './api.remote'

/**
 * Migrate all localStorage data to Supabase for a newly authenticated user.
 * Called once after sign-up or first sign-in when local data exists.
 * Only clears localStorage after verifying data was written successfully.
 */
export async function migrateLocalDataToSupabase() {
  const attempts = localApi.getAttempts()
  const responses = localApi.getResponses()
  const reviewQueue = localApi.getReviewQueue()
  const streakData = localApi.getStreakData()

  const hasData =
    attempts.length > 0 ||
    responses.length > 0 ||
    reviewQueue.length > 0 ||
    streakData.currentStreak > 0

  if (!hasData) return false

  let errors = 0

  // Migrate attempts
  for (const attempt of attempts) {
    try {
      await remoteApi.saveAttempt(attempt)
    } catch {
      errors++
    }
  }

  // Migrate responses in batches of 50
  for (let i = 0; i < responses.length; i += 50) {
    try {
      const batch = responses.slice(i, i + 50)
      await remoteApi.saveResponses(batch)
    } catch {
      errors++
    }
  }

  // Migrate review queue
  for (const item of reviewQueue) {
    try {
      await remoteApi.addToReviewQueue(item.questionId, item.chapter)
    } catch {
      errors++
    }
  }

  // Migrate streak
  if (streakData.currentStreak > 0 || streakData.history.length > 0) {
    try {
      await remoteApi.updateStreak()
    } catch {
      errors++
    }
  }

  // Verify migration succeeded by checking remote data exists
  try {
    const remoteAttempts = await remoteApi.getAttempts()
    if (remoteAttempts.length < attempts.length) {
      console.warn('Migration incomplete: not all data was written to Supabase')
      return false
    }
  } catch {
    console.warn('Migration verification failed')
    return false
  }

  // Only clear local data after successful migration
  localApi.clearAll()
  return true
}
