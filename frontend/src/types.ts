export type GuessOutcome = 'Higher' | 'Lower' | 'Correct'

export interface UserProfile {
  id: number
  email: string
  displayName: string | null
  bestGuessCount: number | null
}

export interface StartRoundResponse {
  roundId: number
}

export interface GuessResponse {
  outcome: GuessOutcome
  guessCount: number
  bestGuessCount: number | null
}
