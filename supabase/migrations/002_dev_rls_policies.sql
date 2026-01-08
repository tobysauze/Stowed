-- Development-friendly RLS policies
-- This allows unauthenticated access for development/testing
-- For production, you should set up proper authentication and use stricter policies

-- Drop existing policies
drop policy if exists category_read on public.category;
drop policy if exists category_write on public.category;
drop policy if exists location_read on public.location;
drop policy if exists location_write on public.location;
drop policy if exists item_read on public.item;
drop policy if exists item_write on public.item;
drop policy if exists item_update on public.item;
drop policy if exists item_delete on public.item;
drop policy if exists stock_read on public.stock;
drop policy if exists stock_write on public.stock;
drop policy if exists attachment_read on public.attachment;
drop policy if exists attachment_write on public.attachment;
drop policy if exists supplier_read on public.supplier;
drop policy if exists supplier_write on public.supplier;
drop policy if exists item_supplier_read on public.item_supplier;
drop policy if exists item_supplier_write on public.item_supplier;
drop policy if exists audit_log_read on public.audit_log;

-- Create permissive policies for development
-- These allow full access without authentication
-- TODO: Replace with proper authenticated policies for production

-- Category policies
create policy category_read on public.category for select using (true);
create policy category_write on public.category for all using (true);

-- Location policies
create policy location_read on public.location for select using (true);
create policy location_write on public.location for all using (true);

-- Item policies
create policy item_read on public.item for select using (true);
create policy item_write on public.item for insert with check (true);
create policy item_update on public.item for update using (true);
create policy item_delete on public.item for delete using (true);

-- Stock policies
create policy stock_read on public.stock for select using (true);
create policy stock_write on public.stock for all using (true);

-- Attachment policies
create policy attachment_read on public.attachment for select using (true);
create policy attachment_write on public.attachment for all using (true);

-- Supplier policies
create policy supplier_read on public.supplier for select using (true);
create policy supplier_write on public.supplier for all using (true);

-- Item supplier policies
create policy item_supplier_read on public.item_supplier for select using (true);
create policy item_supplier_write on public.item_supplier for all using (true);

-- Audit log policies
create policy audit_log_read on public.audit_log for select using (true);
create policy audit_log_write on public.audit_log for insert with check (true);

-- Note: For production, you'll want to replace these with policies like:
-- create policy item_write on public.item for insert with check (auth.role() = 'authenticated');
-- Or use service role key for server-side operations


