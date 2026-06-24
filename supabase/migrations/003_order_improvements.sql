-- ============================================================
-- MEENA RAJWADA — Order improvements (Run in Supabase SQL Editor)
-- ============================================================

-- 1. Add order_number column (MR-10001 format)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number TEXT UNIQUE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS email_sent BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- 2. Backfill existing orders with sequential order numbers
DO $$
DECLARE
  rec RECORD;
  counter INT := 10001;
BEGIN
  FOR rec IN SELECT id FROM orders WHERE order_number IS NULL ORDER BY created_at ASC LOOP
    UPDATE orders SET order_number = 'MR-' || counter WHERE id = rec.id;
    counter := counter + 1;
  END LOOP;
END $$;

-- 3. Auto-update updated_at on every order change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_updated_at ON orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 4. Allow anon to track order by order_number (for Track Order page)
DROP POLICY IF EXISTS "Track order by number" ON orders;
CREATE POLICY "Track order by number"
  ON orders FOR SELECT TO anon
  USING (order_number IS NOT NULL);
