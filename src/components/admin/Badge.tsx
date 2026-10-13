import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  tone?: 'neutral' | 'success' | 'danger' | 'accent'
}

export function Badge({ children, tone = 'neutral' }: BadgeProps) {
  const styles = {
    neutral: 'bg-background text-muted',
    success: 'bg-[#eaf0e3] text-olive dark:bg-[#303a2a]',
    danger: 'bg-accent/10 text-accent',
    accent: 'bg-accent/10 text-accent',
  }

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${styles[tone]}`}>
      {children}
    </span>
  )
}
