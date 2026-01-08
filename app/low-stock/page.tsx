'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { LowStockItem } from '@/types/database'
import Link from 'next/link'
import { AlertTriangle, Package } from 'lucide-react'

export default function LowStockPage() {
  const [items, setItems] = useState<LowStockItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLowStock()
  }, [])

  const loadLowStock = async () => {
    try {
      const { data, error } = await supabase
        .from('v_low_stock')
        .select('*')
        .order('reorder_deficit', { ascending: false })

      if (error) throw error
      setItems(data || [])
    } catch (error) {
      console.error('Error loading low stock:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Low Stock Items</h1>
          <p className="text-gray-600">
            Items below minimum required quantity - {items.length} items need reordering
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">All items are well stocked!</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-200">
            {items.map((item) => (
              <Link
                key={item.item_id}
                href={`/items/${item.item_id}`}
                className="block p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                    </div>
                    {item.sku && (
                      <p className="text-sm text-gray-600 ml-8">SKU: {item.sku}</p>
                    )}
                  </div>
                  <div className="ml-6 text-right">
                    <div className="text-sm text-gray-600 mb-1">
                      Current: <span className="font-semibold text-gray-900">{item.total_on_hand}</span>
                    </div>
                    <div className="text-sm text-gray-600 mb-1">
                      Minimum: <span className="font-semibold text-gray-900">{item.min_required}</span>
                    </div>
                    <div className="text-lg font-bold text-red-600 mt-2">
                      Order {item.reorder_deficit} more
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}


