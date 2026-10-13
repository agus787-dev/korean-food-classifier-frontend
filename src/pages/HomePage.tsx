import { ArrowRight, CookingPot, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-5 sm:px-8">
      <section
        aria-labelledby="hero-title"
        className="grid flex-1 items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-24"
      >
        <div className="relative z-10 max-w-2xl">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-2 text-xs font-semibold tracking-wide text-muted shadow-sm">
            <Sparkles aria-hidden="true" className="size-4 text-accent" />
            A little food vision experiment
          </div>
          <h1
            id="hero-title"
            className="max-w-xl text-5xl font-semibold leading-[1.05] tracking-[-0.055em] sm:text-6xl lg:text-7xl"
          >
            Korean comfort food,{' '}
            <span className="font-serif font-medium italic text-accent">recognized.</span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-muted sm:text-lg sm:leading-8">
            Curious what is on your plate? Meet a small image classifier with a big appetite for two
            Korean favorites.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/predict"
              className="group inline-flex min-h-12 items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(201,73,45,0.2)] transition hover:-translate-y-0.5 hover:bg-accent-strong"
            >
              Try the classifier
              <ArrowRight
                aria-hidden="true"
                className="size-4 transition-transform group-hover:translate-x-0.5"
              />
            </Link>
            <span className="text-xs font-medium text-muted">Bibimbap · Fried rice</span>
          </div>
        </div>

        <div
          aria-label="Illustration of a Korean food bowl"
          className="relative mx-auto flex aspect-[0.94] w-full max-w-[440px] items-center justify-center sm:aspect-square"
          role="img"
        >
          <div className="absolute inset-[5%] rounded-[2.5rem] bg-[#efe2cf] dark:bg-[#302a22]" />
          <div className="absolute inset-[11%] rounded-full border border-[#d8c4a8] dark:border-[#514333]" />
          <div className="absolute inset-[17%] rounded-full border border-dashed border-[#d8c4a8] dark:border-[#514333]" />
          <div className="relative flex size-[57%] items-center justify-center rounded-full border-[12px] border-[#fffdfa] bg-[#d8a34e] shadow-[0_24px_55px_rgba(79,54,27,0.2)] dark:border-[#403a32]">
            <div className="absolute inset-[8%] rounded-full border border-[#fff3d6]/70" />
            <CookingPot aria-hidden="true" className="size-[36%] text-[#fff8e9]" strokeWidth={1.2} />
            <span className="sr-only">A bowl representing bibimbap and fried rice</span>
          </div>
          <div className="absolute left-[1%] top-[18%] rounded-2xl border border-border bg-surface px-4 py-3 shadow-[0_12px_35px_rgba(54,43,31,0.1)] sm:left-0">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
              On the menu
            </span>
            <span className="mt-1 block text-sm font-semibold">Two familiar favorites</span>
          </div>
          <div className="absolute bottom-[13%] right-[0%] flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 shadow-[0_12px_35px_rgba(54,43,31,0.1)] sm:right-[-2%]">
            <span className="flex size-9 items-center justify-center rounded-full bg-[#f7e9dc] text-accent dark:bg-[#49332d]">
              <Sparkles aria-hidden="true" className="size-4" />
            </span>
            <span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                Made with
              </span>
              <span className="mt-0.5 block text-sm font-semibold">curiosity &amp; CNNs</span>
            </span>
          </div>
          <div className="absolute right-[13%] top-[13%] size-3 rounded-full bg-accent/80" />
          <div className="absolute bottom-[24%] left-[13%] size-2 rounded-full bg-olive/80" />
        </div>
      </section>
    </main>
  )
}
