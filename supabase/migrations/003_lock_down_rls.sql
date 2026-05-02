-- =====================================================================
-- 003_lock_down_rls.sql
-- =====================================================================
-- Replaces the permissive dev policies (002) with policies that require
-- an authenticated Supabase user. Run this once in the SQL Editor BEFORE
-- exposing the app publicly.
--
-- Strategy: any signed-in user can read & write everything (single-tenant
-- "yacht crew" model). For multi-tenant later, scope by user/org_id.
-- =====================================================================

-- Drop the dev-only open policies
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
drop policy if exists audit_log_write on public.audit_log;

-- Authenticated-only policies
create policy category_read on public.category for select to authenticated using (true);
create policy category_write on public.category for all to authenticated using (true) with check (true);

create policy location_read on public.location for select to authenticated using (true);
create policy location_write on public.location for all to authenticated using (true) with check (true);

create policy item_read on public.item for select to authenticated using (true);
create policy item_write on public.item for all to authenticated using (true) with check (true);

create policy stock_read on public.stock for select to authenticated using (true);
create policy stock_write on public.stock for all to authenticated using (true) with check (true);

create policy attachment_read on public.attachment for select to authenticated using (true);
create policy attachment_write on public.attachment for all to authenticated using (true) with check (true);

create policy supplier_read on public.supplier for select to authenticated using (true);
create policy supplier_write on public.supplier for all to authenticated using (true) with check (true);

create policy item_supplier_read on public.item_supplier for select to authenticated using (true);
create policy item_supplier_write on public.item_supplier for all to authenticated using (true) with check (true);

create policy audit_log_read on public.audit_log for select to authenticated using (true);
create policy audit_log_write on public.audit_log for insert to authenticated with check (true);
