import { cn } from '@/lib/utils'

export function Logo({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-2xl bg-red-600 text-white shadow-sm',
        className
      )}
      style={{ width: size, height: size }}
      aria-label="Stowed"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        width={size * 0.6}
        height={size * 0.6}
      >
        <path
          d="M4 7l8-4 8 4v10l-8 4-8-4V7z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M4 7l8 4 8-4" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M12 11v10" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Logo size={28} />
      <span className="text-base font-bold tracking-tight text-gray-900">Stowed</span>
    </div>
  )
}
