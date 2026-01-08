'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Category } from '@/types/database'
import { Plus, Trash2 } from 'lucide-react'

export default function CategoriesPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    parent_id: null as number | null,
  })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('category')
        .select('*')
        .order('name')

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error loading categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('category')
        .insert([formData])

      if (error) throw error

      setFormData({ name: '', parent_id: null })
      setShowForm(false)
      loadCategories()
    } catch (error: any) {
      console.error('Error creating category:', error)
      alert('Failed to create category: ' + error.message)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      const { error } = await supabase
        .from('category')
        .delete()
        .eq('id', id)

      if (error) throw error
      loadCategories()
    } catch (error: any) {
      console.error('Error deleting category:', error)
      alert('Failed to delete category: ' + error.message)
    }
  }

  const getCategoryPath = (category: Category): string => {
    if (!category.parent_id) return category.name
    
    const parent = categories.find(c => c.id === category.parent_id)
    if (!parent) return category.name
    
    return `${getCategoryPath(parent)} > ${category.name}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Categories</h1>
          <p className="text-gray-600">Manage item categories</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Category</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Add New Category</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Category Name *
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Engineering"
              />
            </div>
            <div>
              <label htmlFor="parent_id" className="block text-sm font-medium text-gray-700 mb-2">
                Parent Category (optional)
              </label>
              <select
                id="parent_id"
                value={formData.parent_id || ''}
                onChange={(e) => setFormData({ ...formData, parent_id: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">None (Top Level)</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {getCategoryPath(cat)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Create Category
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setFormData({ name: '', parent_id: null })
                }}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-600">No categories yet. Add your first category!</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-200">
            {categories.map((category) => (
              <div key={category.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{getCategoryPath(category)}</div>
                  {category.parent_id && (
                    <div className="text-sm text-gray-500 mt-1">Subcategory</div>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="text-red-600 hover:text-red-800 p-2"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}


