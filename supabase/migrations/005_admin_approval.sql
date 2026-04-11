-- Add approval fields to shipments table
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS admin_approved BOOLEAN DEFAULT FALSE;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS submitted_for_approval TIMESTAMP DEFAULT NOW();
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Add approval fields to trips table (existing table)
ALTER TABLE trips ADD COLUMN IF NOT EXISTS admin_approved BOOLEAN DEFAULT FALSE;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS submitted_for_approval TIMESTAMP DEFAULT NOW();
ALTER TABLE trips ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Update RLS policies for trips to allow public view of approved trips
DROP POLICY IF EXISTS trips_public_select ON trips;
CREATE POLICY trips_public_select ON trips FOR SELECT USING (
  status = 'published' OR
  auth.uid() = carrier_id OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
