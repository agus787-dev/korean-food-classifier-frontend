import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import * as authApi from '../api/auth'
import { AUTH_TOKEN_KEY } from '../api/client'
import type { PublicUser, RegisterPayload } from '../types/api'
import { AuthContext } from './context'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<PublicUser | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(AUTH_TOKEN_KEY))
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem(AUTH_TOKEN_KEY)))

  useEffect(() => {
    let isMounted = true

    if (!token) return

    void authApi
      .getCurrentUser()
      .then((currentUser) => {
        if (isMounted) setUser(currentUser)
      })
      .catch(() => {
        if (isMounted) {
          setUser(null)
          if (localStorage.getItem(AUTH_TOKEN_KEY) !== token) setToken(null)
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [token])

  const acceptAuthResponse = useCallback((result: { token: string; user: PublicUser }) => {
    localStorage.setItem(AUTH_TOKEN_KEY, result.token)
    setToken(result.token)
    setUser(result.user)
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      acceptAuthResponse(await authApi.login({ email, password }))
    },
    [acceptAuthResponse],
  )

  const register = useCallback(
    async (payload: RegisterPayload) => {
      acceptAuthResponse(await authApi.register(payload))
    },
    [acceptAuthResponse],
  )

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout }),
    [user, token, loading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
