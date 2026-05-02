import { cn } from '@/lib/utils'

export function StockBadge({
  qty,
  unit = 'ea',
  minRequired,
  className,
}: {
  qty: number
  unit?: string
  minRequired?: number | null
  className?: string
}) {
  const min = minRequired ?? 0
  let tone: 'out' | 'low' | 'ok' = 'ok'
  if (qty <= 0) tone = 'out'
  else if (min > 0 && qty < min) tone = 'low'

  const styles = {
    out: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-200',
    low: 'bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200',
    ok: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200',
  }[tone]

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold tabular-nums',
        styles,
        className
      )}
    >
      {qty} {unit}
    </span>
  )
}
