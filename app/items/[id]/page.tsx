'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ItemWithDetails, Category, Location, Stock } from '@/types/database'
import { Plus, Minus, Edit, Camera, MapPin, Trash2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/Skeleton'
import { StockBadge } from '@/components/ui/StockBadge'

export default function ItemDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [item, setItem] = useState<ItemWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [adjusting, setAdjusting] = useState(false)
  const [adjustForm, setAdjustForm] = useState({
    location_id: '',
    delta: 0,
    reason: '',
  })
  const [locations, setLocations] = useState<Location[]>([])

  useEffect(() => {
    loadItem()
    loadLocations()
  }, [params.id])

  const loadItem = async () => {
    try {
      const { data, error } = await supabase
        .from('item')
        .select(`
          *,
          category:category_id (*),
          stock (
            *,
            location:location_id (*)
          ),
          attachment (*)
        `)
        .eq('id', params.id)
        .single()

      if (error) throw error

      // Calculate totals
      const totalOnHand = (data.stock || []).reduce((sum: number, s: any) => sum + (s.qty_on_hand || 0), 0)
      const reorderDeficit = Math.max(data.min_required - totalOnHand, 0)

      setItem({
        ...data,
        total_on_hand: totalOnHand,
        reorder_deficit: reorderDeficit,
      })
    } catch (error) {
      console.error('Error loading item:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadLocations = async () => {
    const { data } = await supabase
      .from('location')
      .select('*')
      .order('name')
    setLocations(data || [])
  }

  const handleAdjustStock = async () => {
    if (!adjustForm.location_id || adjustForm.delta === 0) return

    setAdjusting(true)
    try {
      const { error } = await supabase.rpc('adjust_stock', {
        p_item_id: parseInt(params.id),
        p_location_id: parseInt(adjustForm.location_id),
        p_delta: adjustForm.delta,
        p_reason: adjustForm.reason || 'manual adjustment',
      })

      if (error) throw error

      // Reset form and reload
      setAdjustForm({ location_id: '', delta: 0, reason: '' })
      loadItem()
    } catch (error: any) {
      console.error('Error adjusting stock:', error)
      toast.error('Failed to adjust stock: ' + error.message)
    } finally {
      setAdjusting(false)
    }
  }

  const handleUpdateMinRequired = async (newMin: number) => {
    try {
      const { error } = await supabase
        .from('item')
        .update({ min_required: newMin })
        .eq('id', params.id)

      if (error) throw error
      loadItem()
    } catch (error: any) {
      console.error('Error updating min required:', error)
      toast.error('Failed to update minimum required: ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    )
  }

  if (!item) {
    return <div className="text-center py-12 text-gray-500">Item not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{item.name}</h1>
          <div className="flex flex-wrap gap-2 text-sm text-gray-600">
            {item.sku && <span className="bg-gray-100 px-2 py-1 rounded">SKU: {item.sku}</span>}
            {item.mfg_part_no && <span className="bg-gray-100 px-2 py-1 rounded">Part: {item.mfg_part_no}</span>}
            {item.manufacturer && <span className="bg-gray-100 px-2 py-1 rounded">{item.manufacturer}</span>}
          </div>
        </div>
        <button
          onClick={() => router.push(`/items/${params.id}/edit`)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Edit className="h-4 w-4" />
          <span>Edit</span>
        </button>
      </div>

      {item.description && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-gray-700">{item.description}</p>
        </div>
      )}

      {/* Images */}
      {item.attachment && item.attachment.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-lg font-semibold mb-4">Photos</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {item.attachment.map((att) => (
              <div key={att.id} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={att.file_url}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stock Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-1">Total On Hand</div>
          <div className="text-3xl font-bold text-gray-900">{item.total_on_hand || 0}</div>
          <div className="text-sm text-gray-500 mt-1">{item.unit}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-1">Minimum Required</div>
          <div className="text-3xl font-bold text-gray-900">{item.min_required}</div>
          <div className="text-sm text-gray-500 mt-1">{item.unit}</div>
        </div>
        <div className={`rounded-lg border p-6 ${item.reorder_deficit && item.reorder_deficit > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
          <div className="text-sm text-gray-600 mb-1">Reorder Deficit</div>
          <div className={`text-3xl font-bold ${item.reorder_deficit && item.reorder_deficit > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {item.reorder_deficit || 0}
          </div>
          <div className="text-sm text-gray-500 mt-1">{item.unit}</div>
        </div>
      </div>

      {/* Stock by Location */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Stock by Location</h2>
        {item.stock && item.stock.length > 0 ? (
          <div className="space-y-2">
            {item.stock.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between p-3 border border-gray-200 rounded">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{s.location?.name || 'Unknown'}</span>
                </div>
                <span className="text-lg font-semibold">{s.qty_on_hand} {item.unit}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No stock recorded in any location</p>
        )}
      </div>

      {/* Adjust Stock */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Adjust Stock</h2>
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select
              value={adjustForm.location_id}
              onChange={(e) => setAdjustForm({ ...adjustForm, location_id: e.target.value })}
              className="rounded-xl border border-gray-300 px-3 py-2.5 focus:border-red-500 focus:ring-2 focus:ring-red-200"
            >
              <option value="">Select Location</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={adjustForm.reason}
              onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
              placeholder="Reason (optional)"
              className="rounded-xl border border-gray-300 px-3 py-2.5 focus:border-red-500 focus:ring-2 focus:ring-red-200"
            />
          </div>
          <div className="flex items-center justify-center gap-3 rounded-xl bg-gray-50 p-3">
            <button
              type="button"
              aria-label="Decrease"
              onClick={() => setAdjustForm({ ...adjustForm, delta: adjustForm.delta - 1 })}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-gray-100 active:scale-95"
            >
              <Minus className="h-5 w-5" />
            </button>
            <input
              type="number"
              value={adjustForm.delta || ''}
              onChange={(e) =>
                setAdjustForm({ ...adjustForm, delta: parseInt(e.target.value) || 0 })
              }
              placeholder="0"
              className="w-24 rounded-xl border border-gray-300 px-3 py-2 text-center text-lg font-semibold tabular-nums focus:border-red-500 focus:ring-2 focus:ring-red-200"
            />
            <button
              type="button"
              aria-label="Increase"
              onClick={() => setAdjustForm({ ...adjustForm, delta: adjustForm.delta + 1 })}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-gray-100 active:scale-95"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
          <button
            onClick={handleAdjustStock}
            disabled={adjusting || !adjustForm.location_id || adjustForm.delta === 0}
            className="w-full rounded-xl bg-red-600 px-4 py-2.5 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {adjusting
              ? 'Applying…'
              : adjustForm.delta === 0
                ? 'Set quantity change'
                : adjustForm.delta > 0
                  ? `Add ${adjustForm.delta} ${item.unit}`
                  : `Remove ${Math.abs(adjustForm.delta)} ${item.unit}`}
          </button>
        </div>
      </div>

      {/* Update Minimum Required */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Minimum Required</h2>
        <div className="flex items-center space-x-4">
          <input
            type="number"
            value={item.min_required}
            onChange={(e) => {
              const newMin = parseFloat(e.target.value) || 0
              handleUpdateMinRequired(newMin)
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 w-32"
          />
          <span className="text-gray-600">{item.unit}</span>
        </div>
      </div>

      <button
        onClick={async () => {
          const ok = window.confirm(`Delete "${item.name}"? This cannot be undone.`)
          if (!ok) return
          const { error } = await supabase.from('item').delete().eq('id', params.id)
          if (error) {
            toast.error('Delete failed: ' + error.message)
            return
          }
          toast.success(`Deleted "${item.name}"`)
          router.push('/items')
        }}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-700 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" />
        Delete item
      </button>
    </div>
  )
}

