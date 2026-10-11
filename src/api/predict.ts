export const FOOD_CLASSES = ['bibimbap', 'fried_rice'] as const

export type FoodClass = (typeof FOOD_CLASSES)[number]

export interface Prediction {
  predicted_class: FoodClass
  confidence: number
  probabilities: Record<FoodClass, number>
}

export type ApiErrorKind =
  | 'configuration'
  | 'network'
  | 'starting'
  | 'validation'
  | 'server'
  | 'invalid-response'

export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly status?: number

  constructor(kind: ApiErrorKind, message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.kind = kind
    this.status = status
  }
}

const API_URL = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, '')

function getApiUrl(): string {
  if (!API_URL) {
    throw new ApiError(
      'configuration',
      'The classifier API URL is not configured. Set VITE_API_URL and restart the app.',
    )
  }

  return API_URL
}

function getHttpError(status: number): ApiError {
  if (status === 400 || status === 415 || status === 422) {
    return new ApiError(
      'validation',
      'The backend could not use this image. Please choose a valid JPG, PNG, or WebP file.',
      status,
    )
  }

  if (status === 413) {
    return new ApiError(
      'validation',
      'This image is larger than the backend allows. Choose a smaller image.',
      status,
    )
  }

  if (status === 502 || status === 503 || status === 504) {
    return new ApiError(
      'starting',
      'The classifier is starting up or temporarily unavailable. Please wait a moment and try again.',
      status,
    )
  }

  return new ApiError(
    'server',
    'The classifier could not complete the request. Please try again shortly.',
    status,
  )
}

async function requestJson(url: string, init?: RequestInit): Promise<unknown> {
  let response: Response

  try {
    response = await fetch(url, init)
  } catch {
    throw new ApiError(
      'network',
      'Could not reach the classifier. Check your connection and try again.',
    )
  }

  if (!response.ok) {
    throw getHttpError(response.status)
  }

  try {
    return (await response.json()) as unknown
  } catch {
    throw new ApiError(
      'invalid-response',
      'The classifier returned an unreadable response. Please try again.',
      response.status,
    )
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isProbability(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1
}

function parsePrediction(value: unknown): Prediction {
  if (!isRecord(value) || !isRecord(value.probabilities)) {
    throw new ApiError(
      'invalid-response',
      'The classifier returned an unexpected response. Please try again.',
    )
  }

  const { predicted_class, confidence, probabilities } = value
  const bibimbap = probabilities.bibimbap
  const friedRice = probabilities.fried_rice

  if (
    (predicted_class !== 'bibimbap' && predicted_class !== 'fried_rice') ||
    !isProbability(confidence) ||
    !isProbability(bibimbap) ||
    !isProbability(friedRice)
  ) {
    throw new ApiError(
      'invalid-response',
      'The classifier returned an unexpected response. Please try again.',
    )
  }

  return {
    predicted_class,
    confidence,
    probabilities: { bibimbap, fried_rice: friedRice },
  }
}

export async function checkApiHealth(): Promise<void> {
  const response = await requestJson(`${getApiUrl()}/health`, {
    signal: AbortSignal.timeout(20_000),
  })

  if (!isRecord(response) || response.status !== 'ok') {
    throw new ApiError(
      'starting',
      'The classifier is starting up or temporarily unavailable. Please try again shortly.',
    )
  }
}

export async function predictImage(file: File): Promise<Prediction> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await requestJson(`${getApiUrl()}/predict`, {
    method: 'POST',
    body: formData,
    signal: AbortSignal.timeout(120_000),
  })

  return parsePrediction(response)
}
