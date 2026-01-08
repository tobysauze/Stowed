'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, Barcode } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { Fab } from '@/components/ui/Fab'
import { TopBar } from '@/components/ui/TopBar'
import { ItemWithDetails } from '@/types/database'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ItemWithDetails[]>([])
  const [loading, setLoading] = useState(false)
  const codeFromUrl =
    typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('code') || '' : ''

  const placeholder = useMemo(() => 'Search items, SKU, part #, barcode…', [])

  const handleSearch = async (q: string) => {
    setQuery(q)
    if (!q.trim()) {
      setResults([])
      return
    }
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('item')
        .select(
          `
          *,
          stock (qty_on_hand),
          attachment (file_url)
        `
        )
        .or(
          `name.ilike.%${q}%,sku.ilike.%${q}%,mfg_part_no.ilike.%${q}%,barcode.ilike.%${q}%`
        )
        .limit(50)

      if (error) throw error

      const itemsWithTotals = (data || []).map((item: any) => {
        const totalOnHand =
          item.stock?.reduce((sum: number, s: any) => sum + (s.qty_on_hand || 0), 0) || 0
        const reorderDeficit = Math.max((item.min_required || 0) - totalOnHand, 0)
        return {
          ...item,
          total_on_hand: totalOnHand,
          reorder_deficit: reorderDeficit,
        }
      })

      setResults(itemsWithTotals)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (codeFromUrl && !query) {
      handleSearch(codeFromUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codeFromUrl])

  return (
    <div>
      <TopBar
        title="Search"
        right={
          <Link
            href="/scan"
            className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
            aria-label="Scan barcode"
          >
            <Barcode className="h-5 w-5" />
          </Link>
        }
      />

      <div className="relative mb-4">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={placeholder}
          className="block w-full rounded-2xl border border-gray-200 bg-white py-3 pl-10 pr-3 text-base shadow-sm focus:border-red-500 focus:ring-2 focus:ring-red-200"
        />
      </div>

      {loading ? <div className="py-10 text-center text-gray-500">Searching…</div> : null}

      {!loading && !query ? (
        <div className="mt-10 flex flex-col items-center justify-center gap-3 text-center">
          <div className="h-44 w-44 rounded-full bg-gray-100" />
          <div className="text-lg font-semibold text-gray-900">Nothing to see here</div>
          <div className="max-w-xs text-sm text-gray-500">
            Enter text to start your search, or scan a barcode.
          </div>
        </div>
      ) : null}

      {!loading && query && results.length === 0 ? (
        <div className="py-10 text-center text-gray-500">No results</div>
      ) : null}

      {results.length ? (
        <div className="rounded-2xl border border-gray-200 bg-white">
          {results.map((r: any) => {
            const thumb = r.attachment?.[0]?.file_url
            return (
              <Link
                key={r.id}
                href={`/items/${r.id}`}
                className="flex gap-3 border-b border-gray-100 p-4 last:border-b-0"
              >
                <div className="h-12 w-12 overflow-hidden rounded-xl bg-gray-100">
                  {thumb ? (
                    <img src={thumb} alt={r.name} className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-gray-900">{r.name}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">
                      {r.total_on_hand || 0} {r.unit}
                    </span>
                    {r.reorder_deficit > 0 ? (
                      <span className="text-xs font-semibold text-red-600">
                        Need {r.reorder_deficit} more
                      </span>
                    ) : null}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      ) : null}

      <Fab ariaLabel="Scan barcode" onClick={() => (window.location.href = '/scan')}>
        <Barcode className="h-6 w-6" />
      </Fab>
    </div>
  )
}


