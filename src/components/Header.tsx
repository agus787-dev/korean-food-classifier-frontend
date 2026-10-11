import { CookingPot } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'

export function Header() {
  return (
    <header className="border-b border-border/80">
      <div className="mx-auto flex h-[76px] w-full max-w-7xl items-center justify-between px-5 sm:px-8">
        <a href="#home" className="inline-flex items-center gap-3 rounded-md" aria-label="Hansik home">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-accent text-white shadow-sm">
            <CookingPot aria-hidden="true" className="size-5" strokeWidth={1.8} />
          </span>
          <span>
            <span className="block text-base font-bold leading-tight tracking-tight">hansik</span>
            <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-[0.17em] text-muted">
              food vision
            </span>
          </span>
        </a>
        <div className="flex items-center gap-3">
          <span className="hidden rounded-full border border-border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted sm:inline-flex">
            Interactive demo
          </span>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
