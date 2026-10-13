import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  ImagePlus,
  LoaderCircle,
  RefreshCw,
  Sparkles,
  Upload,
  X,
} from 'lucide-react'
import { ApiError, checkApiHealth, predictImage, type Prediction } from '../api/predict'
import { ResultCard } from './ResultCard'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ACCEPTED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const ACCEPTED_EXTENSIONS = /\.(jpe?g|png|webp)$/i

type HealthState = 'checking' | 'ready' | 'unavailable'

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message
  }

  return 'Something went wrong while classifying this image. Please try again.'
}

function validateImage(file: File): string | undefined {
  if (!ACCEPTED_TYPES.has(file.type) || !ACCEPTED_EXTENSIONS.test(file.name)) {
    return 'Choose a JPG, PNG, or WebP image.'
  }

  if (file.size > MAX_FILE_SIZE) {
    return 'This image is larger than 5 MB. Choose a smaller file.'
  }
}

export function ClassifierPanel() {
  const inputRef = useRef<HTMLInputElement>(null)
  const isSubmittingRef = useRef(false)
  const [selection, setSelection] = useState<{ file: File; previewUrl: string } | null>(null)
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [health, setHealth] = useState<HealthState>('checking')
  const [healthMessage, setHealthMessage] = useState<string | null>(null)

  const file = selection?.file ?? null
  const previewUrl = selection?.previewUrl ?? null

  useEffect(() => {
    return () => {
      if (selection) URL.revokeObjectURL(selection.previewUrl)
    }
  }, [selection])

  useEffect(() => {
    let isActive = true

    void checkApiHealth()
      .then(() => {
        if (isActive) {
          setHealth('ready')
          setHealthMessage(null)
        }
      })
      .catch((reason: unknown) => {
        if (isActive) {
          setHealth('unavailable')
          setHealthMessage(getErrorMessage(reason))
        }
      })

    return () => {
      isActive = false
    }
  }, [])

  const setImage = useCallback((nextFile: File | undefined) => {
    if (!nextFile) return

    const validationMessage = validateImage(nextFile)
    setPrediction(null)
    setError(validationMessage ?? null)
    if (validationMessage) {
      setSelection(null)
      return
    }

    setSelection({ file: nextFile, previewUrl: URL.createObjectURL(nextFile) })
  }, [])

  async function refreshHealth() {
    setHealth('checking')
    setHealthMessage(null)

    try {
      await checkApiHealth()
      setHealth('ready')
    } catch (reason) {
      setHealth('unavailable')
      setHealthMessage(getErrorMessage(reason))
    }
  }

  async function handlePredict() {
    if (!file || isSubmittingRef.current) return

    isSubmittingRef.current = true
    setIsSubmitting(true)
    setError(null)
    setPrediction(null)

    try {
      setPrediction(await predictImage(file))
    } catch (reason) {
      setError(getErrorMessage(reason))
    } finally {
      isSubmittingRef.current = false
      setIsSubmitting(false)
    }
  }

  function removeImage() {
    setSelection(null)
    setPrediction(null)
    setError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  useEffect(() => {
    function handlePaste(event: ClipboardEvent) {
      if (isSubmittingRef.current) return

      const imageItem = Array.from(event.clipboardData?.items ?? []).find((item) =>
        item.type.startsWith('image/'),
      )

      if (imageItem) {
        const pastedFile = imageItem.getAsFile()
        if (pastedFile) {
          event.preventDefault()
          const extension = pastedFile.type === 'image/jpeg' ? 'jpg' : pastedFile.type.split('/')[1]
          setImage(new File([pastedFile], `pasted-image.${extension}`, { type: pastedFile.type }))
        }
      }
    }

    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [setImage])

  const isBusy = isSubmitting || health === 'checking'

  return (
    <section id="classifier" aria-labelledby="classifier-title" className="scroll-mt-8 pb-20">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
        <div className="flex flex-col justify-center">
          <div className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-[#f7e9dc] text-accent dark:bg-[#49332d]">
            <Sparkles aria-hidden="true" className="size-5" />
          </div>
          <h2 id="classifier-title" className="text-3xl font-semibold tracking-tight sm:text-4xl">
            What&apos;s on your plate?
          </h2>
          <p className="mt-3 max-w-md leading-7 text-muted">
            Add a food photo and let the model take a closer look. It knows bibimbap and fried rice.
          </p>
          <div className="mt-6 flex items-center gap-2 text-sm">
            {health === 'ready' ? (
              <>
                <CheckCircle2 aria-hidden="true" className="size-4 text-olive" />
                <span className="text-muted">Classifier is online</span>
              </>
            ) : (
              <>
                <AlertCircle
                  aria-hidden="true"
                  className={`size-4 ${health === 'checking' ? 'text-muted' : 'text-accent'}`}
                />
                <span className="text-muted">
                  {health === 'checking' ? 'Checking the classifier…' : 'Classifier may be unavailable'}
                </span>
                {health !== 'checking' && (
                  <button
                    type="button"
                    onClick={() => void refreshHealth()}
                    className="ml-1 inline-flex items-center gap-1 font-semibold text-accent hover:text-accent-strong"
                  >
                    <RefreshCw aria-hidden="true" className="size-3.5" />
                    Check again
                  </button>
                )}
              </>
            )}
          </div>
          {healthMessage && health !== 'ready' && (
            <p className="mt-2 text-sm leading-6 text-muted" role="status">
              {healthMessage}
            </p>
          )}
        </div>

        <div className="rounded-[1.75rem] border border-border bg-surface p-5 shadow-[0_16px_50px_rgba(64,47,29,0.07)] sm:p-7">
          {!file ? (
            <div
              onDragEnter={(event) => {
                event.preventDefault()
                setIsDragging(true)
              }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={(event) => {
                const relatedTarget = event.relatedTarget
                if (!(relatedTarget instanceof Node) || !event.currentTarget.contains(relatedTarget)) {
                  setIsDragging(false)
                }
              }}
              onDrop={(event) => {
                event.preventDefault()
                setIsDragging(false)
                setImage(event.dataTransfer.files.item(0) ?? undefined)
              }}
              className={`flex min-h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed px-5 py-8 text-center transition ${
                isDragging
                  ? 'border-accent bg-accent/5'
                  : 'border-border bg-background/50 hover:border-accent/50'
              }`}
            >
              <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-surface text-accent shadow-sm">
                {isDragging ? (
                  <Upload aria-hidden="true" className="size-5" />
                ) : (
                  <ImagePlus aria-hidden="true" className="size-5" />
                )}
              </div>
              <p className="text-sm font-semibold">
                {isDragging ? 'Drop your image here' : 'Drag and drop a food photo'}
              </p>
              <p className="mt-1.5 text-xs text-muted">JPG, PNG, or WebP · up to 5 MB</p>
              <input
                ref={inputRef}
                id="food-image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                aria-label="Choose a food image"
                className="sr-only"
                onChange={(event) => {
                  setImage(event.currentTarget.files?.item(0) ?? undefined)
                  event.currentTarget.value = ''
                }}
              />
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold transition hover:border-accent/50 hover:text-accent"
              >
                <Upload aria-hidden="true" className="size-4" />
                Choose an image
              </button>
              <p className="mt-3 text-xs text-muted">You can also paste an image from your clipboard.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
              <div className="relative flex min-h-56 items-center justify-center overflow-hidden rounded-2xl bg-background sm:min-h-72">
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt={`Selected food image: ${file.name}`}
                    className="max-h-80 w-full object-contain"
                  />
                )}
                <button
                  type="button"
                  onClick={removeImage}
                  disabled={isSubmitting}
                  aria-label="Remove selected image"
                  className="absolute right-3 top-3 inline-flex size-9 items-center justify-center rounded-full border border-border bg-surface/95 text-foreground shadow-sm transition hover:text-accent disabled:opacity-50"
                >
                  <X aria-hidden="true" className="size-4" />
                </button>
              </div>
              <div className="flex flex-col justify-center">
                <div className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">
                  Selected image
                </div>
                <p className="mt-2 break-all text-sm font-semibold">{file.name}</p>
                <p className="mt-1 text-xs text-muted">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                <button
                  type="button"
                  onClick={() => void handlePredict()}
                  disabled={isBusy}
                  className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(201,73,45,0.18)] transition hover:-translate-y-0.5 hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {isSubmitting ? (
                    <>
                      <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
                      Analyzing image…
                    </>
                  ) : (
                    <>
                      <Sparkles aria-hidden="true" className="size-4" />
                      Predict food
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mt-5 flex flex-col gap-3 rounded-2xl border border-accent/25 bg-accent/5 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <p className="flex items-start gap-2 text-sm leading-6 text-foreground">
                <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent" />
                {error}
              </p>
              {file && (
                <button
                  type="button"
                  onClick={() => void handlePredict()}
                  disabled={isSubmitting}
                  className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent-strong disabled:opacity-60"
                >
                  <RefreshCw aria-hidden="true" className="size-3.5" />
                  Try again
                </button>
              )}
            </div>
          )}

          {isSubmitting && (
            <div className="mt-5 flex items-center gap-3 rounded-2xl bg-background px-4 py-3 text-sm text-muted" role="status">
              <LoaderCircle aria-hidden="true" className="size-4 animate-spin text-accent" />
              The model is looking at your photo. First requests can take a little longer.
            </div>
          )}

          <div aria-live="polite" aria-atomic="true">
            {prediction && <ResultCard prediction={prediction} />}
          </div>
        </div>
      </div>
    </section>
  )
}
