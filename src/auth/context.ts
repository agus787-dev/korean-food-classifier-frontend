import { createContext } from 'react'
import type { RegisterPayload, PublicUser } from '../types/api'

export interface AuthContextValue {
  user: PublicUser | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
