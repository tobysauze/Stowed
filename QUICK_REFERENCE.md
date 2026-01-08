# Quick Reference

## Navigation

- **Search** (`/`) - Search for items by name, SKU, part number, or barcode
- **Low Stock** (`/low-stock`) - View all items below minimum required quantity
- **Locations** (`/locations`) - Browse and manage storage locations
- **Add Item** (`/items/new`) - Add a new item to inventory
- **Categories** (`/categories`) - Manage item categories

## Key Features

### Items
- Store thousands of items with photos
- Track SKU, manufacturer, part numbers, barcodes
- Set minimum required quantities
- View total on-hand across all locations
- Automatic reorder deficit calculation

### Stock Management
- Track quantities by location
- Adjust stock with reason tracking
- View stock breakdown by location
- Audit trail for all changes

### Locations
- Hierarchical storage locations
- View items by location
- Add/delete locations
- Nested structure (e.g., Engine Room > Port Locker > Shelf A)

### Low Stock Alerts
- Automatic calculation of reorder deficit
- Filter: `reorder_deficit > 0`
- Shows current vs. minimum required
- Displays how many more to order

## Database Views

- `v_item_aggregate` - Item totals across all locations
- `v_low_stock` - Items needing reorder
- `v_location_breakdown` - Items by location

## Storage Bucket Setup

1. Go to Supabase Dashboard > Storage
2. Create bucket named `item-images`
3. Set as public OR configure RLS policies:
   ```sql
   CREATE POLICY "Public Access" ON storage.objects
   FOR SELECT USING (bucket_id = 'item-images');
   
   CREATE POLICY "Authenticated Upload" ON storage.objects
   FOR INSERT WITH CHECK (
     bucket_id = 'item-images' AND
     auth.role() = 'authenticated'
   );
   ```

## API Functions

- `adjust_stock(p_item_id, p_location_id, p_delta, p_reason)` - Adjust stock with audit logging

## Common Queries

### Get all items in a location
```sql
SELECT * FROM v_location_breakdown WHERE location_id = 1;
```

### Get low stock items
```sql
SELECT * FROM v_low_stock ORDER BY reorder_deficit DESC;
```

### Search items
```sql
SELECT * FROM item 
WHERE name ILIKE '%search%' 
   OR sku ILIKE '%search%' 
   OR mfg_part_no ILIKE '%search%';
```

## Tips

- Use hierarchical locations for better organization
- Set realistic minimum required quantities
- Upload photos when adding items for easier identification
- Use SKUs for internal tracking
- Use barcodes for quick scanning (future feature)


