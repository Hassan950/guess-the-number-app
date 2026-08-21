import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../context/useAuth';
import { fetchProfile, startGame, submitGuess } from '../game';
import type { GuessOutcome } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Attempt = { value: number; outcome: GuessOutcome };

export function GamePage() {
  const { logout } = useAuth();

  const [bestGuessCount, setBestGuessCount] = useState<number | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [roundId, setRoundId] = useState<number | null>(null);
  const [guessValue, setGuessValue] = useState('');
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justRecorded, setJustRecorded] = useState(false);

  useEffect(() => {
    fetchProfile()
      .then((profile) => setBestGuessCount(profile.bestGuessCount))
      .catch(() => setError('Could not load your profile.'))
      .finally(() => setLoadingProfile(false));
  }, []);

  async function handleNewGame() {
    setError(null);
    try {
      const { roundId: newRoundId } = await startGame();
      setRoundId(newRoundId);
      setGuessValue('');
      setAttempts([]);
      setJustRecorded(false);
      return newRoundId;
    } catch {
      throw new Error('Could not start a new game.');
    }
  }

  async function handleGuess(e: FormEvent) {
    e.preventDefault();
    if (won) return;

    const value = Number(guessValue);
    if (!Number.isInteger(value) || value < 1 || value > 43) {
      setError('Enter a whole number between 1 and 43.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const currentRoundId = roundId ?? (await handleNewGame());
      const result = await submitGuess(currentRoundId, value);
      setAttempts((prev) => [...prev, { value, outcome: result.outcome }]);
      setGuessValue('');
      if (result.outcome === 'Correct') {
        setJustRecorded(bestGuessCount === null || result.guessCount <= bestGuessCount);
        if (result.bestGuessCount !== null) {
          setBestGuessCount(result.bestGuessCount);
        }
      }
    } catch {
      setError('Could not submit your guess.');
    } finally {
      setSubmitting(false);
    }
  }

  const last = attempts[attempts.length - 1];
  const won = last?.outcome === 'Correct';

  return (
    <div className='min-h-svh bg-background'>
      <header className='border-b border-border'>
        <div className='mx-auto flex max-w-3xl items-center justify-between px-4 py-4'>
          <span className='text-lg font-bold tracking-tight text-foreground'>Guess 43</span>
          <Button variant='ghost' size='sm' onClick={logout}>
            Sign out
          </Button>
        </div>
      </header>

      <main className='mx-auto max-w-3xl px-4 py-10'>
        <section className='rounded-2xl border border-border bg-card p-5'>
          {loadingProfile ? (
            <p className='text-sm text-muted-foreground'>Loading your record...</p>
          ) : bestGuessCount !== null ? (
            <p className='text-sm text-muted-foreground'>
              Your best so far:{' '}
              <span className='text-2xl font-bold text-primary'>{bestGuessCount}</span>{' '}
              {bestGuessCount === 1 ? 'guess' : 'guesses'}
            </p>
          ) : (
            <p className='text-sm text-muted-foreground'>
              No record yet — win a round to set your first best score.
            </p>
          )}
        </section>

        <section className='mt-6 rounded-2xl border border-border bg-card p-8 text-center'>
          <h1 className='text-3xl font-bold tracking-tight text-card-foreground'>
            I'm thinking of a number between 1 and 43
          </h1>

          <p className='mt-6 min-h-16 text-xl font-medium'>
            {won ? (
              <span className='text-primary'>
                Correct! You got it in {attempts.length}{' '}
                {attempts.length === 1 ? 'guess' : 'guesses'}.
                {justRecorded ? " That's a new personal best!" : ''}
              </span>
            ) : last ? (
              <span className='text-foreground'>
                {last.value} is too {last.outcome === 'Higher' ? 'low' : 'high'} — guess{' '}
                <strong>{last.outcome === 'Higher' ? 'higher' : 'lower'}</strong>.
              </span>
            ) : (
              <span className='text-muted-foreground'>Make your first guess.</span>
            )}
          </p>

          <form onSubmit={handleGuess} className='mx-auto mt-4 flex max-w-xs gap-2'>
            <Input
              type='number'
              min={1}
              max={43}
              inputMode='numeric'
              autoFocus
              value={guessValue}
              disabled={won}
              onChange={(e) => setGuessValue(e.target.value)}
              placeholder='1 - 43'
              className='text-center'
            />
            <Button type='submit' disabled={won || submitting}>
              Guess
            </Button>
          </form>

          {error && <p className='mt-3 text-sm text-destructive'>{error}</p>}

          <p className='mt-4 text-sm text-muted-foreground'>
            Guesses this round: <strong className='text-foreground'>{attempts.length}</strong>
          </p>

          {attempts.length > 0 && (
            <ul className='mt-4 flex flex-wrap justify-center gap-2'>
              {attempts.map((attempt, index) => (
                <li
                  key={`${attempt.value}-${index}`}
                  className={`rounded-full border px-3 py-1 text-sm ${
                    attempt.outcome === 'Correct'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground'
                  }`}
                >
                  {attempt.value}
                </li>
              ))}
            </ul>
          )}

          <Button variant='outline' className='mt-6' disabled={!roundId} onClick={handleNewGame}>
            {won ? 'Play again' : 'New game'}
          </Button>
        </section>
      </main>
    </div>
  );
}
