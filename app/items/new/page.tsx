'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Category, Location } from '@/types/database'
import { PhotoDropzone } from '@/components/items/PhotoDropzone'

export default function NewItemPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const barcodeFromUrl =
    typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('barcode') : null
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    manufacturer: '',
    mfg_part_no: '',
    description: '',
    unit: 'ea',
    category_id: null as number | null,
    barcode: barcodeFromUrl || '',
    min_required: 0,
  })
  const [uploading, setUploading] = useState(false)
  const [images, setImages] = useState<File[]>([])

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    const { data } = await supabase
      .from('category')
      .select('*')
      .order('name')
    setCategories(data || [])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Create item
      const { data: item, error: itemError } = await supabase
        .from('item')
        .insert([formData])
        .select()
        .single()

      if (itemError) throw itemError

      // Upload images if any
      if (images.length > 0 && item) {
        setUploading(true)
        for (const image of images) {
          const fileExt = image.name.split('.').pop()
          const fileName = `item-${item.id}-${Date.now()}.${fileExt}`
          
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
              item_id: item.id,
              file_url: urlData.publicUrl,
              type: 'photo',
            }])
        }
        setUploading(false)
      }

      router.push(`/items/${item.id}`)
    } catch (error: any) {
      console.error('Error creating item:', error)
      toast.error('Failed to create item: ' + error.message)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Add New Item</h1>

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
              placeholder="e.g., Impeller Jabsco 22405-0001"
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
              placeholder="Internal SKU"
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
              placeholder="ea, pcs, kg, etc."
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
            placeholder="Item description..."
          />
        </div>

        <PhotoDropzone files={images} onChange={setImages} />

        <div className="flex space-x-3 pt-2">
          <button
            type="submit"
            disabled={loading || uploading}
            className="rounded-xl bg-red-600 px-6 py-2.5 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {loading || uploading ? 'Creating…' : 'Create Item'}
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


