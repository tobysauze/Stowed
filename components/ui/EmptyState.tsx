import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <div className="rounded-2xl bg-gray-100 p-4 text-gray-400">
        <Icon className="h-8 w-8" />
      </div>
      <div>
        <div className="text-base font-semibold text-gray-900">{title}</div>
        {description ? (
          <div className="mt-1 max-w-xs text-sm text-gray-500">{description}</div>
        ) : null}
      </div>
      {action}
    </div>
  )
}
