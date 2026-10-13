import { NavLink, Outlet } from 'react-router-dom'
import { ArrowLeft, ChartNoAxesCombined, ClipboardList, MessageSquareText, Users } from 'lucide-react'

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: ChartNoAxesCombined, end: true },
  { to: '/admin/users', label: 'Users', icon: Users, end: false },
  { to: '/admin/predictions', label: 'Predictions', icon: ClipboardList, end: false },
  { to: '/admin/feedback', label: 'Feedback', icon: MessageSquareText, end: false },
]

export function AdminLayout() {
  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:px-8 lg:py-8">
      <aside className="w-full shrink-0 lg:w-60">
        <div className="rounded-[1.5rem] border border-border bg-surface p-4 lg:sticky lg:top-6">
          <p className="px-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted">Administration</p>
          <nav aria-label="Admin navigation" className="mt-3 grid grid-cols-2 gap-1 sm:grid-cols-4 lg:grid-cols-1">
            {adminLinks.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex min-h-10 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
                    isActive ? 'bg-accent/10 text-accent' : 'text-muted hover:bg-background hover:text-foreground'
                  }`
                }
              >
                <Icon aria-hidden="true" className="size-4 shrink-0" />
                {label}
              </NavLink>
            ))}
          </nav>
          <NavLink
            to="/"
            className="mt-4 flex min-h-10 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted transition hover:bg-background hover:text-foreground"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Back to app
          </NavLink>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  )
}
