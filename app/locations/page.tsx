'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Location, LocationWithChildren } from '@/types/database'
import Link from 'next/link'
import { ChevronRight, Plus, Trash2, MapPin } from 'lucide-react'

export default function LocationsPage() {
  const [locations, setLocations] = useState<LocationWithChildren[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null)

  useEffect(() => {
    loadLocations()
  }, [])

  const loadLocations = async () => {
    try {
      const { data, error } = await supabase
        .from('location')
        .select('*')
        .order('name')

      if (error) throw error

      // Build tree structure
      const locationMap = new Map<number, LocationWithChildren>()
      const rootLocations: LocationWithChildren[] = []

      // First pass: create all locations
      data.forEach((loc) => {
        locationMap.set(loc.id, { ...loc, children: [] })
      })

      // Second pass: build tree
      data.forEach((loc) => {
        const location = locationMap.get(loc.id)!
        if (loc.parent_id && locationMap.has(loc.parent_id)) {
          const parent = locationMap.get(loc.parent_id)!
          if (!parent.children) parent.children = []
          parent.children.push(location)
        } else {
          rootLocations.push(location)
        }
      })

      setLocations(rootLocations)
    } catch (error) {
      console.error('Error loading locations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this location?')) return

    try {
      const { error } = await supabase
        .from('location')
        .delete()
        .eq('id', id)

      if (error) throw error
      loadLocations()
      if (selectedLocation === id) {
        setSelectedLocation(null)
      }
    } catch (error) {
      console.error('Error deleting location:', error)
      alert('Failed to delete location. Make sure it has no items or child locations.')
    }
  }

  const LocationTree = ({ locs, level = 0 }: { locs: LocationWithChildren[], level?: number }) => (
    <div className={level > 0 ? 'ml-6 border-l border-gray-200 pl-4' : ''}>
      {locs.map((loc) => (
        <div key={loc.id} className="mb-2">
          <div
            className={`flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer ${
              selectedLocation === loc.id ? 'bg-blue-50' : ''
            }`}
            onClick={() => setSelectedLocation(loc.id)}
          >
            <div className="flex items-center space-x-2 flex-1">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="font-medium text-gray-900">{loc.name}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleDelete(loc.id)
              }}
              className="text-red-600 hover:text-red-800 p-1"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          {loc.children && loc.children.length > 0 && (
            <LocationTree locs={loc.children} level={level + 1} />
          )}
        </div>
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Storage Locations</h1>
          <p className="text-gray-600">Manage and browse storage locations</p>
        </div>
        <Link
          href="/locations/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Location</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Location Tree</h2>
          {loading ? (
            <div className="text-gray-500">Loading...</div>
          ) : locations.length === 0 ? (
            <div className="text-gray-500">No locations yet. Add your first location!</div>
          ) : (
            <LocationTree locs={locations} />
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">
            {selectedLocation ? 'Items in Location' : 'Select a Location'}
          </h2>
          {selectedLocation && (
            <LocationItems locationId={selectedLocation} />
          )}
        </div>
      </div>
    </div>
  )
}

function LocationItems({ locationId }: { locationId: number }) {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadItems()
  }, [locationId])

  const loadItems = async () => {
    try {
      const { data, error } = await supabase
        .from('v_location_breakdown')
        .select('*')
        .eq('location_id', locationId)
        .order('item_name')

      if (error) throw error
      setItems(data || [])
    } catch (error) {
      console.error('Error loading items:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="text-gray-500">Loading...</div>
  if (items.length === 0) return <div className="text-gray-500">No items in this location</div>

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <Link
          key={item.item_id}
          href={`/items/${item.item_id}`}
          className="block p-3 border border-gray-200 rounded hover:bg-gray-50"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">{item.item_name}</div>
              {item.sku && <div className="text-sm text-gray-600">SKU: {item.sku}</div>}
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {item.qty_on_hand}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}


