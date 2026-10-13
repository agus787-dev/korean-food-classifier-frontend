import { useEffect, useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { ApiError } from '../../api/client'
import { exportAdminFeedback, getAdminFeedback } from '../../api/admin'
import { AuthImage } from '../../components/AuthImage'
import { Badge } from '../../components/admin/Badge'
import { DataTable } from '../../components/admin/DataTable'
import { Pagination } from '../../components/admin/Pagination'
import type { AdminFeedback, AdminFeedbackPage } from '../../types/api'
import { FOOD_LABELS } from '../../utils/food'

const PAGE_SIZE = 20

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

export function AdminFeedbackPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Math.max(1, Number(searchParams.get('page') ?? 1) || 1)
  const isCorrect = searchParams.get('isCorrect') ?? ''
  const [dataState, setDataState] = useState<{ key: string; data: AdminFeedbackPage } | null>(null)
  const [errorState, setErrorState] = useState<{ key: string; message: string } | null>(null)
  const [retry, setRetry] = useState(0)
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const params = useMemo(() => {
    const query = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) })
    if (isCorrect) query.set('isCorrect', isCorrect)
    return query
  }, [isCorrect, page])
  const queryKey = params.toString()

  useEffect(() => {
    const controller = new AbortController()
    void getAdminFeedback(params, controller.signal)
      .then((data) => {
        setDataState({ key: queryKey, data })
        setErrorState(null)
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setErrorState({
            key: queryKey,
            message: reason instanceof ApiError
              ? reason.status === 403
                ? 'Your account is not authorized to view feedback.'
                : reason.message
              : 'Could not load feedback.',
          })
        }
      })
    return () => controller.abort()
  }, [params, queryKey, retry])

  const error = errorState?.key === queryKey ? errorState.message : null
  const data = !error && dataState?.key === queryKey ? dataState.data : null

  function setFilter(value: string) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set('isCorrect', value)
    else next.delete('isCorrect')
    next.delete('page')
    setSearchParams(next)
  }

  function setPage(nextPage: number) {
    const next = new URLSearchParams(searchParams)
    if (nextPage <= 1) next.delete('page')
    else next.set('page', String(nextPage))
    setSearchParams(next)
  }

  function retryFeedback() {
    setDataState(null)
    setErrorState(null)
    setRetry((value) => value + 1)
  }

  async function downloadCsv() {
    setExporting(true)
    setExportError(null)
    try {
      const blob = await exportAdminFeedback(
        isCorrect === '' ? undefined : isCorrect === 'true',
      )
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `feedback-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.append(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (reason) {
      setExportError(
        reason instanceof ApiError && reason.status === 403
          ? 'Your account is not authorized to export feedback.'
          : reason instanceof ApiError
            ? reason.message
            : 'Could not export feedback.',
      )
    } finally {
      setExporting(false)
    }
  }

  const columns = [
    {
      key: 'image',
      header: 'Image',
      render: (row: AdminFeedback) => (
        <AuthImage
          predictionId={row.predictionId}
          alt={`Saved ${row.predictedClass.replace('_', ' ')} thumbnail`}
          className="size-14 rounded-lg"
        />
      ),
    },
    {
      key: 'classes',
      header: 'Predicted / correct',
      render: (row: AdminFeedback) => (
        <div>
          <p className="font-semibold">{FOOD_LABELS[row.predictedClass as keyof typeof FOOD_LABELS] ?? row.predictedClass}</p>
          <p className="mt-0.5 text-xs text-muted">
            {row.isCorrect
              ? FOOD_LABELS[row.predictedClass as keyof typeof FOOD_LABELS] ?? row.predictedClass
              : FOOD_LABELS[row.correctClass as keyof typeof FOOD_LABELS] ?? row.correctClass ?? 'Not provided'}
          </p>
        </div>
      ),
    },
    {
      key: 'result',
      header: 'Result',
      render: (row: AdminFeedback) => (
        <Badge tone={row.isCorrect ? 'success' : 'danger'}>{row.isCorrect ? 'Correct' : 'Incorrect'}</Badge>
      ),
    },
    { key: 'email', header: 'User', render: (row: AdminFeedback) => row.userEmail },
    { key: 'date', header: 'Date', render: (row: AdminFeedback) => formatDate(row.createdAt) },
  ]

  return (
    <section aria-labelledby="admin-feedback-heading">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Administration</p>
          <h1 id="admin-feedback-heading" className="mt-2 text-3xl font-semibold tracking-tight">Feedback</h1>
        </div>
        <button type="button" onClick={() => void downloadCsv()} disabled={exporting} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-accent px-4 text-sm font-semibold text-white hover:bg-accent-strong disabled:opacity-60">
          <Download aria-hidden="true" className="size-4" />
          {exporting ? 'Exporting…' : 'Export CSV'}
        </button>
      </div>
      {exportError && <p className="mb-4 rounded-xl border border-accent/25 bg-accent/5 px-4 py-3 text-sm" role="alert">{exportError}</p>}
      <label className="block max-w-xs text-xs font-medium text-muted">
        Filter feedback
        <select value={isCorrect} onChange={(event) => setFilter(event.currentTarget.value)} className="mt-1 min-h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-foreground">
          <option value="">All feedback</option>
          <option value="true">Correct</option>
          <option value="false">Incorrect</option>
        </select>
      </label>

      {!data && !error && <div className="mt-5 space-y-2" role="status" aria-label="Loading feedback">{Array.from({ length: 5 }, (_, index) => <div key={index} className="h-16 animate-pulse rounded-xl bg-surface" />)}</div>}
      {error && <div className="mt-5 rounded-2xl border border-accent/25 bg-accent/5 p-5" role="alert"><p className="text-sm">{error}</p><button type="button" onClick={retryFeedback} className="mt-3 text-sm font-semibold text-accent">Retry</button></div>}
      {data && (
        <>
          <p className="mt-5 text-sm text-muted">{data.total} feedback responses</p>
          <div className="mt-3 hidden lg:block"><DataTable columns={columns} rows={data.feedback} rowKey={(row) => row.predictionId} /></div>
          <ul className="mt-3 space-y-3 lg:hidden">
            {data.feedback.map((item) => (
              <li key={item.predictionId} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3">
                <AuthImage predictionId={item.predictionId} alt={`${item.predictedClass.replace('_', ' ')} thumbnail`} className="size-16 shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{FOOD_LABELS[item.predictedClass as keyof typeof FOOD_LABELS] ?? item.predictedClass}</p>
                  <p className="mt-0.5 truncate text-xs text-muted">{item.userEmail}</p>
                  <p className="mt-1 text-xs text-muted">{formatDate(item.createdAt)}</p>
                </div>
                <Badge tone={item.isCorrect ? 'success' : 'danger'}>
                  {item.isCorrect ? 'Correct' : 'Incorrect'}
                </Badge>
              </li>
            ))}
          </ul>
          {data.feedback.length === 0 && <p className="mt-4 rounded-2xl bg-surface p-6 text-sm text-muted">No feedback matches this filter.</p>}
          <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
        </>
      )}
    </section>
  )
}
