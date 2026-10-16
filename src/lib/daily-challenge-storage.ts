export const DAILY_CHALLENGE_ATTEMPTS_KEY = 'daily-challenge-first-attempts'

export interface DailyChallengeAttempt {
  completedAt: number
  maxScore: number
  score: number
}

export type DailyChallengeAttempts = Record<string, DailyChallengeAttempt>
