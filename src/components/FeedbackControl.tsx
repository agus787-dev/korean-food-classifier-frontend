import { useState } from 'react'
import { ApiError } from '../api/client'
import { deleteFeedback, saveFeedback } from '../api/predictions'
import type { FoodClass, Prediction, PredictionFeedback, SaveFeedbackPayload } from '../types/api'
import { FOOD_LABELS } from '../utils/food'

interface FeedbackControlProps {
  prediction: Prediction
  onFeedbackChange?: (feedback: PredictionFeedback | null) => void
}

export function FeedbackControl({ prediction, onFeedbackChange }: FeedbackControlProps) {
  const [feedback, setFeedback] = useState<PredictionFeedback | null>(prediction.feedback)
  const [editing, setEditing] = useState(false)
  const [choosingCorrectClass, setChoosingCorrectClass] = useState(false)
  const [correctClass, setCorrectClass] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const availableClasses = Object.keys(prediction.probabilities)
  const otherClasses = availableClasses.filter((className) => className !== prediction.predictedClass)
  const formatClassName = (className: string) =>
    FOOD_LABELS[className as FoodClass] ??
    className.replaceAll('_', ' ').replace(/\b\w/g, (character) => character.toUpperCase())

  function updateFeedback(nextFeedback: PredictionFeedback | null) {
    setFeedback(nextFeedback)
    onFeedbackChange?.(nextFeedback)
  }

  async function submit(body: SaveFeedbackPayload) {
    setLoading(true)
    setError(null)
    try {
      const saved = await saveFeedback(prediction.id, body)
      updateFeedback(
        saved.correctClass === undefined
          ? { isCorrect: saved.isCorrect }
          : { isCorrect: saved.isCorrect, correctClass: saved.correctClass },
      )
      setEditing(false)
      setChoosingCorrectClass(false)
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : 'Could not save feedback. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function remove() {
    setLoading(true)
    setError(null)
    try {
      await deleteFeedback(prediction.id)
      updateFeedback(null)
      setEditing(true)
      setChoosingCorrectClass(false)
      setCorrectClass('')
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : 'Could not remove feedback. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!editing && feedback) {
    const status = feedback.isCorrect
      ? 'Thanks! You marked this as correct'
      : `You said it was ${formatClassName(feedback.correctClass ?? '')}`

    return (
      <section className="mt-5 border-t border-border pt-4" aria-label="Prediction feedback">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium text-foreground" aria-live="polite">{status}</p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setEditing(true)
                setChoosingCorrectClass(false)
                setError(null)
              }}
              disabled={loading}
              className="text-sm font-semibold text-accent hover:text-accent-strong disabled:opacity-60"
            >
              Change
            </button>
            <button
              type="button"
              onClick={() => void remove()}
              disabled={loading}
              className="text-sm font-medium text-muted underline-offset-4 hover:text-accent hover:underline disabled:opacity-60"
            >
              Remove
            </button>
          </div>
        </div>
        {error && <p className="mt-2 text-sm text-accent-strong" role="alert">{error}</p>}
      </section>
    )
  }

  return (
    <section className="mt-5 border-t border-border pt-4" aria-label="Prediction feedback">
      <h4 className="text-sm font-semibold">Was this prediction correct?</h4>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void submit({ isCorrect: true })}
          disabled={loading}
          className="min-h-10 rounded-full border border-border bg-surface px-4 text-sm font-semibold transition hover:border-olive hover:text-olive disabled:cursor-wait disabled:opacity-60"
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => {
            setEditing(true)
            setChoosingCorrectClass(true)
            setCorrectClass((current) => current || otherClasses[0] || '')
            setError(null)
          }}
          disabled={loading}
          className="min-h-10 rounded-full border border-border bg-surface px-4 text-sm font-semibold transition hover:border-accent/50 hover:text-accent disabled:opacity-60"
        >
          No
        </button>
      </div>
      {choosingCorrectClass && (
        <div className="mt-3 flex flex-col items-start gap-3 sm:flex-row sm:items-end">
          <div className="w-full sm:max-w-xs">
            <label htmlFor={`correct-class-${prediction.id}`} className="block text-sm font-medium">
              What was the correct class?
            </label>
            <select
              id={`correct-class-${prediction.id}`}
              value={correctClass}
              onChange={(event) => setCorrectClass(event.currentTarget.value)}
              disabled={loading || otherClasses.length === 0}
              className="mt-1.5 min-h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground disabled:opacity-60"
            >
              <option value="">Select a class</option>
              {otherClasses.map((className) => (
                <option key={className} value={className}>
                  {formatClassName(className)}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => void submit({ isCorrect: false, correctClass })}
            disabled={loading || !correctClass}
            className="min-h-10 rounded-full bg-accent px-5 text-sm font-semibold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Saving…' : 'Save'}
          </button>
        </div>
      )}
      {loading && <p className="sr-only" role="status">Saving feedback…</p>}
      {error && <p className="mt-2 text-sm text-accent-strong" role="alert" aria-live="assertive">{error}</p>}
    </section>
  )
}
