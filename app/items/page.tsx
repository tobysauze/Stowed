'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Plus, ScanLine, FolderPlus, ArrowUpDown, Search } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { TopBar } from '@/components/ui/TopBar'
import { Fab } from '@/components/ui/Fab'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { ItemCard, type ItemListRow } from '@/components/items/ItemCard'

type SortMode = 'name' | 'updated'

export default function ItemsPage() {
  const [items, setItems] = useState<ItemListRow[]>([])
  const [loading, setLoading] = useState(true)
  const [sortMode, setSortMode] = useState<SortMode>('name')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [sortSheetOpen, setSortSheetOpen] = useState(false)
  const [activeItem, setActiveItem] = useState<ItemListRow | null>(null)
  const [itemSheetOpen, setItemSheetOpen] = useState(false)

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortMode])

  const stats = useMemo(() => {
    const totalQty = items.reduce((sum, i) => sum + (i.total_on_hand || 0), 0)
    return {
      folders: 0, // placeholder until we implement folders/virtual grouping
      items: items.length,
      totalQty,
    }
  }, [items])

  const load = async () => {
    setLoading(true)
    try {
      const orderCol = sortMode === 'updated' ? 'updated_at' : 'name'
      const { data, error } = await supabase
        .from('item')
        .select(
          `
          id, name, sku, unit, updated_at,
          stock (qty_on_hand),
          attachment (file_url, type)
        `
        )
        .order(orderCol, { ascending: true })
        .limit(200)

      if (error) throw error

      const mapped: ItemListRow[] = (data || []).map((it: any) => {
        const totalOnHand =
          it.stock?.reduce((sum: number, s: any) => sum + (s.qty_on_hand || 0), 0) || 0
        const thumb = it.attachment?.find((a: any) => a.type === 'photo')?.file_url || it.attachment?.[0]?.file_url
        return {
          id: it.id,
          name: it.name,
          sku: it.sku,
          unit: it.unit || 'ea',
          total_on_hand: totalOnHand,
          updated_at: it.updated_at,
          thumb_url: thumb || null,
          tags: [],
        }
      })

      setItems(mapped)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const openItemMenu = (it: ItemListRow) => {
    setActiveItem(it)
    setItemSheetOpen(true)
  }

  return (
    <div>
      <TopBar
        title="Items"
        right={
          <div className="flex items-center gap-1">
            <Link
              href="/search"
              className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Link>
            <button
              onClick={() => setSortSheetOpen(true)}
              className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
              aria-label="Sort"
            >
              <ArrowUpDown className="h-5 w-5" />
            </button>
          </div>
        }
      />

      {/* Stats header like the screenshots */}
      <div className="mb-4 rounded-2xl border border-gray-200 bg-white px-4 py-3">
        <div className="grid grid-cols-4 gap-2 text-xs text-gray-500">
          <div>
            <div className="uppercase tracking-wide">Folders</div>
            <div className="mt-1 text-base font-semibold text-gray-900">{stats.folders}</div>
          </div>
          <div>
            <div className="uppercase tracking-wide">Items</div>
            <div className="mt-1 text-base font-semibold text-gray-900">{stats.items}</div>
          </div>
          <div>
            <div className="uppercase tracking-wide">Total Qty</div>
            <div className="mt-1 text-base font-semibold text-gray-900">{stats.totalQty}</div>
          </div>
          <div>
            <div className="uppercase tracking-wide">Total Value</div>
            <div className="mt-1 text-base font-semibold text-gray-400">—</div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white px-4">
        <div className="flex items-center justify-between py-3 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4" />
            <span className="capitalize">{sortMode === 'updated' ? 'Last Updated' : 'Name'}</span>
          </div>
          <button
            onClick={() => setSortSheetOpen(true)}
            className="rounded-lg px-2 py-1 hover:bg-gray-50"
          >
            Change
          </button>
        </div>
        {loading ? (
          <div className="py-10 text-center text-gray-500">Loading…</div>
        ) : items.length === 0 ? (
          <div className="py-10 text-center text-gray-500">No items yet</div>
        ) : (
          items.map((it) => <ItemCard key={it.id} item={it} onOpenMenu={openItemMenu} />)
        )}
      </div>

      {/* Floating + like screenshots */}
      <Fab ariaLabel="Add" onClick={() => setSheetOpen(true)}>
        <Plus className="h-6 w-6" />
      </Fab>

      {/* Add menu sheet */}
      <BottomSheet open={sheetOpen} title="Adding to: Items" onClose={() => setSheetOpen(false)}>
        <div className="space-y-3 pb-2">
          <Link
            href="/items/new"
            className="flex w-full items-center gap-3 rounded-2xl bg-red-600 px-4 py-4 text-white"
            onClick={() => setSheetOpen(false)}
          >
            <div className="rounded-xl bg-white/15 p-2">
              <Plus className="h-5 w-5" />
            </div>
            <div className="text-base font-semibold">Add Item</div>
          </Link>

          <Link
            href="/scan"
            className="flex w-full items-center gap-3 rounded-2xl bg-red-600 px-4 py-4 text-white"
            onClick={() => setSheetOpen(false)}
          >
            <div className="rounded-xl bg-white/15 p-2">
              <ScanLine className="h-5 w-5" />
            </div>
            <div className="text-base font-semibold">Add Item via Scan</div>
          </Link>

          <button
            className="flex w-full items-center gap-3 rounded-2xl bg-red-600 px-4 py-4 text-white"
            onClick={() => {
              setSheetOpen(false)
              window.location.href = '/locations/new'
            }}
          >
            <div className="rounded-xl bg-white/15 p-2">
              <FolderPlus className="h-5 w-5" />
            </div>
            <div className="text-base font-semibold">Add Folder (Location)</div>
          </button>
        </div>
      </BottomSheet>

      {/* Sort sheet */}
      <BottomSheet open={sortSheetOpen} title="Sort by" onClose={() => setSortSheetOpen(false)}>
        <div className="space-y-2">
          <button
            className="w-full rounded-xl px-4 py-3 text-left hover:bg-gray-50"
            onClick={() => {
              setSortMode('name')
              setSortSheetOpen(false)
            }}
          >
            <div className="text-sm font-semibold text-gray-900">Name</div>
          </button>
          <button
            className="w-full rounded-xl px-4 py-3 text-left hover:bg-gray-50"
            onClick={() => {
              setSortMode('updated')
              setSortSheetOpen(false)
            }}
          >
            <div className="text-sm font-semibold text-gray-900">Last Updated</div>
          </button>
        </div>
      </BottomSheet>

      {/* Item actions sheet (stubs) */}
      <BottomSheet
        open={itemSheetOpen}
        title={activeItem?.name || 'Item'}
        onClose={() => setItemSheetOpen(false)}
      >
        <div className="space-y-1">
          <Link
            href={activeItem ? `/items/${activeItem.id}` : '#'}
            className="block rounded-xl px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50"
            onClick={() => setItemSheetOpen(false)}
          >
            Details
          </Link>
          <Link
            href={activeItem ? `/items/${activeItem.id}/history` : '#'}
            className="block rounded-xl px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50"
            onClick={() => setItemSheetOpen(false)}
          >
            History
          </Link>
          <button
            className="w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-gray-900 hover:bg-gray-50"
            onClick={() => alert('Export coming next')}
          >
            Export
          </button>
          <button
            className="w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-gray-900 hover:bg-gray-50"
            onClick={() => alert('Clone coming next')}
          >
            Clone
          </button>
          <button
            className="w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
            onClick={() => alert('Delete coming next')}
          >
            Delete
          </button>
        </div>
      </BottomSheet>
    </div>
  )
}


