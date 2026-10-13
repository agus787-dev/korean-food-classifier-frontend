import { request, requestBlob } from './client'
import type {
  FoodClass,
  Prediction,
  PredictionPage,
  SaveFeedbackPayload,
  SavedFeedback,
} from '../types/api'

const useMock = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true'
const imageBlobCache = new Map<string, Promise<Blob>>()

export async function createPrediction(file: File, signal: AbortSignal): Promise<Prediction> {
  if (useMock) {
    await new Promise<void>((resolve, reject) => {
      const timeout = window.setTimeout(resolve, 800)
      signal.addEventListener(
        'abort',
        () => {
          window.clearTimeout(timeout)
          reject(new DOMException('The request was aborted.', 'AbortError'))
        },
        { once: true },
      )
    })
    const predictedClass: FoodClass = 'bibimbap'
    return {
      id: `mock-${Date.now()}`,
      predictedClass,
      confidence: 0.91,
      probabilities: { bibimbap: 0.91, fried_rice: 0.09 },
      createdAt: new Date().toISOString(),
      hasImage: false,
      imageUrl: null,
      feedback: null,
    }
  }

  const body = new FormData()
  body.append('file', file)
  return request<Prediction>(
    '/api/predictions',
    { method: 'POST', body, signal },
  )
}

export function getPredictions(
  page = 1,
  limit = 20,
  signal?: AbortSignal,
): Promise<PredictionPage> {
  const query = new URLSearchParams({ page: String(page), limit: String(limit) })
  return request<PredictionPage>(`/api/predictions?${query}`, { signal })
}

export function getPredictionImage(id: string): Promise<Blob> {
  const cachedBlob = imageBlobCache.get(id)
  if (cachedBlob) return cachedBlob

  const imageRequest = requestBlob(`/api/predictions/${encodeURIComponent(id)}/image`).catch(
    (error: unknown) => {
      imageBlobCache.delete(id)
      throw error
    },
  )
  imageBlobCache.set(id, imageRequest)
  return imageRequest
}

export async function deletePrediction(id: string): Promise<void> {
  await request<void>(`/api/predictions/${encodeURIComponent(id)}`, { method: 'DELETE' })
  imageBlobCache.delete(id)
}

export function saveFeedback(
  predictionId: string,
  body: SaveFeedbackPayload,
): Promise<SavedFeedback> {
  return request<SavedFeedback>(`/api/predictions/${encodeURIComponent(predictionId)}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export async function deleteFeedback(predictionId: string): Promise<void> {
  await request<void>(`/api/predictions/${encodeURIComponent(predictionId)}/feedback`, {
    method: 'DELETE',
  })
}
