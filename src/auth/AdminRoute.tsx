import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'

export function AdminRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <main className="mx-auto flex w-full max-w-7xl flex-1 items-center px-5 py-16 sm:px-8">
        <p className="text-sm text-muted" role="status">Restoring your session…</p>
      </main>
    )
  }
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  if (user.role !== 'admin') {
    return (
      <main className="mx-auto flex w-full max-w-7xl flex-1 items-center px-5 py-16 sm:px-8">
        <section className="w-full rounded-[1.75rem] border border-border bg-surface p-8">
          <h1 className="text-3xl font-semibold">Not authorized</h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            This area is only available to administrators.
          </p>
          <Link to="/" className="mt-6 inline-flex min-h-11 items-center rounded-full bg-accent px-5 text-sm font-semibold text-white">
            Back to the app
          </Link>
        </section>
      </main>
    )
  }

  return <Outlet />
}
