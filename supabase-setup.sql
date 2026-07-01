-- ============================================================
-- MEENA RAJWADA — Supabase Setup Script
-- Run this ONCE in: supabase.com → your project → SQL Editor
-- ============================================================

-- ── 1. Storage Buckets ──────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES
  ('media',    'media',    true, 10485760),
  ('products', 'products', true, 10485760)
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 10485760;

-- Storage RLS policies (public read, any upload for now)
DROP POLICY IF EXISTS "Public read media"     ON storage.objects;
DROP POLICY IF EXISTS "Public read products"  ON storage.objects;
DROP POLICY IF EXISTS "Upload to media"       ON storage.objects;
DROP POLICY IF EXISTS "Upload to products"    ON storage.objects;
DROP POLICY IF EXISTS "Update in media"       ON storage.objects;
DROP POLICY IF EXISTS "Update in products"    ON storage.objects;
DROP POLICY IF EXISTS "Delete from media"     ON storage.objects;
DROP POLICY IF EXISTS "Delete from products"  ON storage.objects;

CREATE POLICY "Public read media"    ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "Public read products" ON storage.objects FOR SELECT USING (bucket_id = 'products');
CREATE POLICY "Upload to media"      ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'media');
CREATE POLICY "Upload to products"   ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'products');
CREATE POLICY "Update in media"      ON storage.objects FOR UPDATE USING (bucket_id = 'media');
CREATE POLICY "Update in products"   ON storage.objects FOR UPDATE USING (bucket_id = 'products');
CREATE POLICY "Delete from media"    ON storage.objects FOR DELETE USING (bucket_id = 'media');
CREATE POLICY "Delete from products" ON storage.objects FOR DELETE USING (bucket_id = 'products');

-- ── 2. Hero Slides ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hero_slides (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  title         text        NOT NULL,
  subtitle      text,
  image_url     text        NOT NULL DEFAULT '',
  video_url     text,
  cta_text      text        DEFAULT 'Shop Now',
  cta_url       text        DEFAULT '/shop',
  display_order int         DEFAULT 1,
  is_active     boolean     DEFAULT true,
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read hero_slides"  ON hero_slides;
DROP POLICY IF EXISTS "Auth manage hero_slides"  ON hero_slides;
CREATE POLICY "Public read hero_slides" ON hero_slides FOR SELECT USING (true);
CREATE POLICY "Auth manage hero_slides" ON hero_slides FOR ALL   USING (auth.role() = 'authenticated');

-- ── 3. Instagram Posts ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS instagram_posts (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  reel_id       text        NOT NULL,
  caption       text,
  display_order int         DEFAULT 1,
  is_active     boolean     DEFAULT true,
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE instagram_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read instagram" ON instagram_posts;
DROP POLICY IF EXISTS "Auth manage instagram" ON instagram_posts;
CREATE POLICY "Public read instagram" ON instagram_posts FOR SELECT USING (true);
CREATE POLICY "Auth manage instagram" ON instagram_posts FOR ALL   USING (auth.role() = 'authenticated');

-- ── 4. FAQs ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS faqs (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  question      text        NOT NULL,
  answer        text        NOT NULL,
  display_order int         DEFAULT 1,
  is_active     boolean     DEFAULT true,
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read faqs" ON faqs;
DROP POLICY IF EXISTS "Auth manage faqs" ON faqs;
CREATE POLICY "Public read faqs" ON faqs FOR SELECT USING (true);
CREATE POLICY "Auth manage faqs" ON faqs FOR ALL   USING (auth.role() = 'authenticated');

-- ── 5. Featured Promos ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS featured_promos (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  title         text        NOT NULL,
  subtitle      text,
  image_url     text,
  cta_text      text,
  cta_url       text,
  accent_color  text        DEFAULT '#8B1A2F',
  display_order int         DEFAULT 1,
  is_active     boolean     DEFAULT true,
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE featured_promos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read promos" ON featured_promos;
DROP POLICY IF EXISTS "Auth manage promos" ON featured_promos;
CREATE POLICY "Public read promos" ON featured_promos FOR SELECT USING (true);
CREATE POLICY "Auth manage promos" ON featured_promos FOR ALL   USING (auth.role() = 'authenticated');
