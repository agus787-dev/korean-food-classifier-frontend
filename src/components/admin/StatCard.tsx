import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string
  hint?: string
  icon: ReactNode
}

export function StatCard({ label, value, hint, icon }: StatCardProps) {
  return (
    <article className="rounded-2xl border border-border bg-surface p-5 shadow-[0_8px_24px_rgba(64,47,29,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted">{label}</p>
        <span className="flex size-9 items-center justify-center rounded-xl bg-accent/10 text-accent">{icon}</span>
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </article>
  )
}
