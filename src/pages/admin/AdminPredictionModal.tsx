import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import type { AdminPrediction } from '../../types/api'
import { AuthImage } from '../../components/AuthImage'
import { Badge } from '../../components/admin/Badge'
import { ResultCard } from '../../components/ResultCard'
import { FOOD_LABELS } from '../../utils/food'

interface AdminPredictionModalProps {
  prediction: AdminPrediction
  onClose: () => void
}

export function AdminPredictionModal({ prediction, onClose }: AdminPredictionModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key !== 'Tab') return
      const dialog = document.getElementById('admin-prediction-dialog')
      const items = dialog?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])')
      if (!items?.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      previousFocus?.focus()
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section id="admin-prediction-dialog" role="dialog" aria-modal="true" aria-labelledby="admin-prediction-title" className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[1.75rem] border border-border bg-surface p-5 shadow-2xl sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="admin-prediction-title" className="text-2xl font-semibold">Prediction details</h2>
            <p className="mt-1 text-sm text-muted">{prediction.user.displayName} · {prediction.user.email}</p>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close prediction details" className="flex size-10 items-center justify-center rounded-full border border-border hover:text-accent"><X aria-hidden="true" className="size-4" /></button>
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1fr]">
          <AuthImage predictionId={prediction.id} hasImage={prediction.hasImage} alt={`Saved ${prediction.predictedClass.replace('_', ' ')} prediction`} className="aspect-square w-full rounded-2xl" />
          <div>
            <ResultCard prediction={prediction} showFeedback={false} />
            <section className="mt-4 rounded-2xl border border-border bg-background/60 p-4">
              <h3 className="text-sm font-semibold">User feedback</h3>
              {prediction.feedback === null ? (
                <p className="mt-2 text-sm text-muted">No feedback submitted.</p>
              ) : (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge tone={prediction.feedback.isCorrect ? 'success' : 'danger'}>
                    {prediction.feedback.isCorrect ? 'Marked correct' : 'Marked incorrect'}
                  </Badge>
                  {!prediction.feedback.isCorrect && prediction.feedback.correctClass && (
                    <span className="text-sm text-muted">
                      Correct class: {FOOD_LABELS[prediction.feedback.correctClass as keyof typeof FOOD_LABELS] ?? prediction.feedback.correctClass}
                    </span>
                  )}
                </div>
              )}
            </section>
          </div>
        </div>
      </section>
    </div>
  )
}
