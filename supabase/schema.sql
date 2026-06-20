-- ============================================================
-- MEENA RAJWADA — Supabase Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Profiles (auto-created on auth signup via trigger)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to auto-create profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  image_url TEXT,
  display_order INT DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  mrp NUMERIC(10,2),
  material TEXT,
  images TEXT[] DEFAULT '{}',
  colors TEXT[] DEFAULT '{}',
  sizes TEXT[] DEFAULT '{}',
  stock INT DEFAULT 0,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  category_slug TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_new_arrival BOOLEAN DEFAULT FALSE,
  is_bestseller BOOLEAN DEFAULT FALSE,
  is_customizable BOOLEAN DEFAULT FALSE,
  in_hero_slider BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  shipping_address JSONB,
  subtotal NUMERIC(10,2) NOT NULL,
  shipping_amount NUMERIC(10,2) DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','processing','dispatched','delivered','cancelled')),
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid','paid','refunded')),
  cashfree_order_id TEXT,
  tracking_id TEXT,
  courier TEXT,
  dispatch_email_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT,
  size TEXT,
  quantity INT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hero Slides
CREATE TABLE IF NOT EXISTS hero_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  video_url TEXT,
  cta_text TEXT,
  cta_url TEXT,
  display_order INT DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  location TEXT,
  review TEXT NOT NULL,
  rating INT DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  avatar TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog Posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT,
  cover_image TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site Settings (single row)
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_text TEXT DEFAULT 'Free Shipping on orders above ₹5000',
  announcement_active BOOLEAN DEFAULT TRUE,
  whatsapp_number TEXT,
  instagram_url TEXT,
  facebook_url TEXT,
  youtube_url TEXT,
  pinterest_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Newsletter Subscribers
CREATE TABLE IF NOT EXISTS newsletter_subs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact Messages
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Custom Order Requests
CREATE TABLE IF NOT EXISTS custom_order_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  piece_type TEXT NOT NULL,
  description TEXT NOT NULL,
  budget TEXT,
  occasion TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subs ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_order_requests ENABLE ROW LEVEL SECURITY;

-- Profiles: user can read/update own
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Orders: user can read own
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all orders" ON orders FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Order items: follow order access
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Anyone can insert order items" ON order_items FOR INSERT WITH CHECK (true);

-- Public read policies
CREATE POLICY "Public read products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public read hero_slides" ON hero_slides FOR SELECT USING (is_active = true);
CREATE POLICY "Public read testimonials" ON testimonials FOR SELECT USING (is_active = true);
CREATE POLICY "Public read blog posts" ON blog_posts FOR SELECT USING (is_published = true);
CREATE POLICY "Public read site_settings" ON site_settings FOR SELECT USING (true);

-- Admin write policies
CREATE POLICY "Admins manage products" ON products FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins manage categories" ON categories FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins manage hero_slides" ON hero_slides FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins manage testimonials" ON testimonials FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins manage blog_posts" ON blog_posts FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins manage site_settings" ON site_settings FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins manage newsletter" ON newsletter_subs FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins manage contact_messages" ON contact_messages FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins manage custom_orders" ON custom_order_requests FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Public inserts (newsletter, contact)
CREATE POLICY "Anyone can subscribe newsletter" ON newsletter_subs FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can send contact message" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can submit custom order" ON custom_order_requests FOR INSERT WITH CHECK (true);
