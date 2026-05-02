'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid, Package, Search, Bell, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/items', label: 'Items', icon: Package },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/low-stock', label: 'Alerts', icon: Bell },
  { href: '/locations', label: 'Locations', icon: LayoutGrid },
  { href: '/menu', label: 'Menu', icon: Menu },
]

const HIDDEN_ON = ['/login', '/signup', '/auth']

export function BottomNav() {
  const pathname = usePathname()

  if (pathname && HIDDEN_ON.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return null
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto w-full max-w-3xl px-2">
        <div className="grid grid-cols-5 py-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 rounded-lg px-2 py-1 text-xs font-medium',
                  isActive ? 'text-red-600' : 'text-gray-500 hover:text-gray-900'
                )}
              >
                <Icon className={cn('h-5 w-5', isActive ? 'text-red-600' : 'text-gray-500')} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

