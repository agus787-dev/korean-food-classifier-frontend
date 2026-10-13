export type UserRole = 'user' | 'admin'

export interface PublicUser {
  id: string
  email: string
  displayName: string
  role: UserRole
  createdAt: string
}

export interface AuthResponse {
  token: string
  user: PublicUser
}

export interface CurrentUserResponse {
  user: PublicUser
}

export interface RegisterPayload {
  email: string
  password: string
  displayName: string
}

export interface LoginPayload {
  email: string
  password: string
}

export type FoodClass = 'bibimbap' | 'fried_rice'

export interface Prediction {
  id: string
  predictedClass: FoodClass
  confidence: number
  probabilities: Record<FoodClass, number>
  createdAt: string
}

export interface PredictionPage {
  predictions: Prediction[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ApiErrorResponse {
  error: {
    code: string
    message: string
  }
}
