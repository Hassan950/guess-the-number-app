import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../context/useAuth'
import { fetchProfile, startGame, submitGuess } from '../game'
import type { GuessOutcome } from '../types'

export function DashboardPage() {
  const { user, logout } = useAuth()

  const [bestGuessCount, setBestGuessCount] = useState<number | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)

  const [roundId, setRoundId] = useState<number | null>(null)
  const [guessCount, setGuessCount] = useState(0)
  const [guessValue, setGuessValue] = useState('')
  const [outcome, setOutcome] = useState<GuessOutcome | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProfile()
      .then((profile) => setBestGuessCount(profile.bestGuessCount))
      .catch(() => setError('Could not load your profile.'))
      .finally(() => setLoadingProfile(false))
  }, [])

  async function handleNewGame() {
    setError(null)
    try {
      const { roundId: newRoundId } = await startGame()
      setRoundId(newRoundId)
      setGuessCount(0)
      setGuessValue('')
      setOutcome(null)
    } catch {
      setError('Could not start a new game.')
    }
  }

  async function handleGuess(e: FormEvent) {
    e.preventDefault()
    if (roundId === null) return

    setSubmitting(true)
    setError(null)
    try {
      const result = await submitGuess(roundId, Number(guessValue))
      setGuessCount(result.guessCount)
      setOutcome(result.outcome)
      if (result.outcome === 'Correct' && result.bestGuessCount !== null) {
        setBestGuessCount(result.bestGuessCount)
      }
      setGuessValue('')
    } catch {
      setError('Could not submit your guess.')
    } finally {
      setSubmitting(false)
    }
  }

  const won = outcome === 'Correct'

  return (
    <div className="page">
      <header className="page-header">
        <span>{user?.email}</span>
        <button type="button" onClick={logout}>
          Log out
        </button>
      </header>

      <section className="best-score">
        {loadingProfile ? (
          <p>Loading your best score...</p>
        ) : (
          <p>Best so far: {bestGuessCount !== null ? `${bestGuessCount} guesses` : 'no wins yet'}</p>
        )}
      </section>

      {roundId === null ? (
        <button type="button" onClick={handleNewGame}>
          New Game
        </button>
      ) : won ? (
        <div className="win-banner">
          <p>You got it in {guessCount} {guessCount === 1 ? 'guess' : 'guesses'}!</p>
          <button type="button" onClick={handleNewGame}>
            Play again
          </button>
        </div>
      ) : (
        <form className="guess-form" onSubmit={handleGuess}>
          <p>Guess a number between 1 and 43</p>
          <input
            type="number"
            min={1}
            max={43}
            value={guessValue}
            onChange={(e) => setGuessValue(e.target.value)}
            required
          />
          <button type="submit" disabled={submitting}>
            Guess
          </button>
          <p>Guesses so far: {guessCount}</p>
          {outcome && <p className="hint">Go {outcome.toLowerCase()}!</p>}
        </form>
      )}

      {error && <p className="form-error">{error}</p>}
    </div>
  )
}
