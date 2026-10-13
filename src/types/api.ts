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

export interface PredictionFeedback {
  isCorrect: boolean
  correctClass?: string
}

export interface SavedFeedback extends PredictionFeedback {
  id: string
  predictionId: string
  userId: string
  createdAt: string
}

export type SaveFeedbackPayload =
  | { isCorrect: true }
  | { isCorrect: false; correctClass: string }

export interface Prediction {
  id: string
  predictedClass: FoodClass
  confidence: number
  probabilities: Record<FoodClass, number>
  createdAt: string
  hasImage: boolean
  imageUrl: string | null
  feedback: PredictionFeedback | null
}

export interface PredictionPage {
  predictions: Prediction[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface AdminPrediction extends Prediction {
  user: {
    email: string
    displayName: string
  }
}

export interface AdminStats {
  totalUsers: number
  totalPredictions: number
  predictionsPerDay: Array<{ date: string; count: number }>
  predictionsByClass: Array<{ predictedClass: string; count: number }>
  averageConfidence: number | null
  feedback: {
    total: number
    correct: number
    incorrect: number
    accuracy: number | null
    perClassAccuracy: Array<{
      predictedClass: string
      total: number
      correct: number
      accuracy: number | null
    }>
  }
}

export interface AdminUser {
  id: string
  email: string
  displayName: string
  role: UserRole
  createdAt: string
  predictionsCount: number
}

export interface AdminUserPage {
  users: AdminUser[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface AdminPredictionPage {
  predictions: AdminPrediction[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface AdminFeedback {
  predictionId: string
  userEmail: string
  predictedClass: string
  confidence: number
  isCorrect: boolean
  correctClass: string | null
  createdAt: string
}

export interface AdminFeedbackPage {
  feedback: AdminFeedback[]
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
