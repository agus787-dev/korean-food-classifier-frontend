import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import { useAuth } from '../auth/useAuth'

interface AuthFormProps {
  mode: 'login' | 'register'
}

function getReturnTo(state: unknown, searchValue: string | null): string {
  if (typeof state === 'object' && state !== null && 'from' in state) {
    const from = state.from
    if (
      typeof from === 'object' &&
      from !== null &&
      'pathname' in from &&
      typeof from.pathname === 'string' &&
      from.pathname.startsWith('/') &&
      !from.pathname.startsWith('//')
    ) {
      const search = 'search' in from && typeof from.search === 'string' ? from.search : ''
      const hash = 'hash' in from && typeof from.hash === 'string' ? from.hash : ''
      return `${from.pathname}${search}${hash}`
    }
  }

  if (searchValue?.startsWith('/') && !searchValue.startsWith('//')) return searchValue
  return '/predict'
}

function AuthForm({ mode }: AuthFormProps) {
  const isRegister = mode === 'register'
  const { login, register } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const returnTo = getReturnTo(location.state, searchParams.get('returnTo'))

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const normalizedEmail = email.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError('Enter a valid email address.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (isRegister && !displayName.trim()) {
      setError('Enter your display name.')
      return
    }

    setSubmitting(true)
    try {
      if (isRegister) {
        await register({ email: normalizedEmail, password, displayName: displayName.trim() })
      } else {
        await login(normalizedEmail, password)
      }
      navigate(returnTo, { replace: true })
    } catch (reason) {
      setError(
        reason instanceof ApiError
          ? reason.message
          : 'Something went wrong. Please try again.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'mt-2 min-h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted/70 focus-visible:border-accent'

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 items-center justify-center px-5 py-12 sm:px-8 sm:py-16">
      <section className="w-full max-w-md rounded-[1.75rem] border border-border bg-surface p-6 shadow-[0_16px_50px_rgba(64,47,29,0.07)] sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
          Hansik account
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {isRegister ? 'Create your account' : 'Welcome back'}
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          {isRegister
            ? 'Save your food predictions and revisit them anytime.'
            : 'Sign in to classify a photo and view your history.'}
        </p>

        <form className="mt-7 space-y-5" onSubmit={(event) => void handleSubmit(event)} noValidate>
          {isRegister && (
            <div>
              <label htmlFor="display-name" className="text-sm font-semibold">
                Display name
              </label>
              <input
                id="display-name"
                name="displayName"
                type="text"
                autoComplete="name"
                required
                maxLength={80}
                value={displayName}
                onChange={(event) => setDisplayName(event.currentTarget.value)}
                aria-invalid={Boolean(error && !displayName.trim())}
                className={inputClass}
              />
            </div>
          )}
          <div>
            <label htmlFor="email" className="text-sm font-semibold">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              value={email}
              onChange={(event) => setEmail(event.currentTarget.value)}
              aria-invalid={Boolean(error && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-semibold">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.currentTarget.value)}
              aria-invalid={Boolean(error && password.length < 8)}
              className={inputClass}
            />
          </div>

          {error && (
            <p
              className="rounded-xl border border-accent/25 bg-accent/5 px-4 py-3 text-sm leading-6 text-accent-strong"
              role="alert"
              aria-live="assertive"
            >
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong disabled:cursor-wait disabled:opacity-60"
          >
            {submitting ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          {isRegister ? 'Already have an account?' : 'New to Hansik?'}{' '}
          <Link
            to={isRegister ? '/login' : '/register'}
            state={{ from: location.state && 'from' in location.state ? location.state.from : undefined }}
            className="font-semibold text-accent hover:text-accent-strong"
          >
            {isRegister ? 'Sign in' : 'Create an account'}
          </Link>
        </p>
      </section>
    </main>
  )
}

export function LoginPage() {
  return <AuthForm mode="login" />
}

export function RegisterPage() {
  return <AuthForm mode="register" />
}
