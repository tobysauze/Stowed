# Setup Instructions

## Prerequisites

- Node.js 18+ installed
- A Supabase account and project

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Supabase

1. Create a new Supabase project at https://supabase.com
2. Go to your project's SQL Editor
3. Run the migration files in order:
   - First: `supabase/migrations/001_initial_schema.sql`
   - Then: `supabase/migrations/002_dev_rls_policies.sql` (for development access)
4. Go to Storage and create a new bucket called `item-images`
   - Make it public (or set up proper RLS policies)
5. Copy your project URL and anon key from Settings > API

**Important:** The second migration (`002_dev_rls_policies.sql`) sets up permissive RLS policies that allow unauthenticated access for development. For production, you should set up proper authentication and use stricter policies.

## Step 3: Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=postgresql://user:password@localhost:5432/yachtops?schema=public
```

## Step 4: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 5: Initial Setup (Optional)

### Create Categories

You can add categories through the database or create a simple SQL script:

```sql
INSERT INTO category (name) VALUES 
  ('Engineering'),
  ('Deck'),
  ('Interior'),
  ('Galley'),
  ('Bridge');

-- Subcategories example
INSERT INTO category (name, parent_id) VALUES 
  ('Pumps', (SELECT id FROM category WHERE name = 'Engineering')),
  ('Filters', (SELECT id FROM category WHERE name = 'Engineering')),
  ('Linen', (SELECT id FROM category WHERE name = 'Interior'));
```

### Create Initial Locations

```sql
INSERT INTO location (name) VALUES 
  ('Engine Room'),
  ('Deck Storage'),
  ('Galley'),
  ('Interior Storage');

-- Nested locations
INSERT INTO location (name, parent_id) VALUES 
  ('Port Locker', (SELECT id FROM location WHERE name = 'Engine Room')),
  ('Starboard Locker', (SELECT id FROM location WHERE name = 'Engine Room'));
```

## Features

✅ Search items by name, SKU, part number, or barcode  
✅ View low stock items (below minimum required)  
✅ Browse items by storage location  
✅ Add/edit items with photos  
✅ Adjust stock quantities by location  
✅ Track reorder deficit automatically  
✅ Hierarchical storage locations  
✅ Category management  

## Next Steps

- Set up authentication (Supabase Auth)
- Configure Row Level Security policies based on your needs
- Add barcode scanning functionality
- Set up CSV import/export
- Add supplier management

