import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { Button } from '@/components/ui/button'

const steps: [string, string][] = [
  ['1. Guess', 'Pick any number from 1 to 43.'],
  ['2. Adjust', 'Get a higher or lower hint after each try.'],
  ['3. Record', 'Win in fewer guesses to set a new personal best.'],
]

export function LandingPage() {
  const { user } = useAuth()

  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-background px-4 py-16 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
        A tiny guessing game
      </p>
      <h1 className="mt-4 max-w-2xl text-5xl font-bold tracking-tight text-foreground">
        Can you find the number between 1 and 43?
      </h1>
      <p className="mt-4 max-w-lg text-muted-foreground">
        Every round hides a secret number. Each wrong guess tells you whether to go higher or
        lower. Your lowest number of guesses is saved to your account, so you always know the
        record to beat.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {user ? (
          <Button size="lg" asChild>
            <Link to="/game">Play now</Link>
          </Button>
        ) : (
          <>
            <Button size="lg" asChild>
              <Link to="/register">Sign up to play</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
          </>
        )}
      </div>

      <ol className="mt-14 grid max-w-3xl gap-4 text-left sm:grid-cols-3">
        {steps.map(([title, body]) => (
          <li key={title} className="rounded-xl border border-border bg-card p-4">
            <h2 className="font-semibold text-card-foreground">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{body}</p>
          </li>
        ))}
      </ol>
    </main>
  )
}
