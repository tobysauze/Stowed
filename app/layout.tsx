import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Toaster } from 'sonner'
import { BottomNav } from '@/components/navigation'

export const metadata: Metadata = {
  title: 'Stowed — Inventory',
  description: 'A clean, modern inventory app for boats, vans and small teams.',
  applicationName: 'Stowed',
  appleWebApp: { title: 'Stowed', capable: true, statusBarStyle: 'default' },
}

export const viewport: Viewport = {
  themeColor: '#dc2626',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="min-h-screen bg-gray-50">
          <main className="mx-auto w-full max-w-3xl px-4 pt-4 pb-24">
            {children}
          </main>
          <BottomNav />
          <Toaster position="top-center" richColors closeButton />
        </div>
      </body>
    </html>
  )
}
