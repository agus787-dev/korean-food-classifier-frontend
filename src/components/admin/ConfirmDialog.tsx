import { useEffect, useRef } from 'react'

interface ConfirmDialogProps {
  title: string
  message: string
  confirmLabel: string
  busy?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)
  const onCancelRef = useRef(onCancel)
  const busyRef = useRef(busy)

  useEffect(() => {
    onCancelRef.current = onCancel
    busyRef.current = busy
  }, [busy, onCancel])

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    cancelRef.current?.focus()
    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape' && !busyRef.current) onCancelRef.current()
      if (event.key === 'Tab') {
        const dialog = document.getElementById('admin-confirm-dialog')
        const buttons = dialog?.querySelectorAll<HTMLButtonElement>('button:not([disabled])')
        if (!buttons?.length) return
        const first = buttons[0]
        const last = buttons[buttons.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      previousFocus?.focus()
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
      <section
        id="admin-confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="admin-confirm-title"
        aria-describedby="admin-confirm-message"
        className="w-full max-w-md rounded-[1.5rem] border border-border bg-surface p-6 shadow-2xl"
      >
        <h2 id="admin-confirm-title" className="text-xl font-semibold">{title}</h2>
        <p id="admin-confirm-message" className="mt-2 text-sm leading-6 text-muted">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            ref={cancelRef}
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="min-h-10 rounded-full border border-border px-4 text-sm font-semibold disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className="min-h-10 rounded-full bg-accent px-4 text-sm font-semibold text-white disabled:opacity-60"
          >
            {busy ? 'Saving…' : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  )
}
