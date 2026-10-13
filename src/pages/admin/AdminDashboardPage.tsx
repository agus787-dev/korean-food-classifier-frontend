import { useEffect, useState } from 'react'
import { Activity, MessageSquareText, Target, Users } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ApiError } from '../../api/client'
import { getAdminStats } from '../../api/admin'
import { StatCard } from '../../components/admin/StatCard'
import type { AdminStats } from '../../types/api'
import { FOOD_LABELS } from '../../utils/food'

function percent(value: number | null): string {
  return value === null ? 'No feedback yet' : `${(value * 100).toFixed(1)}%`
}

export function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    void getAdminStats(controller.signal)
      .then(setStats)
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setError(
            reason instanceof ApiError && reason.status === 403
              ? 'Your account is not authorized to view administrator statistics.'
              : reason instanceof ApiError
                ? reason.message
                : 'Could not load dashboard statistics.',
          )
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [retry])

  function reload() {
    setStats(null)
    setLoading(true)
    setError(null)
    setRetry((current) => current + 1)
  }

  const chartTooltipStyle = {
    backgroundColor: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    color: 'var(--foreground)',
  }

  return (
    <section aria-labelledby="admin-dashboard-heading">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Overview</p>
        <h1 id="admin-dashboard-heading" className="mt-2 text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-sm text-muted">Usage and classifier quality at a glance.</p>
      </div>

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" role="status" aria-label="Loading dashboard">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-32 animate-pulse rounded-2xl border border-border bg-surface" />
          ))}
          <span className="sr-only">Loading dashboard statistics…</span>
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-accent/25 bg-accent/5 p-5" role="alert">
          <p className="text-sm leading-6">{error}</p>
          <button
            type="button"
            onClick={reload}
            className="mt-4 min-h-10 rounded-full border border-border bg-surface px-4 text-sm font-semibold text-accent"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && stats && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total users" value={stats.totalUsers.toLocaleString()} icon={<Users className="size-4" />} />
            <StatCard label="Predictions" value={stats.totalPredictions.toLocaleString()} icon={<Activity className="size-4" />} />
            <StatCard
              label="Average confidence"
              value={stats.averageConfidence === null ? '—' : percent(stats.averageConfidence)}
              icon={<Target className="size-4" />}
            />
            <StatCard
              label="Model accuracy"
              value={percent(stats.feedback.accuracy)}
              hint={`${stats.feedback.total.toLocaleString()} feedback responses`}
              icon={<MessageSquareText className="size-4" />}
            />
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-[1.6fr_1fr]">
            <article className="rounded-2xl border border-border bg-surface p-5">
              <h2 className="font-semibold">Predictions per day</h2>
              <p className="mt-1 text-xs text-muted">Last 30 days · UTC</p>
              {stats.predictionsPerDay.every((entry) => entry.count === 0) ? (
                <p className="flex h-72 items-center justify-center text-sm text-muted">No predictions in this period.</p>
              ) : (
                <div className="mt-4 h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.predictionsPerDay} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                      <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" />
                      <XAxis dataKey="date" tick={{ fill: 'var(--muted)', fontSize: 11 }} tickFormatter={(date: string) => date.slice(5)} />
                      <YAxis allowDecimals={false} tick={{ fill: 'var(--muted)', fontSize: 11 }} />
                      <Tooltip contentStyle={chartTooltipStyle} />
                      <Line type="monotone" dataKey="count" name="Predictions" stroke="var(--accent)" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </article>
            <article className="rounded-2xl border border-border bg-surface p-5">
              <h2 className="font-semibold">Predictions by class</h2>
              {stats.predictionsByClass.length === 0 ? (
                <p className="flex h-72 items-center justify-center text-sm text-muted">No predictions yet.</p>
              ) : (
                <div className="mt-4 h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.predictionsByClass.map((entry) => ({
                      ...entry,
                      classLabel: FOOD_LABELS[entry.predictedClass as keyof typeof FOOD_LABELS] ?? entry.predictedClass,
                    }))} layout="vertical" margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
                      <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" />
                      <XAxis type="number" allowDecimals={false} tick={{ fill: 'var(--muted)', fontSize: 11 }} />
                      <YAxis type="category" dataKey="classLabel" width={90} tick={{ fill: 'var(--muted)', fontSize: 11 }} />
                      <Tooltip contentStyle={chartTooltipStyle} />
                      <Bar dataKey="count" name="Predictions" fill="var(--accent)" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </article>
          </div>

          <article className="mt-5 rounded-2xl border border-border bg-surface p-5">
            <div>
              <h2 className="font-semibold">Feedback accuracy by predicted class</h2>
              <p className="mt-1 text-xs text-muted">Based on user feedback received for each class.</p>
            </div>
            {stats.feedback.perClassAccuracy.length === 0 ? (
              <p className="mt-5 rounded-xl bg-background px-4 py-5 text-sm text-muted">No feedback yet.</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[460px] text-left text-sm">
                  <thead className="text-xs uppercase tracking-wide text-muted">
                    <tr>
                      <th className="px-3 py-2 font-semibold">Class</th>
                      <th className="px-3 py-2 font-semibold">Feedback</th>
                      <th className="px-3 py-2 font-semibold">Correct</th>
                      <th className="px-3 py-2 font-semibold">Accuracy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.feedback.perClassAccuracy.map((row) => (
                      <tr key={row.predictedClass} className="border-t border-border">
                        <td className="px-3 py-3 font-medium">{FOOD_LABELS[row.predictedClass as keyof typeof FOOD_LABELS] ?? row.predictedClass}</td>
                        <td className="px-3 py-3">{row.total}</td>
                        <td className="px-3 py-3">{row.correct}</td>
                        <td className="px-3 py-3">{percent(row.accuracy)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </article>
        </>
      )}
    </section>
  )
}
