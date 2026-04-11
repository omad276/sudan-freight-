-- Full Platform Revision: Trips + Cargo Requests Model
-- Remove bidding, add direct listings with payment gating

-- New table: trips (Carrier posts available trips)
CREATE TABLE IF NOT EXISTS trips (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  carrier_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  from_city     TEXT NOT NULL,
  to_city       TEXT NOT NULL,
  trip_date     DATE NOT NULL,
  truck_type    TEXT,
  capacity_tons NUMERIC(6,2),
  price_sdg     NUMERIC(12,2),
  notes         TEXT,
  is_published  BOOLEAN DEFAULT FALSE,
  fee_amount    NUMERIC(12,2),
  fee_note      TEXT,
  status        TEXT DEFAULT 'pending_payment',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on trips
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

-- RLS policies for trips
CREATE POLICY "Carriers can create trips" ON trips
  FOR INSERT WITH CHECK (auth.uid() = carrier_id);

CREATE POLICY "Carriers can update own trips" ON trips
  FOR UPDATE USING (auth.uid() = carrier_id);

CREATE POLICY "Carriers can delete own unpublished trips" ON trips
  FOR DELETE USING (auth.uid() = carrier_id AND is_published = FALSE);

CREATE POLICY "Published trips viewable" ON trips
  FOR SELECT USING (
    is_published = TRUE
    OR carrier_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Update shipments status column if needed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shipments' AND column_name = 'status'
  ) THEN
    ALTER TABLE shipments ADD COLUMN status TEXT DEFAULT 'pending_payment';
  END IF;
END $$;

-- Update existing shipments to have correct status
UPDATE shipments SET status = 'pending_payment' WHERE status IS NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_trips_carrier_id ON trips(carrier_id);
CREATE INDEX IF NOT EXISTS idx_trips_is_published ON trips(is_published);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
CREATE INDEX IF NOT EXISTS idx_trips_trip_date ON trips(trip_date);
CREATE INDEX IF NOT EXISTS idx_shipments_is_published ON shipments(is_published);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_trips_updated_at ON trips;
CREATE TRIGGER update_trips_updated_at
  BEFORE UPDATE ON trips
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
