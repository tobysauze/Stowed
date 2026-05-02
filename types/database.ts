// Database types based on schema
export type UserRole = 'admin' | 'engineer' | 'stew' | 'deck' | 'readonly'

export interface AppUser {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  created_at: string
}

export interface Category {
  id: number
  name: string
  parent_id: number | null
  created_at: string
}

export interface Location {
  id: number
  name: string
  parent_id: number | null
  path: string | null
  notes: string | null
  created_at: string
}

export interface Item {
  id: number
  sku: string | null
  manufacturer: string | null
  mfg_part_no: string | null
  name: string
  description: string | null
  unit: string
  category_id: number | null
  barcode: string | null
  min_required: number
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Stock {
  id: number
  item_id: number
  location_id: number
  qty_on_hand: number
  updated_at: string
}

export interface ItemAggregate {
  item_id: number
  name: string
  sku: string | null
  min_required: number
  total_on_hand: number
  reorder_deficit: number
}

export interface LowStockItem extends ItemAggregate {}

export interface LocationBreakdown {
  location_id: number
  location_name: string
  location_path: string | null
  item_id: number
  item_name: string
  sku: string | null
  qty_on_hand: number
}

export interface Attachment {
  id: number
  item_id: number
  file_url: string
  type: 'photo' | 'manual' | 'spec'
  created_at: string
}

export interface Supplier {
  id: number
  name: string
  email: string | null
  phone: string | null
  url: string | null
  notes: string | null
  created_at: string
}

export interface ItemSupplier {
  id: number
  item_id: number
  supplier_id: number
  supplier_sku: string | null
  price: number | null
  currency: string
  created_at: string
}

export interface AuditLog {
  id: number
  user_id: string | null
  entity: string
  entity_id: number
  action: string
  field: string | null
  old_value: string | null
  new_value: string | null
  created_at: string
}

// UI types
export interface LocationWithChildren extends Location {
  children?: LocationWithChildren[]
}

export interface ItemWithDetails extends Item {
  category?: Category
  total_on_hand?: number
  reorder_deficit?: number
  attachment?: Attachment[]
  stock?: Array<Stock & { location?: Location }>
}


