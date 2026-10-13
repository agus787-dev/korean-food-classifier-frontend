import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPredictions } from '../api/predictions'
import { useAuth } from '../auth/useAuth'

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'long' }).format(new Date(value))
}

export function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [predictionTotal, setPredictionTotal] = useState<number | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    void getPredictions(1, 1, controller.signal)
      .then((result) => setPredictionTotal(result.total))
      .catch(() => {
        if (!controller.signal.aborted) setPredictionTotal(null)
      })
    return () => controller.abort()
  }, [])

  if (!user) return null

  function handleLogout() {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-12 sm:px-8 sm:py-16">
      <section className="mx-auto max-w-2xl" aria-labelledby="profile-heading">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Your Hansik</p>
        <h1 id="profile-heading" className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Profile
        </h1>

        <div className="mt-7 rounded-[1.75rem] border border-border bg-surface p-6 shadow-[0_16px_50px_rgba(64,47,29,0.07)] sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
            <div>
              <h2 className="text-2xl font-semibold">{user.displayName}</h2>
              <p className="mt-1 break-all text-sm text-muted">{user.email}</p>
            </div>
            <span className="rounded-full bg-[#eaf0e3] px-3 py-1.5 text-xs font-semibold capitalize text-olive dark:bg-[#303a2a]">
              {user.role}
            </span>
          </div>
          <dl className="grid gap-5 pt-6 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.13em] text-muted">Member since</dt>
              <dd className="mt-1 text-sm font-medium">{formatDate(user.createdAt)}</dd>
            </div>
            {predictionTotal !== null && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.13em] text-muted">Predictions</dt>
                <dd className="mt-1 text-sm font-medium">{predictionTotal}</dd>
              </div>
            )}
          </dl>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-accent transition hover:border-accent/50"
        >
          Sign out
        </button>
      </section>
    </main>
  )
}
