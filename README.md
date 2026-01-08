## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Supabase:**
   - Create a Supabase project
   - Run the migration: `supabase/migrations/001_initial_schema.sql`
   - Create storage bucket: `item-images`
   - Get your project URL and anon key

3. **Configure environment:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

4. **Run the app:**
   ```bash
   npm run dev
   ```

5. **Open:** [http://localhost:3000](http://localhost:3000)

## Features Implemented

✅ **Item Management**
- Add/edit items with photos
- Track SKU, manufacturer, part numbers, barcodes
- Set minimum required quantities
- Search by name, SKU, part number, or barcode

✅ **Stock Tracking**
- Track quantities by location
- Adjust stock with audit logging
- View total on-hand across all locations
- Automatic reorder deficit calculation

✅ **Location Management**
- Hierarchical storage locations
- Add/delete locations
- View items by location
- Tree view for nested locations

✅ **Low Stock Alerts**
- View items below minimum required
- Shows reorder deficit
- Quick access from navigation

✅ **Category Management**
- Organize items by category
- Hierarchical categories support
- Add/delete categories

## Database Schema

See `supabase/migrations/001_initial_schema.sql` for complete schema including:
- Users & Roles
- Categories (hierarchical)
- Locations (hierarchical)
- Items
- Stock (Item x Location)
- Attachments (photos)
- Suppliers
- Audit Log
- Views for aggregations

## Next Steps (Optional Enhancements)

- [ ] Authentication setup (Supabase Auth)
- [ ] Barcode/QR code scanning
- [ ] CSV import/export
- [ ] Supplier management UI
- [ ] Purchase order generation
- [ ] Multi-vessel support
- [ ] Offline mode with sync
- [ ] Mobile app (React Native)

## Troubleshooting

**Images not uploading?**
- Check storage bucket exists: `item-images`
- Verify bucket is public or RLS policies are correct
- Check browser console for errors

**Database errors?**
- Ensure migrations have been run
- Check Supabase connection in `.env.local`
- Verify RLS policies match your needs

**Search not working?**
- Ensure `pg_trgm` extension is enabled
- Check that text search index exists

For detailed setup instructions, see `SETUP.md`.
