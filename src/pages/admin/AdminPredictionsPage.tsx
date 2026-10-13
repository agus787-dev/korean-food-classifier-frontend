import { useCallback, useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { ApiError } from '../../api/client'
import { getAdminPredictions, getAdminUsers } from '../../api/admin'
import { AuthImage } from '../../components/AuthImage'
import { Badge } from '../../components/admin/Badge'
import { DataTable } from '../../components/admin/DataTable'
import { Pagination } from '../../components/admin/Pagination'
import type { AdminPrediction, AdminPredictionPage, AdminUserPage } from '../../types/api'
import { FOOD_LABELS } from '../../utils/food'
import { AdminPredictionModal } from './AdminPredictionModal'

const PAGE_SIZE = 20

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

export function AdminPredictionsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Math.max(1, Number(searchParams.get('page') ?? 1) || 1)
  const [dataState, setDataState] = useState<{ key: string; data: AdminPredictionPage } | null>(null)
  const [errorState, setErrorState] = useState<{ key: string; message: string } | null>(null)
  const [retry, setRetry] = useState(0)
  const [userSearch, setUserSearch] = useState(searchParams.get('userSearch') ?? '')
  const [userSearchState, setUserSearchState] = useState<{
    search: string
    users: AdminUserPage['users']
    error: string | null
  } | null>(null)
  const [selected, setSelected] = useState<AdminPrediction | null>(null)
  const [searchingUsers, setSearchingUsers] = useState(false)

  const apiParams = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) })
    for (const key of ['userId', 'predictedClass', 'feedback', 'from', 'to']) {
      const value = searchParams.get(key)
      if (value) params.set(key, value)
    }
    return params
  }, [page, searchParams])
  const queryKey = apiParams.toString()

  useEffect(() => {
    const controller = new AbortController()
    void getAdminPredictions(apiParams, controller.signal)
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
                ? 'Your account is not authorized to view predictions.'
                : reason.message
              : 'Could not load predictions.',
          })
        }
      })
    return () => controller.abort()
  }, [apiParams, queryKey, retry])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = new URLSearchParams(searchParams)
      if (userSearch.trim()) next.set('userSearch', userSearch.trim())
      else next.delete('userSearch')
      setSearchParams(next, { replace: true })
    }, 300)
    return () => window.clearTimeout(timer)
  }, [userSearch, searchParams, setSearchParams])

  useEffect(() => {
    if (userSearch.trim().length < 2 || /^[\da-f]{24}$/i.test(userSearch.trim())) {
      return
    }
    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      setSearchingUsers(true)
      const query = new URLSearchParams({ page: '1', limit: '8', search: userSearch.trim() })
      void getAdminUsers(query, controller.signal)
        .then((result) => {
          setUserSearchState({ search: userSearch, users: result.users, error: null })
        })
        .catch((reason: unknown) => {
          if (!controller.signal.aborted) {
            setUserSearchState({
              search: userSearch,
              users: [],
              error: reason instanceof ApiError ? reason.message : 'Could not search users.',
            })
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) setSearchingUsers(false)
        })
    }, 300)
    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [userSearch])

  const error = errorState?.key === queryKey ? errorState.message : null
  const data = !error && dataState?.key === queryKey ? dataState.data : null
  const userMatches = userSearchState?.search === userSearch ? userSearchState.users : []
  const userSearchError = userSearchState?.search === userSearch ? userSearchState.error : null
  const closeSelectedPrediction = useCallback(() => setSelected(null), [])

  function updateFilters(changes: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value)
      else next.delete(key)
    }
    next.delete('page')
    setSearchParams(next)
  }

  function updatePage(nextPage: number) {
    const next = new URLSearchParams(searchParams)
    if (nextPage <= 1) next.delete('page')
    else next.set('page', String(nextPage))
    setSearchParams(next)
  }

  function retryPredictions() {
    setDataState(null)
    setErrorState(null)
    setRetry((value) => value + 1)
  }

  function chooseUser(id: string, label: string) {
    setUserSearch(label)
    updateFilters({ userId: id, userSearch: label })
  }

  function handleUserSearchChange(value: string) {
    setUserSearch(value)
    if (/^[\da-f]{24}$/i.test(value.trim())) {
      updateFilters({ userId: value.trim(), userSearch: value.trim() })
    } else {
      updateFilters({ userId: null })
    }
  }

  function clearUserFilter() {
    setUserSearch('')
    updateFilters({ userId: null, userSearch: null })
  }

  const columns = [
    {
      key: 'prediction',
      header: 'Prediction',
      render: (row: AdminPrediction) => (
        <button type="button" onClick={() => setSelected(row)} className="flex items-center gap-3 text-left">
          <AuthImage
            predictionId={row.id}
            hasImage={row.hasImage}
            alt={`${row.predictedClass.replace('_', ' ')} thumbnail`}
            className="size-12 rounded-lg"
          />
          <span className="font-semibold">{FOOD_LABELS[row.predictedClass] ?? row.predictedClass}</span>
        </button>
      ),
    },
    { key: 'user', header: 'User', render: (row: AdminPrediction) => <span>{row.user.email}</span> },
    { key: 'confidence', header: 'Confidence', render: (row: AdminPrediction) => `${Math.round(row.confidence * 100)}%` },
    {
      key: 'feedback',
      header: 'Feedback',
      render: (row: AdminPrediction) => row.feedback === null
        ? <Badge>None</Badge>
        : <Badge tone={row.feedback.isCorrect ? 'success' : 'danger'}>{row.feedback.isCorrect ? 'Correct' : `Incorrect · ${row.feedback.correctClass ?? ''}`}</Badge>,
    },
    { key: 'createdAt', header: 'Date', render: (row: AdminPrediction) => formatDate(row.createdAt) },
  ]

  return (
    <section aria-labelledby="admin-predictions-heading">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Administration</p>
        <h1 id="admin-predictions-heading" className="mt-2 text-3xl font-semibold tracking-tight">Predictions</h1>
      </div>

      <div className="grid gap-3 rounded-2xl border border-border bg-surface p-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="relative">
          <Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={userSearch}
            onChange={(event) => handleUserSearchChange(event.currentTarget.value)}
            placeholder="Find user by name/email/ID"
            aria-label="Find prediction owner by name, email, or ID"
            className="min-h-10 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm"
          />
          {userMatches.length > 0 && (
            <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-border bg-surface p-1 shadow-xl">
              {userMatches.map((match) => (
                <li key={match.id}>
                  <button type="button" onClick={() => chooseUser(match.id, `${match.displayName} · ${match.email}`)} className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-background">
                    <span className="block font-medium">{match.displayName}</span>
                    <span className="block text-xs text-muted">{match.email}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {userSearchError && <p className="mt-1 text-xs text-accent" role="alert">{userSearchError}</p>}
          {searchingUsers && <p className="mt-1 text-xs text-muted" role="status">Searching users…</p>}
        </div>
        <label className="text-xs font-medium text-muted">
          Predicted class
          <select value={searchParams.get('predictedClass') ?? ''} onChange={(event) => updateFilters({ predictedClass: event.currentTarget.value || null })} className="mt-1 min-h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground">
            <option value="">All classes</option>
            <option value="bibimbap">Bibimbap</option>
            <option value="fried_rice">Fried rice</option>
          </select>
        </label>
        <label className="text-xs font-medium text-muted">
          Feedback
          <select value={searchParams.get('feedback') ?? ''} onChange={(event) => updateFilters({ feedback: event.currentTarget.value || null })} className="mt-1 min-h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground">
            <option value="">All</option>
            <option value="correct">Correct</option>
            <option value="incorrect">Incorrect</option>
            <option value="none">None</option>
          </select>
        </label>
        <label className="text-xs font-medium text-muted">
          From
          <input type="date" value={searchParams.get('from') ?? ''} onChange={(event) => updateFilters({ from: event.currentTarget.value || null })} className="mt-1 min-h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground" />
        </label>
        <label className="text-xs font-medium text-muted">
          To
          <input type="date" value={searchParams.get('to') ?? ''} onChange={(event) => updateFilters({ to: event.currentTarget.value || null })} className="mt-1 min-h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground" />
        </label>
        {searchParams.has('userId') && (
          <button type="button" onClick={clearUserFilter} className="min-h-10 self-end text-left text-sm font-semibold text-accent">
            Clear user filter
          </button>
        )}
      </div>

      {!data && !error && <div className="mt-5 space-y-2" role="status" aria-label="Loading predictions">{Array.from({ length: 5 }, (_, index) => <div key={index} className="h-16 animate-pulse rounded-xl bg-surface" />)}</div>}
      {error && <div className="mt-5 rounded-2xl border border-accent/25 bg-accent/5 p-5" role="alert"><p className="text-sm">{error}</p><button type="button" onClick={retryPredictions} className="mt-3 text-sm font-semibold text-accent">Retry</button></div>}
      {data && (
        <>
          <p className="mt-5 text-sm text-muted">{data.total} predictions</p>
          <div className="mt-3 hidden lg:block"><DataTable columns={columns} rows={data.predictions} rowKey={(row) => row.id} /></div>
          <ul className="mt-3 space-y-3 lg:hidden">
            {data.predictions.map((item) => (
              <li key={item.id} className="rounded-2xl border border-border bg-surface p-3">
                <button type="button" onClick={() => setSelected(item)} className="flex w-full items-center gap-3 text-left">
                  <AuthImage predictionId={item.id} hasImage={item.hasImage} alt={`${item.predictedClass.replace('_', ' ')} thumbnail`} className="size-16 shrink-0 rounded-xl" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{FOOD_LABELS[item.predictedClass] ?? item.predictedClass}</span>
                    <span className="mt-0.5 block truncate text-xs text-muted">{item.user.email}</span>
                    <span className="mt-1 block text-xs text-muted">{formatDate(item.createdAt)}</span>
                  </span>
                  <span className="text-xs font-semibold">{Math.round(item.confidence * 100)}%</span>
                </button>
                <div className="mt-2 pl-[4.75rem]">
                  {item.feedback === null
                    ? <Badge>None</Badge>
                    : <Badge tone={item.feedback.isCorrect ? 'success' : 'danger'}>{item.feedback.isCorrect ? 'Correct' : `Incorrect · ${item.feedback.correctClass ?? ''}`}</Badge>}
                </div>
              </li>
            ))}
          </ul>
          {data.predictions.length === 0 && <p className="mt-4 rounded-2xl bg-surface p-6 text-sm text-muted">No predictions match these filters.</p>}
          <Pagination page={data.page} totalPages={data.totalPages} onPageChange={updatePage} />
        </>
      )}
      {selected && <AdminPredictionModal prediction={selected} onClose={closeSelectedPrediction} />}
    </section>
  )
}
