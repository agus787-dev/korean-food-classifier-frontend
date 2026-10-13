import { useEffect, useRef, useState } from 'react'
import { ImageOff } from 'lucide-react'
import { getPredictionImage } from '../api/predictions'

interface AuthImageProps {
  predictionId: string
  alt: string
  className?: string
  hasImage?: boolean
}

interface ImageState {
  predictionId: string
  status: 'loading' | 'loaded' | 'failed'
  objectUrl?: string
}

export function AuthImage({
  predictionId,
  alt,
  className = '',
  hasImage = true,
}: AuthImageProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [imageState, setImageState] = useState<ImageState | null>(null)

  useEffect(() => {
    if (!hasImage || !containerRef.current) return

    const container = containerRef.current
    let isActive = true
    let objectUrl: string | undefined
    let observer: IntersectionObserver | undefined

    const load = () => {
      setImageState({ predictionId, status: 'loading' })
      void getPredictionImage(predictionId)
        .then((blob) => {
          if (!isActive) return
          objectUrl = URL.createObjectURL(blob)
          setImageState({ predictionId, status: 'loaded', objectUrl })
        })
        .catch(() => {
          if (isActive) setImageState({ predictionId, status: 'failed' })
        })
    }

    if (typeof IntersectionObserver === 'undefined') {
      load()
    } else {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            observer?.disconnect()
            load()
          }
        },
        { rootMargin: '160px' },
      )
      observer.observe(container)
    }

    return () => {
      isActive = false
      observer?.disconnect()
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [hasImage, predictionId])

  const currentImage = imageState?.predictionId === predictionId ? imageState : null

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden bg-background ${className}`}
    >
      {!hasImage || currentImage?.status === 'failed' ? (
        <span
          className="flex size-full min-h-16 items-center justify-center text-muted"
          role="img"
          aria-label={alt}
        >
          <ImageOff className="size-6" />
        </span>
      ) : currentImage?.status === 'loaded' && currentImage.objectUrl ? (
        <img src={currentImage.objectUrl} alt={alt} className="size-full object-cover" />
      ) : (
        <span className="absolute inset-0 animate-pulse bg-border/60" role="status" aria-label="Loading image" />
      )}
    </div>
  )
}
