-- ============================================================
-- Meena Rajwada — Supabase RLS Setup
-- Run this ONCE in your Supabase project's SQL Editor
-- (Dashboard → SQL Editor → New query → paste → Run)
-- ============================================================


-- ── 1. CATEGORIES ────────────────────────────────────────────
-- Public can read active categories (needed for homepage / shop)
-- Only authenticated admin can write
alter table categories enable row level security;

drop policy if exists "Public can read active categories" on categories;
create policy "Public can read active categories"
  on categories for select
  using (is_active = true);

drop policy if exists "Authenticated can manage categories" on categories;
create policy "Authenticated can manage categories"
  on categories for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');


-- ── 2. HERO SLIDES ───────────────────────────────────────────
-- Public can read active slides
-- Only authenticated admin can write
alter table hero_slides enable row level security;

drop policy if exists "Public can read active hero slides" on hero_slides;
create policy "Public can read active hero slides"
  on hero_slides for select
  using (is_active = true);

drop policy if exists "Authenticated can manage hero slides" on hero_slides;
create policy "Authenticated can manage hero slides"
  on hero_slides for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');


-- ── 3. CONTACT MESSAGES ──────────────────────────────────────
-- Anyone (anon) can INSERT (customers sending messages)
-- Only authenticated admin can read / update / delete
alter table contact_messages enable row level security;

drop policy if exists "Anyone can submit a contact message" on contact_messages;
create policy "Anyone can submit a contact message"
  on contact_messages for insert
  with check (true);

drop policy if exists "Authenticated can read contact messages" on contact_messages;
create policy "Authenticated can read contact messages"
  on contact_messages for select
  using (auth.role() = 'authenticated');

drop policy if exists "Authenticated can update contact messages" on contact_messages;
create policy "Authenticated can update contact messages"
  on contact_messages for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated can delete contact messages" on contact_messages;
create policy "Authenticated can delete contact messages"
  on contact_messages for delete
  using (auth.role() = 'authenticated');

-- Add is_read column if it doesn't exist yet
do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'contact_messages' and column_name = 'is_read'
  ) then
    alter table contact_messages add column is_read boolean not null default false;
  end if;
end $$;


-- ── 4. CUSTOM ORDER REQUESTS ─────────────────────────────────
-- Anyone (anon) can INSERT (customers placing custom orders)
-- Only authenticated admin can read / update / delete
alter table custom_order_requests enable row level security;

drop policy if exists "Anyone can submit a custom order" on custom_order_requests;
create policy "Anyone can submit a custom order"
  on custom_order_requests for insert
  with check (true);

drop policy if exists "Authenticated can read custom orders" on custom_order_requests;
create policy "Authenticated can read custom orders"
  on custom_order_requests for select
  using (auth.role() = 'authenticated');

drop policy if exists "Authenticated can update custom orders" on custom_order_requests;
create policy "Authenticated can update custom orders"
  on custom_order_requests for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated can delete custom orders" on custom_order_requests;
create policy "Authenticated can delete custom orders"
  on custom_order_requests for delete
  using (auth.role() = 'authenticated');

-- Ensure the correct column names exist (customer_name, customer_email, etc.)
-- Run these only if your table uses old column names (name, email, phone, piece_type)
-- ONLY UNCOMMENT if needed:
-- alter table custom_order_requests rename column name to customer_name;
-- alter table custom_order_requests rename column email to customer_email;
-- alter table custom_order_requests rename column phone to customer_phone;
-- alter table custom_order_requests rename column piece_type to design_type;


-- ── 5. STORAGE — Make "media" bucket public ──────────────────
-- Run this to set the media bucket to public (images/videos load without auth)
-- If the bucket doesn't exist yet, create it first via Storage UI
update storage.buckets
  set public = true
  where id = 'media';

-- Storage policy: public read
drop policy if exists "Public can read media" on storage.objects;
create policy "Public can read media"
  on storage.objects for select
  using (bucket_id = 'media');

-- Storage policy: authenticated upload
drop policy if exists "Authenticated can upload media" on storage.objects;
create policy "Authenticated can upload media"
  on storage.objects for insert
  with check (bucket_id = 'media' and auth.role() = 'authenticated');

-- Storage policy: authenticated delete
drop policy if exists "Authenticated can delete media" on storage.objects;
create policy "Authenticated can delete media"
  on storage.objects for delete
  using (bucket_id = 'media' and auth.role() = 'authenticated');

-- Storage policy: authenticated update (upsert)
drop policy if exists "Authenticated can update media" on storage.objects;
create policy "Authenticated can update media"
  on storage.objects for update
  using (bucket_id = 'media' and auth.role() = 'authenticated')
  with check (bucket_id = 'media' and auth.role() = 'authenticated');


-- ── DONE ─────────────────────────────────────────────────────
-- After running this script:
-- 1. Go to Storage → Buckets → make sure "media" exists and is Public
-- 2. Test uploading a category image in admin → it should now appear on homepage
-- 3. Test submitting a contact form → message should appear in Admin > Messages
-- 4. Test a custom order → should appear in Admin > Custom Orders
