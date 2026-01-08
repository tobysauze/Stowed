'use client'

import Link from 'next/link'
import { ChevronRight, Layers, MapPin, AlertTriangle, Tag } from 'lucide-react'
import { TopBar } from '@/components/ui/TopBar'

const menu = [
  { href: '/items', label: 'Items', icon: Layers },
  { href: '/locations', label: 'Locations', icon: MapPin },
  { href: '/low-stock', label: 'Low Stock', icon: AlertTriangle },
  { href: '/categories', label: 'Categories', icon: Tag },
]

export default function MenuPage() {
  return (
    <div>
      <TopBar title="Menu" />
      <div className="rounded-2xl border border-gray-200 bg-white">
        {menu.map((m) => {
          const Icon = m.icon
          return (
            <Link
              key={m.href}
              href={m.href}
              className="flex items-center justify-between border-b border-gray-100 px-4 py-4 last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-gray-100 p-2 text-gray-700">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-sm font-semibold text-gray-900">{m.label}</div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}


