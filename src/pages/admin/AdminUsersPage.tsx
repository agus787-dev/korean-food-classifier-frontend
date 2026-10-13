import { useCallback, useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { ApiError } from '../../api/client'
import { changeUserRole, getAdminUsers } from '../../api/admin'
import { Badge } from '../../components/admin/Badge'
import { ConfirmDialog } from '../../components/admin/ConfirmDialog'
import { DataTable } from '../../components/admin/DataTable'
import { Pagination } from '../../components/admin/Pagination'
import type { AdminUser, AdminUserPage, UserRole } from '../../types/api'

const PAGE_SIZE = 20

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value))
}

export function AdminUsersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Math.max(1, Number(searchParams.get('page') ?? 1) || 1)
  const search = searchParams.get('search') ?? ''
  const [searchInput, setSearchInput] = useState(search)
  const [pageData, setPageData] = useState<{ key: string; value: AdminUserPage } | null>(null)
  const [requestError, setRequestError] = useState<{ key: string; message: string } | null>(null)
  const [retry, setRetry] = useState(0)
  const [pendingChange, setPendingChange] = useState<{ user: AdminUser; role: UserRole } | null>(null)
  const [changeError, setChangeError] = useState<string | null>(null)
  const [changing, setChanging] = useState(false)

  const params = useMemo(() => {
    const query = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) })
    if (search) query.set('search', search)
    return query
  }, [page, search])
  const queryKey = params.toString()

  useEffect(() => {
    const controller = new AbortController()
    void getAdminUsers(params, controller.signal)
      .then((value) => {
        setPageData({ key: queryKey, value })
        setRequestError(null)
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setRequestError({
            key: queryKey,
            message: reason instanceof ApiError
              ? reason.status === 403
                ? 'Your account is not authorized to view users.'
                : reason.message
              : 'Could not load users.',
          })
        }
      })
    return () => controller.abort()
  }, [params, queryKey, retry])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (searchInput === search) return
      const next = new URLSearchParams(searchParams)
      if (searchInput.trim()) next.set('search', searchInput.trim())
      else next.delete('search')
      next.delete('page')
      setSearchParams(next, { replace: true })
    }, 300)
    return () => window.clearTimeout(timeout)
  }, [searchInput, search, searchParams, setSearchParams])

  const error = requestError?.key === queryKey ? requestError.message : null
  const data = !error && pageData?.key === queryKey ? pageData.value : null

  function retryUsers() {
    setPageData(null)
    setRequestError(null)
    setRetry((value) => value + 1)
  }

  function updatePage(nextPage: number) {
    const next = new URLSearchParams(searchParams)
    if (nextPage === 1) next.delete('page')
    else next.set('page', String(nextPage))
    setSearchParams(next)
  }

  async function applyRoleChange() {
    if (!pendingChange) return
    setChanging(true)
    setChangeError(null)
    try {
      await changeUserRole(pendingChange.user.id, pendingChange.role)
      setPendingChange(null)
      setPageData(null)
      setRetry((value) => value + 1)
    } catch (reason) {
      setChangeError(
        reason instanceof ApiError
          ? reason.message
          : 'Could not update this account role.',
      )
      setPendingChange(null)
    } finally {
      setChanging(false)
    }
  }

  function roleButton(user: AdminUser) {
    const role: UserRole = user.role === 'admin' ? 'user' : 'admin'
    return (
      <button
        type="button"
        onClick={() => {
          setChangeError(null)
          setPendingChange({ user, role })
        }}
        className="min-h-9 rounded-full border border-border px-3 text-xs font-semibold text-accent hover:border-accent/50"
      >
        Make {role}
      </button>
    )
  }

  const cancelRoleChange = useCallback(() => {
    if (!changing) setPendingChange(null)
  }, [changing])

  const columns = [
    {
      key: 'user',
      header: 'User',
      render: (row: AdminUser) => (
        <div>
          <p className="font-semibold">{row.displayName}</p>
          <p className="mt-0.5 text-xs text-muted">{row.email}</p>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (row: AdminUser) => <Badge tone={row.role === 'admin' ? 'accent' : 'neutral'}>{row.role}</Badge>,
    },
    { key: 'predictions', header: 'Predictions', render: (row: AdminUser) => row.predictionsCount },
    { key: 'joined', header: 'Joined', render: (row: AdminUser) => formatDate(row.createdAt) },
    { key: 'action', header: 'Role action', render: (row: AdminUser) => roleButton(row) },
  ]

  return (
    <section aria-labelledby="admin-users-heading">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Administration</p>
        <h1 id="admin-users-heading" className="mt-2 text-3xl font-semibold tracking-tight">Users</h1>
      </div>
      <label className="relative block max-w-xl">
        <span className="sr-only">Search users by name or email</span>
        <Search aria-hidden="true" className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <input
          type="search"
          value={searchInput}
          onChange={(event) => setSearchInput(event.currentTarget.value)}
          placeholder="Search name or email"
          className="min-h-11 w-full rounded-full border border-border bg-surface pl-11 pr-4 text-sm focus-visible:border-accent"
        />
      </label>
      {changeError && <p className="mt-4 rounded-xl border border-accent/25 bg-accent/5 px-4 py-3 text-sm" role="alert">{changeError}</p>}

      {!data && !error && (
        <div className="mt-5 space-y-2" role="status" aria-label="Loading users">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="h-16 animate-pulse rounded-xl bg-surface" />
          ))}
        </div>
      )}
      {error && (
        <div className="mt-5 rounded-2xl border border-accent/25 bg-accent/5 p-5" role="alert">
          <p className="text-sm">{error}</p>
          <button type="button" onClick={retryUsers} className="mt-3 text-sm font-semibold text-accent">Retry</button>
        </div>
      )}
      {data && (
        <>
          <p className="mt-5 text-sm text-muted">{data.total} {data.total === 1 ? 'user' : 'users'}</p>
          <div className="mt-3 hidden lg:block">
            <DataTable columns={columns} rows={data.users} rowKey={(row) => row.id} />
          </div>
          <ul className="mt-3 space-y-3 lg:hidden">
            {data.users.map((item) => (
              <li key={item.id} className="rounded-2xl border border-border bg-surface p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{item.displayName}</p>
                    <p className="mt-0.5 break-all text-xs text-muted">{item.email}</p>
                  </div>
                  <Badge tone={item.role === 'admin' ? 'accent' : 'neutral'}>{item.role}</Badge>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2 text-xs text-muted">
                  <span>{item.predictionsCount} predictions</span>
                  <span>Joined {formatDate(item.createdAt)}</span>
                </div>
                <div className="mt-3">{roleButton(item)}</div>
              </li>
            ))}
          </ul>
          {data.users.length === 0 && <p className="mt-5 rounded-2xl bg-surface p-6 text-sm text-muted">No users match this search.</p>}
          <Pagination page={data.page} totalPages={data.totalPages} onPageChange={updatePage} />
        </>
      )}

      {pendingChange && (
        <ConfirmDialog
          title="Change account role?"
          message={`Change ${pendingChange.user.displayName} (${pendingChange.user.email}) to ${pendingChange.role}? The change takes effect on the next request.`}
          confirmLabel={`Make ${pendingChange.role}`}
          busy={changing}
          onConfirm={() => void applyRoleChange()}
          onCancel={cancelRoleChange}
        />
      )}
    </section>
  )
}
