import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import type { Prediction, PredictionFeedback } from '../types/api'
import { AuthImage } from './AuthImage'
import { ResultCard } from './ResultCard'

interface PredictionDetailModalProps {
  prediction: Prediction
  onClose: () => void
  onPredictionChange: (prediction: Prediction) => void
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function PredictionDetailModal({
  prediction,
  onClose,
  onPredictionChange,
}: PredictionDetailModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab') return

      const dialog = document.getElementById('prediction-detail-dialog')
      const focusable = dialog?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable?.length) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      previousFocus?.focus()
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        id="prediction-detail-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="prediction-detail-title"
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[1.75rem] border border-border bg-surface p-5 shadow-2xl sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="prediction-detail-title" className="text-2xl font-semibold tracking-tight">
              Prediction details
            </h2>
            <time dateTime={prediction.createdAt} className="mt-1 block text-sm text-muted">
              {formatDate(prediction.createdAt)}
            </time>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-border text-foreground transition hover:border-accent/50 hover:text-accent"
            aria-label="Close prediction details"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <AuthImage
            predictionId={prediction.id}
            hasImage={prediction.hasImage}
            alt={`Saved ${prediction.predictedClass.replace('_', ' ')} prediction`}
            className="aspect-square w-full rounded-2xl"
          />
          <ResultCard
            prediction={prediction}
            onFeedbackChange={(feedback: PredictionFeedback | null) =>
              onPredictionChange({ ...prediction, feedback })
            }
          />
        </div>
      </section>
    </div>
  )
}
