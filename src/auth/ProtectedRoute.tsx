import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'

export function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <main className="mx-auto flex w-full max-w-7xl flex-1 items-center px-5 py-16 sm:px-8">
        <p className="text-sm text-muted" role="status">Restoring your session…</p>
      </main>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
