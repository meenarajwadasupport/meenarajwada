-- ============================================================
-- MEENA RAJWADA — Complete Database Schema
-- Run this in Supabase → SQL Editor
-- ============================================================

-- ── 1. PROFILES (extends auth.users) ──────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  phone       TEXT,
  avatar_url  TEXT,
  is_admin    BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── 2. ADDRESSES ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS addresses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL,
  phone       TEXT NOT NULL,
  address     TEXT NOT NULL,
  city        TEXT NOT NULL,
  state       TEXT NOT NULL,
  pincode     TEXT NOT NULL,
  is_default  BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 3. CATEGORIES ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  image_url     TEXT,
  display_order INT NOT NULL DEFAULT 1,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 4. PRODUCTS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  description      TEXT,
  price            NUMERIC(10,2) NOT NULL,
  mrp              NUMERIC(10,2) NOT NULL,
  material         TEXT,
  category_id      UUID REFERENCES categories(id) ON DELETE SET NULL,
  category_slug    TEXT,
  images           TEXT[] NOT NULL DEFAULT '{}',
  colors           TEXT[] NOT NULL DEFAULT '{}',
  sizes            TEXT[] NOT NULL DEFAULT '{}',
  stock            INT NOT NULL DEFAULT 0,
  is_active        BOOLEAN NOT NULL DEFAULT true,
  is_featured      BOOLEAN NOT NULL DEFAULT false,
  is_new_arrival   BOOLEAN NOT NULL DEFAULT false,
  is_bestseller    BOOLEAN NOT NULL DEFAULT false,
  is_customizable  BOOLEAN NOT NULL DEFAULT false,
  in_hero_slider   BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 5. HERO SLIDES ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hero_slides (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  subtitle      TEXT,
  image_url     TEXT NOT NULL,
  video_url     TEXT,
  cta_text      TEXT NOT NULL DEFAULT 'Shop Now',
  cta_url       TEXT NOT NULL DEFAULT '/shop',
  display_order INT NOT NULL DEFAULT 1,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 6. TESTIMONIALS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS testimonials (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  location      TEXT,
  review        TEXT NOT NULL,
  rating        INT NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  avatar        TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 1,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 7. ORDERS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name       TEXT NOT NULL,
  customer_email      TEXT NOT NULL,
  customer_phone      TEXT NOT NULL,
  shipping_address    JSONB,
  subtotal            NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping_amount     NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_amount        NUMERIC(10,2) NOT NULL,
  status              TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending','confirmed','processing','dispatched','delivered','cancelled')),
  payment_status      TEXT NOT NULL DEFAULT 'pending'
                      CHECK (payment_status IN ('pending','paid','failed','refunded')),
  cashfree_order_id   TEXT,
  payment_session_id  TEXT,
  tracking_id         TEXT,
  courier             TEXT,
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 8. ORDER ITEMS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id   UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  size         TEXT,
  quantity     INT NOT NULL DEFAULT 1,
  price        NUMERIC(10,2) NOT NULL,
  image_url    TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 9. BLOG POSTS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blog_posts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT NOT NULL UNIQUE,
  title        TEXT NOT NULL,
  excerpt      TEXT,
  content      TEXT,
  cover_image  TEXT,
  author       TEXT NOT NULL DEFAULT 'Meena Rajwada',
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 10. SITE SETTINGS ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Default settings
INSERT INTO site_settings (key, value) VALUES
  ('store_name',          'Meena Rajwada'),
  ('store_phone',         '+91 98765 43210'),
  ('store_email',         'hello@meenarajwada.com'),
  ('store_address',       'Your City, India'),
  ('whatsapp_number',     '919876543210'),
  ('instagram_url',       'https://instagram.com/meenarajwada'),
  ('facebook_url',        ''),
  ('free_shipping_above', '999'),
  ('shipping_charge',     '79'),
  ('maintenance_mode',    'false'),
  ('announcement_text',   '✦ Free shipping on orders above ₹999 ✦ Pan India delivery'),
  ('announcement_active', 'true')
ON CONFLICT (key) DO NOTHING;

-- ── 11. CONTACT MESSAGES ──────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  phone      TEXT,
  subject    TEXT,
  message    TEXT NOT NULL,
  is_read    BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 12. NEWSLETTER SUBSCRIBERS ────────────────────────────
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT NOT NULL UNIQUE,
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 13. CUSTOM ORDER REQUESTS ─────────────────────────────
CREATE TABLE IF NOT EXISTS custom_order_requests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  design_type   TEXT,
  occasion      TEXT,
  color_prefs   TEXT,
  size_prefs    TEXT,
  budget        TEXT,
  description   TEXT NOT NULL,
  reference_images TEXT[],
  status        TEXT NOT NULL DEFAULT 'new'
                CHECK (status IN ('new','reviewing','quoted','confirmed','in_progress','completed','cancelled')),
  admin_notes   TEXT,
  quoted_price  NUMERIC(10,2),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ══════════════════════════════════════════════════════════

ALTER TABLE profiles                ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses               ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories              ENABLE ROW LEVEL SECURITY;
ALTER TABLE products                ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_slides             ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials            ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items             ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts              ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings           ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages        ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers  ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_order_requests   ENABLE ROW LEVEL SECURITY;

-- Helper: is current user an admin?
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_admin = true
  );
$$;

-- ── PROFILES ──
CREATE POLICY "Users read own profile"   ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admin all profiles"       ON profiles FOR ALL TO authenticated USING (is_admin());

-- ── ADDRESSES ──
CREATE POLICY "Users own addresses" ON addresses FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin all addresses" ON addresses FOR ALL TO authenticated USING (is_admin());

-- ── CATEGORIES (public read) ──
CREATE POLICY "Public read categories" ON categories FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Admin all categories"   ON categories FOR ALL TO authenticated USING (is_admin());

-- ── PRODUCTS (public read active) ──
CREATE POLICY "Public read products" ON products FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Admin all products"   ON products FOR ALL TO authenticated USING (is_admin());

-- ── HERO SLIDES ──
CREATE POLICY "Public read hero_slides" ON hero_slides FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Admin all hero_slides"   ON hero_slides FOR ALL TO authenticated USING (is_admin());

-- ── TESTIMONIALS ──
CREATE POLICY "Public read testimonials" ON testimonials FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Admin all testimonials"   ON testimonials FOR ALL TO authenticated USING (is_admin());

-- ── ORDERS ──
CREATE POLICY "Users own orders"   ON orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert order" ON orders FOR INSERT TO authenticated, anon WITH CHECK (true);
CREATE POLICY "Admin all orders"   ON orders FOR ALL TO authenticated USING (is_admin());

-- ── ORDER ITEMS ──
CREATE POLICY "Users read own order items" ON order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_id AND orders.user_id = auth.uid()));
CREATE POLICY "Insert order items" ON order_items FOR INSERT TO authenticated, anon WITH CHECK (true);
CREATE POLICY "Admin all order_items" ON order_items FOR ALL TO authenticated USING (is_admin());

-- ── BLOG POSTS ──
CREATE POLICY "Public read blog" ON blog_posts FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE POLICY "Admin all blog"   ON blog_posts FOR ALL TO authenticated USING (is_admin());

-- ── SITE SETTINGS ──
CREATE POLICY "Public read settings" ON site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin all settings"   ON site_settings FOR ALL TO authenticated USING (is_admin());

-- ── CONTACT MESSAGES ──
CREATE POLICY "Anyone insert message" ON contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admin all messages"    ON contact_messages FOR ALL TO authenticated USING (is_admin());

-- ── NEWSLETTER ──
CREATE POLICY "Anyone subscribe"       ON newsletter_subscribers FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admin all newsletter"   ON newsletter_subscribers FOR ALL TO authenticated USING (is_admin());

-- ── CUSTOM ORDERS ──
CREATE POLICY "Anyone submit custom order" ON custom_order_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Users own custom orders"    ON custom_order_requests FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admin all custom orders"    ON custom_order_requests FOR ALL TO authenticated USING (is_admin());

-- ══════════════════════════════════════════════════════════
-- STORAGE BUCKETS
-- Run these in Supabase → Storage (or SQL Editor)
-- ══════════════════════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public) VALUES ('products',    'products',    true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('categories',  'categories',  true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('hero-slides', 'hero-slides', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('blog',        'blog',        true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('custom-orders','custom-orders', true) ON CONFLICT DO NOTHING;

-- Storage RLS: public read, admin write
CREATE POLICY "Public read products bucket" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'products');
CREATE POLICY "Admin upload products"       ON storage.objects FOR INSERT TO authenticated USING (bucket_id = 'products' AND is_admin());
CREATE POLICY "Admin delete products"       ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'products' AND is_admin());

CREATE POLICY "Public read categories bucket" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'categories');
CREATE POLICY "Admin upload categories"       ON storage.objects FOR INSERT TO authenticated USING (bucket_id = 'categories' AND is_admin());

CREATE POLICY "Public read hero bucket" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'hero-slides');
CREATE POLICY "Admin upload hero"       ON storage.objects FOR INSERT TO authenticated USING (bucket_id = 'hero-slides' AND is_admin());

CREATE POLICY "Public read blog bucket" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'blog');
CREATE POLICY "Admin upload blog"       ON storage.objects FOR INSERT TO authenticated USING (bucket_id = 'blog' AND is_admin());

-- ══════════════════════════════════════════════════════════
-- SEED DATA — Categories
-- ══════════════════════════════════════════════════════════

INSERT INTO categories (name, slug, display_order) VALUES
  ('Bangles',          'bangles',          1),
  ('Earrings',         'earrings',         2),
  ('Necklaces',        'necklaces',        3),
  ('Mangalsutra',      'mangalsutra',      4),
  ('Maangtikka',       'maangtikka',       5),
  ('Rings',            'rings',            6),
  ('Anklets',          'anklets',          7),
  ('Nose Ring',        'nose-ring',        8),
  ('Bridal Set',       'bridal',           9),
  ('Festive',          'festive',          10),
  ('Custom Orders',    'custom-jewelry',   11),
  ('Rajwada Heritage', 'rajwada-heritage', 12)
ON CONFLICT (slug) DO NOTHING;

-- ══════════════════════════════════════════════════════════
-- MAKE YOURSELF ADMIN
-- After signing up, run this once with your user email:
-- UPDATE profiles SET is_admin = true
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL@gmail.com');
-- ══════════════════════════════════════════════════════════
