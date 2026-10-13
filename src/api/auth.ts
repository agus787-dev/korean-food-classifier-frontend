import { request } from './client'
import type {
  AuthResponse,
  CurrentUserResponse,
  LoginPayload,
  PublicUser,
  RegisterPayload,
} from '../types/api'

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  return request<AuthResponse>(
    '/api/auth/register',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
    { authenticated: false },
  )
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  return request<AuthResponse>(
    '/api/auth/login',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
    { authenticated: false },
  )
}

export async function getCurrentUser(): Promise<PublicUser> {
  const response = await request<CurrentUserResponse>('/api/auth/me')
  return response.user
}
