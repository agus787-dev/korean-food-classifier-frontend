import { Link, useLocation } from 'react-router-dom'

interface PlaceholderPageProps {
  title: string
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  const location = useLocation()
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 items-center px-5 py-16 sm:px-8">
      <section className="w-full rounded-[1.75rem] border border-border bg-surface p-7 sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Your Hansik</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
          This page will be connected to your account in the next stage.
        </p>
        <Link
          to="/predict"
          state={{ from: location }}
          className="mt-6 inline-flex min-h-11 items-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-strong"
        >
          Continue to prediction
        </Link>
      </section>
    </main>
  )
}
