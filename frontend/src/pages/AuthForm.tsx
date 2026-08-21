import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Mode = 'signin' | 'signup'

export function AuthForm({ mode }: { mode: Mode }) {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      if (mode === 'signup') {
        await register(email, password)
      } else {
        await login(email, password)
      }
      navigate('/game')
    } catch {
      setError(
        mode === 'signup'
          ? 'Could not create an account. Password must be at least 6 characters.'
          : 'Could not log in. Check your email and password.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-8 block text-center text-sm text-muted-foreground hover:text-foreground">
          &larr; Guess 43
        </Link>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
          <h1 className="text-2xl font-bold tracking-tight text-card-foreground">
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === 'signin'
              ? 'Sign in to see your best score.'
              : 'Sign up to start tracking your fewest guesses.'}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Please wait...' : mode === 'signin' ? 'Sign in' : 'Sign up'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === 'signin' ? "No account yet?" : 'Already have an account?'}{' '}
            <Link
              to={mode === 'signin' ? '/register' : '/login'}
              className="font-medium text-primary hover:underline"
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
