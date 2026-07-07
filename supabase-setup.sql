-- ============================================================
-- MEENA RAJWADA — Supabase Setup Script
-- Run this in: supabase.com → your project → SQL Editor
-- Safe to run multiple times (IF NOT EXISTS / ON CONFLICT)
-- ============================================================

-- ── 0. Reset site_settings (old table had wrong schema) ─────
-- Drop and recreate so the correct columns are guaranteed.
-- Your announcement/whatsapp data will be re-entered via admin.
DROP TABLE IF EXISTS site_settings CASCADE;

-- ── 1. Storage Buckets ──────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES
  ('media',    'media',    true, 10485760),
  ('products', 'products', true, 10485760)
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 10485760;

-- Storage RLS policies
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

-- ── 2. Categories ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  name          text        NOT NULL,
  slug          text        NOT NULL UNIQUE,
  image_url     text        DEFAULT '',
  display_order int         DEFAULT 1,
  is_active     boolean     DEFAULT true,
  created_at    timestamptz DEFAULT now()
);

-- Seed all 12 default categories (safe to re-run)
INSERT INTO categories (name, slug, image_url, display_order, is_active) VALUES
  ('Bangles',          'bangles',         'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=85', 1,  true),
  ('Earrings',         'earrings',        'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=85', 2,  true),
  ('Necklaces',        'necklaces',       'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=85', 3,  true),
  ('Mangalsutra',      'mangalsutra',     'https://images.unsplash.com/photo-1573408301185-9519f94f9c10?w=400&q=85', 4,  true),
  ('Maangtikka',       'maangtikka',      'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=400&q=85', 5,  true),
  ('Rings',            'rings',           'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=85', 6,  true),
  ('Anklets',          'anklets',         'https://images.unsplash.com/photo-1630299023697-8ec5f3182b5b?w=400&q=85', 7,  true),
  ('Nose Ring',        'nose-ring',       'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=85', 8,  true),
  ('Bridal Set',       'bridal',          'https://images.unsplash.com/photo-1561828995-aa79a2db86dd?w=400&q=85', 9,  true),
  ('Festive',          'festive',         'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&q=85', 10, true),
  ('Custom Orders',    'custom-jewelry',  'https://images.unsplash.com/photo-1596944924591-630c44fa7a8a?w=400&q=85', 11, true),
  ('Rajwada Heritage', 'rajwada-heritage','https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=400&q=85', 12, true)
ON CONFLICT (slug) DO NOTHING;

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read categories" ON categories;
DROP POLICY IF EXISTS "Auth manage categories" ON categories;
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Auth manage categories" ON categories FOR ALL USING (auth.role() = 'authenticated');

-- ── 3. Hero Slides ──────────────────────────────────────────
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
DROP POLICY IF EXISTS "Public read hero_slides" ON hero_slides;
DROP POLICY IF EXISTS "Auth manage hero_slides" ON hero_slides;
CREATE POLICY "Public read hero_slides" ON hero_slides FOR SELECT USING (true);
CREATE POLICY "Auth manage hero_slides" ON hero_slides FOR ALL USING (auth.role() = 'authenticated');

-- ── 3. Site Settings ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_settings (
  id                   uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  announcement_text    text        DEFAULT '',
  announcement_active  boolean     DEFAULT true,
  whatsapp_number      text        DEFAULT '',
  email_address        text        DEFAULT '',
  store_address        text        DEFAULT '',
  business_hours       text        DEFAULT 'Mon–Sat: 10am–7pm',
  instagram_url        text        DEFAULT 'https://www.instagram.com/meena.rajwada?igsh=aGRoMngyODhrZjlz',
  facebook_url         text        DEFAULT '',
  youtube_url          text        DEFAULT '',
  pinterest_url        text        DEFAULT '',
  updated_at           timestamptz DEFAULT now()
);

-- Add missing columns to existing table (safe on re-run)
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS announcement_text   text    DEFAULT '';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS announcement_active boolean DEFAULT true;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS whatsapp_number     text    DEFAULT '';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS email_address       text    DEFAULT '';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS store_address       text    DEFAULT '';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS business_hours      text    DEFAULT 'Mon–Sat: 10am–7pm';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS instagram_url       text    DEFAULT 'https://www.instagram.com/meena.rajwada?igsh=aGRoMngyODhrZjlz';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS facebook_url        text    DEFAULT '';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS youtube_url         text    DEFAULT '';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS pinterest_url       text    DEFAULT '';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS updated_at          timestamptz DEFAULT now();

-- Seed one row so admin always UPDATEs, never INSERTs
INSERT INTO site_settings (announcement_text, announcement_active, instagram_url)
SELECT 'Free shipping on orders above ₹999 · Handcrafted with love ✦', true,
       'https://www.instagram.com/meena.rajwada?igsh=aGRoMngyODhrZjlz'
WHERE NOT EXISTS (SELECT 1 FROM site_settings);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read settings"  ON site_settings;
DROP POLICY IF EXISTS "Auth manage settings"  ON site_settings;
CREATE POLICY "Public read settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Auth manage settings" ON site_settings FOR ALL USING (auth.role() = 'authenticated');

-- ── 4. Instagram Posts ──────────────────────────────────────
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
CREATE POLICY "Auth manage instagram" ON instagram_posts FOR ALL USING (auth.role() = 'authenticated');

-- ── 5. FAQs ─────────────────────────────────────────────────
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
CREATE POLICY "Auth manage faqs" ON faqs FOR ALL USING (auth.role() = 'authenticated');

-- ── 6. Featured Promos ──────────────────────────────────────
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
CREATE POLICY "Auth manage promos" ON featured_promos FOR ALL USING (auth.role() = 'authenticated');
