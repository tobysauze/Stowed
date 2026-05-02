'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ChevronRight, Layers, MapPin, AlertTriangle, Tag, LogOut, User as UserIcon } from 'lucide-react'
import { TopBar } from '@/components/ui/TopBar'
import { supabase } from '@/lib/supabase/client'

const menu = [
  { href: '/items', label: 'Items', icon: Layers },
  { href: '/locations', label: 'Locations', icon: MapPin },
  { href: '/low-stock', label: 'Low Stock', icon: AlertTriangle },
  { href: '/categories', label: 'Categories', icon: Tag },
]

export default function MenuPage() {
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null))
  }, [])

  return (
    <div>
      <TopBar title="Menu" />

      <div className="mb-4 flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-4">
        <div className="rounded-full bg-red-100 p-2 text-red-700">
          <UserIcon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs uppercase tracking-wide text-gray-500">Signed in as</div>
          <div className="truncate text-sm font-semibold text-gray-900">{email ?? '—'}</div>
        </div>
      </div>

      <div className="mb-4 rounded-2xl border border-gray-200 bg-white">
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

      <form action="/auth/signout" method="post">
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-700 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </form>
    </div>
  )
}
