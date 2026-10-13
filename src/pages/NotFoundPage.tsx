import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 items-center px-5 py-16 sm:px-8">
      <section className="w-full rounded-[1.75rem] border border-border bg-surface p-7 sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">404 · Not found</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">This page isn&apos;t on the menu.</h1>
        <p className="mt-3 text-sm leading-6 text-muted">The page may have moved or the address may be incorrect.</p>
        <Link
          to="/"
          className="mt-6 inline-flex min-h-11 items-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-strong"
        >
          Back to home
        </Link>
      </section>
    </main>
  )
}
