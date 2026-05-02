'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Category, ItemWithDetails } from '@/types/database'
import { Skeleton } from '@/components/ui/Skeleton'
import { PhotoDropzone } from '@/components/items/PhotoDropzone'

export default function EditItemPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [item, setItem] = useState<ItemWithDetails | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    manufacturer: '',
    mfg_part_no: '',
    description: '',
    unit: 'ea',
    category_id: null as number | null,
    barcode: '',
    min_required: 0,
  })
  const [images, setImages] = useState<File[]>([])

  useEffect(() => {
    loadItem()
    loadCategories()
  }, [params.id])

  const loadItem = async () => {
    try {
      const { data, error } = await supabase
        .from('item')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) throw error

      setItem(data)
      setFormData({
        name: data.name,
        sku: data.sku || '',
        manufacturer: data.manufacturer || '',
        mfg_part_no: data.mfg_part_no || '',
        description: data.description || '',
        unit: data.unit || 'ea',
        category_id: data.category_id,
        barcode: data.barcode || '',
        min_required: data.min_required || 0,
      })
    } catch (error) {
      console.error('Error loading item:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    const { data } = await supabase
      .from('category')
      .select('*')
      .order('name')
    setCategories(data || [])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Update item
      const { error: itemError } = await supabase
        .from('item')
        .update(formData)
        .eq('id', params.id)

      if (itemError) throw itemError

      // Upload new images if any
      if (images.length > 0) {
        for (const image of images) {
          const fileExt = image.name.split('.').pop()
          const fileName = `item-${params.id}-${Date.now()}.${fileExt}`
          
          const { error: uploadError } = await supabase.storage
            .from('item-images')
            .upload(fileName, image)

          if (uploadError) {
            console.error('Upload error:', uploadError)
            continue
          }

          // Get public URL
          const { data: urlData } = supabase.storage
            .from('item-images')
            .getPublicUrl(fileName)

          // Create attachment record
          await supabase
            .from('attachment')
            .insert([{
              item_id: parseInt(params.id),
              file_url: urlData.publicUrl,
              type: 'photo',
            }])
        }
      }

      router.push(`/items/${params.id}`)
    } catch (error: any) {
      console.error('Error updating item:', error)
      toast.error('Failed to update item: ' + error.message)
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!item) {
    return <div className="text-center py-12 text-gray-500">Item not found</div>
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Item</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Item Name *
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-2">
              SKU
            </label>
            <input
              type="text"
              id="sku"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="manufacturer" className="block text-sm font-medium text-gray-700 mb-2">
              Manufacturer
            </label>
            <input
              type="text"
              id="manufacturer"
              value={formData.manufacturer}
              onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="mfg_part_no" className="block text-sm font-medium text-gray-700 mb-2">
              Manufacturer Part Number
            </label>
            <input
              type="text"
              id="mfg_part_no"
              value={formData.mfg_part_no}
              onChange={(e) => setFormData({ ...formData, mfg_part_no: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              id="category_id"
              value={formData.category_id || ''}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value ? parseInt(e.target.value) : null })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">None</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-2">
              Unit
            </label>
            <input
              type="text"
              id="unit"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="barcode" className="block text-sm font-medium text-gray-700 mb-2">
              Barcode / QR Code
            </label>
            <input
              type="text"
              id="barcode"
              value={formData.barcode}
              onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="min_required" className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Required *
            </label>
            <input
              type="number"
              id="min_required"
              required
              min="0"
              step="0.001"
              value={formData.min_required}
              onChange={(e) => setFormData({ ...formData, min_required: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <PhotoDropzone files={images} onChange={setImages} label="Add more photos" />

        <div className="flex space-x-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-red-600 px-6 py-2.5 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-xl bg-gray-100 px-6 py-2.5 font-semibold text-gray-700 hover:bg-gray-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}


