import { CookingPot } from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { ThemeToggle } from './ThemeToggle'

export function Header() {
  const { user, loading, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/', { replace: true })
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-md px-2 py-1.5 text-sm font-medium transition hover:text-accent ${
      isActive ? 'text-accent' : 'text-muted'
    }`

  return (
    <header className="border-b border-border/80">
      <div className="mx-auto flex min-h-[76px] w-full max-w-7xl flex-wrap items-center justify-between gap-x-5 gap-y-2 px-5 py-3 sm:px-8">
        <Link to="/" className="inline-flex shrink-0 items-center gap-3 rounded-md" aria-label="Hansik home">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-accent text-white shadow-sm">
            <CookingPot aria-hidden="true" className="size-5" strokeWidth={1.8} />
          </span>
          <span>
            <span className="block text-base font-bold leading-tight tracking-tight">hansik</span>
            <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-[0.17em] text-muted">
              food vision
            </span>
          </span>
        </Link>
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-4">
          <nav aria-label="Main navigation" className="flex min-w-0 items-center gap-0.5 sm:gap-2">
            <NavLink to="/" end className={linkClass}>Home</NavLink>
            {user ? (
              <>
                <NavLink to="/predict" className={linkClass}>Predict</NavLink>
                <NavLink to="/history" className={linkClass}>History</NavLink>
                {user.role === 'admin' && <NavLink to="/admin" className={linkClass}>Admin</NavLink>}
                <details className="relative">
                  <summary className="max-w-32 cursor-pointer list-none truncate rounded-md px-2 py-1.5 text-sm font-semibold text-foreground hover:text-accent sm:max-w-44">
                    {user.displayName}
                  </summary>
                  <div className="absolute right-0 z-20 mt-2 w-48 rounded-2xl border border-border bg-surface p-2 shadow-xl">
                    <NavLink to="/profile" className="block rounded-xl px-3 py-2 text-sm font-medium hover:bg-background">
                      Profile
                    </NavLink>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-accent hover:bg-background"
                    >
                      Sign out
                    </button>
                  </div>
                </details>
              </>
            ) : (
              !loading && (
                <>
                  <NavLink to="/login" className={linkClass}>Sign in</NavLink>
                  <NavLink
                    to="/register"
                    className="ml-1 rounded-full bg-accent px-3 py-2 text-xs font-semibold text-white transition hover:bg-accent-strong sm:px-4 sm:text-sm"
                  >
                    Join
                  </NavLink>
                </>
              )
            )}
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
