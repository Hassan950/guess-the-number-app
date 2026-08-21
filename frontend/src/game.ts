import { api } from './api'
import type { GuessResponse, StartRoundResponse, UserProfile } from './types'

export async function fetchProfile(): Promise<UserProfile> {
  const { data } = await api.get<UserProfile>('/api/users/me')
  return data
}

export async function startGame(): Promise<StartRoundResponse> {
  const { data } = await api.post<StartRoundResponse>('/api/game/start')
  return data
}

export async function submitGuess(roundId: number, guess: number): Promise<GuessResponse> {
  const { data } = await api.post<GuessResponse>('/api/game/guess', { roundId, guess })
  return data
}
