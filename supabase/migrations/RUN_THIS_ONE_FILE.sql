-- =====================================================================
-- COMPLETE STOWED / YACHTOPS SETUP — run this entire file in one go
-- =====================================================================
-- This wipes the public schema, creates all tables, then applies
-- dev-friendly RLS policies. Safe to run on a brand-new project.
-- =====================================================================

-- ---------------------------------------------------------------------
-- PART 0: Reset public schema (clean slate)
-- ---------------------------------------------------------------------
drop schema public cascade;
create schema public;
grant usage on schema public to anon, authenticated, service_role;
grant all on schema public to postgres;

-- ---------------------------------------------------------------------
-- PART 1: Initial schema (from 001_initial_schema.sql)
-- ---------------------------------------------------------------------

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Enable ltree extension for hierarchical locations
create extension if not exists "ltree";

-- Enable pg_trgm for fuzzy text search
create extension if not exists "pg_trgm";

-- USERS & ROLES
create table public.app_user (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  full_name text,
  role text check (role in ('admin','engineer','stew','deck','readonly')) not null default 'readonly',
  created_at timestamptz default now()
);

-- CATEGORIES (tree)
create table public.category (
  id bigserial primary key,
  name text not null,
  parent_id bigint references public.category(id) on delete set null,
  created_at timestamptz default now()
);
create index on public.category(parent_id);

-- LOCATIONS (tree)
create table public.location (
  id bigserial primary key,
  name text not null,
  parent_id bigint references public.location(id) on delete set null,
  path ltree,
  notes text,
  created_at timestamptz default now()
);
create index on public.location(parent_id);
create index location_path_gist on public.location using gist(path);

-- ITEMS
create table public.item (
  id bigserial primary key,
  sku text,
  manufacturer text,
  mfg_part_no text,
  name text not null,
  description text,
  unit text default 'ea',
  category_id bigint references public.category(id) on delete set null,
  barcode text,
  min_required numeric(12,3) not null default 0,
  created_by uuid references public.app_user(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create unique index if not exists item_unique_sku on public.item(sku) where sku is not null;
create index on public.item(category_id);
create index on public.item(barcode);
create index item_trgm on public.item using gin ((name || ' ' || coalesce(sku,'') || ' ' || coalesce(mfg_part_no,'')) gin_trgm_ops);

-- STOCK (Item x Location with current quantity)
create table public.stock (
  id bigserial primary key,
  item_id bigint not null references public.item(id) on delete cascade,
  location_id bigint not null references public.location(id) on delete cascade,
  qty_on_hand numeric(12,3) not null default 0,
  updated_at timestamptz default now(),
  unique(item_id, location_id)
);
create index on public.stock(location_id);
create index on public.stock(item_id);

-- DERIVED VIEW: Item aggregates across locations
create view public.v_item_aggregate as
select i.id as item_id,
       i.name,
       i.sku,
       i.min_required,
       coalesce(sum(s.qty_on_hand),0) as total_on_hand,
       greatest(i.min_required - coalesce(sum(s.qty_on_hand),0),0) as reorder_deficit
from public.item i
left join public.stock s on s.item_id = i.id
group by i.id, i.name, i.sku, i.min_required;

-- VIEW: Low Stock items
create view public.v_low_stock as
select * from public.v_item_aggregate where reorder_deficit > 0;

-- VIEW: Location breakdown
create view public.v_location_breakdown as
select l.id as location_id, l.name as location_name, l.path as location_path,
       i.id as item_id, i.name as item_name, i.sku, s.qty_on_hand
from stock s
join location l on l.id = s.location_id
join item i on i.id = s.item_id;

-- ATTACHMENTS (photos/manuals)
create table public.attachment (
  id bigserial primary key,
  item_id bigint references public.item(id) on delete cascade,
  file_url text not null,
  type text check (type in ('photo','manual','spec')) default 'photo',
  created_at timestamptz default now()
);
create index on public.attachment(item_id);

-- SUPPLIERS
create table public.supplier (
  id bigserial primary key,
  name text not null,
  email text,
  phone text,
  url text,
  notes text,
  created_at timestamptz default now()
);

-- ITEM <-> SUPPLIER (pricing)
create table public.item_supplier (
  id bigserial primary key,
  item_id bigint references public.item(id) on delete cascade,
  supplier_id bigint references public.supplier(id) on delete cascade,
  supplier_sku text,
  price numeric(12,2),
  currency text default 'EUR',
  created_at timestamptz default now()
);
create index on public.item_supplier(item_id);
create index on public.item_supplier(supplier_id);

-- AUDIT LOG
create table public.audit_log (
  id bigserial primary key,
  user_id uuid references public.app_user(id),
  entity text not null,
  entity_id bigint not null,
  action text not null,
  field text,
  old_value text,
  new_value text,
  created_at timestamptz default now()
);
create index on public.audit_log(entity, entity_id);
create index on public.audit_log(user_id);
create index on public.audit_log(created_at);

-- TRIGGER: keep updated_at fresh
create or replace function touch_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger item_touch before update on public.item for each row execute function touch_updated_at();
create trigger stock_touch before update on public.stock for each row execute function touch_updated_at();

-- FUNCTION: Adjust stock with audit logging
create or replace function adjust_stock(
  p_item_id bigint,
  p_location_id bigint,
  p_delta numeric,
  p_reason text default 'adjustment'
)
returns void language plpgsql security definer as $$
declare
  v_old numeric;
  v_new numeric;
  v_user_id uuid;
begin
  v_user_id := auth.uid();

  select qty_on_hand into v_old
  from stock
  where item_id=p_item_id and location_id=p_location_id
  for update;

  if not found then
    insert into stock(item_id, location_id, qty_on_hand)
    values (p_item_id, p_location_id, 0)
    returning qty_on_hand into v_old;
  end if;

  v_new := greatest(coalesce(v_old,0) + p_delta, 0);

  update stock
  set qty_on_hand = v_new
  where item_id=p_item_id and location_id=p_location_id;

  insert into audit_log(user_id, entity, entity_id, action, field, old_value, new_value)
    values (v_user_id, 'stock', p_item_id, 'adjust', 'qty_on_hand', v_old::text, v_new::text);
end;
$$;

-- ---------------------------------------------------------------------
-- PART 2: Enable RLS + dev-friendly policies (from 002_dev_rls_policies.sql)
-- ---------------------------------------------------------------------

-- Enable RLS on all tables
alter table public.app_user enable row level security;
alter table public.category enable row level security;
alter table public.location enable row level security;
alter table public.item enable row level security;
alter table public.stock enable row level security;
alter table public.attachment enable row level security;
alter table public.supplier enable row level security;
alter table public.item_supplier enable row level security;
alter table public.audit_log enable row level security;

-- Permissive dev policies (open access — replace before production)
create policy category_read on public.category for select using (true);
create policy category_write on public.category for all using (true);

create policy location_read on public.location for select using (true);
create policy location_write on public.location for all using (true);

create policy item_read on public.item for select using (true);
create policy item_write on public.item for insert with check (true);
create policy item_update on public.item for update using (true);
create policy item_delete on public.item for delete using (true);

create policy stock_read on public.stock for select using (true);
create policy stock_write on public.stock for all using (true);

create policy attachment_read on public.attachment for select using (true);
create policy attachment_write on public.attachment for all using (true);

create policy supplier_read on public.supplier for select using (true);
create policy supplier_write on public.supplier for all using (true);

create policy item_supplier_read on public.item_supplier for select using (true);
create policy item_supplier_write on public.item_supplier for all using (true);

create policy audit_log_read on public.audit_log for select using (true);
create policy audit_log_write on public.audit_log for insert with check (true);
