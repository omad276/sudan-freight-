-- Payment-Gated Publishing Feature
-- Admin must confirm payment before listings go live

-- Add columns to shipments
ALTER TABLE shipments
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS fee_amount NUMERIC(12,2),
ADD COLUMN IF NOT EXISTS fee_note TEXT;

-- Add columns to trucks
ALTER TABLE trucks
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS fee_amount NUMERIC(12,2),
ADD COLUMN IF NOT EXISTS fee_note TEXT;

-- Update RLS policies for shipments
DROP POLICY IF EXISTS "Shipments viewable" ON shipments;
DROP POLICY IF EXISTS "Open shipments viewable by all authenticated users" ON shipments;

CREATE POLICY "Published shipments viewable" ON shipments
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      is_published = TRUE
      OR shipper_id = auth.uid()
      OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    )
  );

-- Update RLS policies for trucks
DROP POLICY IF EXISTS "Trucks viewable" ON trucks;
DROP POLICY IF EXISTS "Trucks viewable by authenticated users" ON trucks;

CREATE POLICY "Published trucks viewable" ON trucks
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      is_published = TRUE
      OR carrier_id = auth.uid()
      OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    )
  );
