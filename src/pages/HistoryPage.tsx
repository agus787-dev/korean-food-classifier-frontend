import { useCallback, useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { ApiError } from '../api/client'
import { deletePrediction, getPredictions } from '../api/predictions'
import type { PredictionPage as PredictionPageData } from '../types/api'
import { FOOD_LABELS } from '../utils/food'
import { AuthImage } from '../components/AuthImage'
import { PredictionDetailModal } from '../components/PredictionDetailModal'

const PAGE_SIZE = 20

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function HistoryPage() {
  const [page, setPage] = useState(1)
  const [reloadKey, setReloadKey] = useState(0)
  const [data, setData] = useState<PredictionPageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPrediction, setSelectedPrediction] = useState<PredictionPageData['predictions'][number] | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    void getPredictions(page, PAGE_SIZE, controller.signal)
      .then(setData)
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setError(reason instanceof ApiError ? reason.message : 'Could not load prediction history.')
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [page, reloadKey])

  function changePage(nextPage: number) {
    setError(null)
    setData(null)
    setLoading(true)
    setPage(nextPage)
  }

  function retry() {
    setError(null)
    setData(null)
    setLoading(true)
    setReloadKey((value) => value + 1)
  }

  const closeSelectedPrediction = useCallback(() => setSelectedPrediction(null), [])
  const updateSelectedPrediction = useCallback((updated: PredictionPageData['predictions'][number]) => {
    setSelectedPrediction(updated)
    setData((current) =>
      current
        ? {
            ...current,
            predictions: current.predictions.map((prediction) =>
              prediction.id === updated.id ? updated : prediction,
            ),
          }
        : current,
    )
  }, [])

  async function handleDelete(id: string) {
    if (!window.confirm('Delete this prediction and its saved image? This cannot be undone.')) return

    setDeletingId(id)
    setDeleteError(null)
    try {
      await deletePrediction(id)
      setSelectedPrediction(null)
      setData((current) => {
        if (!current) return current
        const predictions = current.predictions.filter((prediction) => prediction.id !== id)
        const total = Math.max(0, current.total - 1)
        return {
          ...current,
          predictions,
          total,
          totalPages: Math.ceil(total / current.limit),
        }
      })
      if (data && data.predictions.length === 1 && data.page > 1) {
        setData(null)
        setLoading(true)
        setPage((current) => current - 1)
      }
    } catch (reason) {
      setDeleteError(reason instanceof ApiError ? reason.message : 'Could not delete this prediction.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-12 sm:px-8 sm:py-16">
      <section aria-labelledby="history-heading">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Your Hansik</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 id="history-heading" className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Prediction history
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted">Your saved classifications, newest first.</p>
          </div>
          {data && (
            <p className="text-sm text-muted">
              {data.total} {data.total === 1 ? 'prediction' : 'predictions'}
            </p>
          )}
        </div>

        {loading && (
          <div className="mt-8 space-y-3" aria-label="Loading prediction history" role="status">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-24 animate-pulse rounded-2xl border border-border bg-surface" />
            ))}
            <span className="sr-only">Loading prediction history…</span>
          </div>
        )}

        {!loading && error && (
          <div className="mt-8 rounded-2xl border border-accent/25 bg-accent/5 p-5" role="alert">
            <p className="text-sm leading-6">{error}</p>
            <button
              type="button"
              onClick={retry}
              className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-surface px-4 text-sm font-semibold text-accent hover:border-accent/50"
            >
              <RefreshCw aria-hidden="true" className="size-4" />
              Retry
            </button>
          </div>
        )}

        {!loading && !error && data?.predictions.length === 0 && (
          <div className="mt-8 rounded-[1.75rem] border border-border bg-surface px-6 py-12 text-center">
            <h2 className="text-xl font-semibold">No predictions yet</h2>
            <p className="mt-2 text-sm text-muted">Your first dish classification will show up here.</p>
          </div>
        )}

        {!loading && !error && data && data.predictions.length > 0 && (
          <>
            <ol className="mt-8 space-y-3">
              {data.predictions.map((prediction) => (
                <li key={prediction.id}>
                  <article className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-3 shadow-[0_8px_24px_rgba(64,47,29,0.04)] sm:flex-row sm:items-center">
                    <button
                      type="button"
                      onClick={() => setSelectedPrediction(prediction)}
                      aria-label={`View ${FOOD_LABELS[prediction.predictedClass]} prediction details`}
                      className="flex min-w-0 flex-1 items-center gap-4 rounded-xl text-left focus-visible:outline-offset-4"
                    >
                      <AuthImage
                        predictionId={prediction.id}
                        hasImage={prediction.hasImage}
                        alt={`Saved ${FOOD_LABELS[prediction.predictedClass]} thumbnail`}
                        className="size-20 shrink-0 rounded-xl sm:size-24"
                      />
                      <span className="min-w-0">
                        <span className="block text-lg font-semibold">{FOOD_LABELS[prediction.predictedClass]}</span>
                        <time dateTime={prediction.createdAt} className="mt-1 block text-sm text-muted">
                          {formatDate(prediction.createdAt)}
                        </time>
                        <span className="mt-2 inline-flex rounded-full bg-[#eaf0e3] px-3 py-1 text-xs font-semibold text-olive dark:bg-[#303a2a]">
                          {Math.round(prediction.confidence * 100)}% confidence
                        </span>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(prediction.id)}
                      disabled={deletingId !== null}
                      aria-label={`Delete ${FOOD_LABELS[prediction.predictedClass]} prediction`}
                      className="min-h-10 shrink-0 self-end rounded-full border border-border px-4 text-sm font-semibold text-accent transition hover:border-accent/50 disabled:cursor-wait disabled:opacity-60 sm:self-center"
                    >
                      {deletingId === prediction.id ? 'Deleting…' : 'Delete'}
                    </button>
                  </article>
                </li>
              ))}
            </ol>
            {deleteError && (
              <p className="mt-4 rounded-xl border border-accent/25 bg-accent/5 px-4 py-3 text-sm text-accent-strong" role="alert">
                {deleteError}
              </p>
            )}
            <nav aria-label="Prediction history pages" className="mt-6 flex items-center justify-between gap-4">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => changePage(Math.max(1, page - 1))}
                className="min-h-10 rounded-full border border-border bg-surface px-4 text-sm font-semibold transition hover:border-accent/50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-muted">
                Page {data.page} of {Math.max(data.totalPages, 1)}
              </span>
              <button
                type="button"
                disabled={page >= data.totalPages}
                onClick={() => changePage(page + 1)}
                className="min-h-10 rounded-full border border-border bg-surface px-4 text-sm font-semibold transition hover:border-accent/50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </nav>
          </>
        )}
      </section>
      {selectedPrediction && (
        <PredictionDetailModal
          prediction={selectedPrediction}
          onClose={closeSelectedPrediction}
          onPredictionChange={updateSelectedPrediction}
        />
      )}
    </main>
  )
}
