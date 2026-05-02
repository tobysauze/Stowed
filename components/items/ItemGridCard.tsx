'use client'

import Link from 'next/link'
import { MoreHorizontal, Package } from 'lucide-react'
import { StockBadge } from '@/components/ui/StockBadge'
import type { ItemListRow } from '@/components/items/ItemCard'

export function ItemGridCard({
  item,
  onOpenMenu,
}: {
  item: ItemListRow
  onOpenMenu: (item: ItemListRow) => void
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <Link href={`/items/${item.id}`} className="block">
        <div className="aspect-square w-full bg-gray-100">
          {item.thumb_url ? (
            <img src={item.thumb_url} alt={item.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-300">
              <Package className="h-10 w-10" />
            </div>
          )}
        </div>
        <div className="p-3">
          <div className="truncate text-sm font-semibold text-gray-900">{item.name}</div>
          <div className="mt-1.5 flex items-center justify-between gap-2">
            <StockBadge
              qty={item.total_on_hand}
              unit={item.unit}
              minRequired={item.min_required}
            />
            {item.sku ? (
              <span className="truncate text-xs text-gray-500">{item.sku}</span>
            ) : null}
          </div>
        </div>
      </Link>
      <button
        onClick={(e) => {
          e.preventDefault()
          onOpenMenu(item)
        }}
        aria-label="Item actions"
        className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-gray-700 shadow-sm hover:bg-white"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
    </div>
  )
}
