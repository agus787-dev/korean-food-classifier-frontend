const API_BASE_URL = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, '')
export const AUTH_TOKEN_KEY = 'hansik-auth-token'

export class ApiError extends Error {
  readonly code: string
  readonly status: number

  constructor(code: string, message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
  }
}

function getApiUrl(path: string): string {
  if (!API_BASE_URL) {
    throw new ApiError(
      'API_NOT_CONFIGURED',
      'The backend URL is not configured. Set VITE_API_URL and restart the app.',
      0,
    )
  }

  return `${API_BASE_URL}${path}`
}

function isErrorResponse(value: unknown): value is { error: { code: string; message: string } } {
  if (typeof value !== 'object' || value === null || !('error' in value)) return false
  const error = value.error
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string' &&
    'message' in error &&
    typeof error.message === 'string'
  )
}

function redirectAfterUnauthorized(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY)
  const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash}`
  const loginUrl = new URL('/login', window.location.origin)
  if (returnTo !== '/login' && !returnTo.startsWith('/login?')) {
    loginUrl.searchParams.set('returnTo', returnTo)
  }
  window.location.assign(`${loginUrl.pathname}${loginUrl.search}`)
}

export async function request<T>(
  path: string,
  init: RequestInit = {},
  options: { authenticated?: boolean } = {},
): Promise<T> {
  const headers = new Headers(init.headers)
  const token = localStorage.getItem(AUTH_TOKEN_KEY)
  if (options.authenticated !== false && token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  let response: Response
  try {
    response = await fetch(getApiUrl(path), { ...init, headers })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new ApiError('NETWORK_ERROR', 'Could not reach the backend. Check your connection.', 0)
  }

  if (!response.ok) {
    let payload: unknown
    try {
      payload = await response.json()
    } catch {
      payload = null
    }

    const apiError = isErrorResponse(payload)
      ? new ApiError(payload.error.code, payload.error.message, response.status)
      : new ApiError('REQUEST_FAILED', 'The request could not be completed.', response.status)

    if (response.status === 401 && options.authenticated !== false && token) {
      redirectAfterUnauthorized()
    }

    throw apiError
  }

  if (response.status === 204) return undefined as T

  try {
    return (await response.json()) as T
  } catch {
    throw new ApiError('INVALID_RESPONSE', 'The backend returned an unreadable response.', response.status)
  }
}
