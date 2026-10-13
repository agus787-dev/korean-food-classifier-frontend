import { request, requestBlob } from './client'
import type {
  AdminFeedbackPage,
  AdminPredictionPage,
  AdminStats,
  AdminUser,
  AdminUserPage,
  UserRole,
} from '../types/api'

export function getAdminStats(signal?: AbortSignal): Promise<AdminStats> {
  return request<AdminStats>('/api/admin/stats', { signal })
}

export function getAdminUsers(
  params: URLSearchParams,
  signal?: AbortSignal,
): Promise<AdminUserPage> {
  return request<AdminUserPage>(`/api/admin/users?${params}`, { signal })
}

export function changeUserRole(id: string, role: UserRole): Promise<AdminUser> {
  return request<AdminUser>(`/api/admin/users/${encodeURIComponent(id)}/role`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  })
}

export function getAdminPredictions(
  params: URLSearchParams,
  signal?: AbortSignal,
): Promise<AdminPredictionPage> {
  return request<AdminPredictionPage>(`/api/admin/predictions?${params}`, { signal })
}

export function getAdminFeedback(
  params: URLSearchParams,
  signal?: AbortSignal,
): Promise<AdminFeedbackPage> {
  return request<AdminFeedbackPage>(`/api/admin/feedback?${params}`, { signal })
}

export async function exportAdminFeedback(isCorrect?: boolean): Promise<Blob> {
  const query = new URLSearchParams()
  if (isCorrect !== undefined) query.set('isCorrect', String(isCorrect))
  return requestBlob(`/api/admin/feedback/export.csv${query.size ? `?${query}` : ''}`)
}
