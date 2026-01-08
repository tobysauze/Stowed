import type { Metadata } from 'next'
import './globals.css'
import { BottomNav } from '@/components/navigation'

export const metadata: Metadata = {
  title: 'YachtOps Inventory',
  description: 'Superyacht inventory management system',
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
        </div>
      </body>
    </html>
  )
}


