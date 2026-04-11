-- Niloq Platform - Database Schema
-- Version: 1.0
-- Date: March 2026

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

-- User roles
CREATE TYPE user_role AS ENUM ('shipper', 'carrier', 'admin');

-- Shipment status
CREATE TYPE shipment_status AS ENUM (
  'pending',      -- Awaiting offers
  'offered',      -- Has offers
  'accepted',     -- Offer accepted
  'in_transit',   -- Currently being delivered
  'delivered',    -- Goods delivered
  'completed',    -- Payment confirmed by admin
  'cancelled'
);

-- Offer status
CREATE TYPE offer_status AS ENUM ('pending', 'accepted', 'rejected', 'withdrawn');

-- Truck status
CREATE TYPE truck_status AS ENUM ('available', 'in_use', 'maintenance', 'inactive');

-- Cargo type
CREATE TYPE cargo_type AS ENUM (
  'general',
  'construction',
  'agricultural',
  'livestock',
  'furniture',
  'electronics',
  'food',
  'other'
);

-- Truck type
CREATE TYPE truck_type AS ENUM ('flatbed', 'enclosed', 'refrigerated', 'tanker');

-- Document type
CREATE TYPE document_type AS ENUM ('license', 'registration', 'insurance', 'permit');

-- ============================================
-- PROFILES TABLE (extends auth.users)
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  role user_role NOT NULL,
  company_name VARCHAR(255),
  city VARCHAR(100),
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  preferred_language VARCHAR(2) NOT NULL DEFAULT 'ar' CHECK (preferred_language IN ('ar', 'en')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles viewable by authenticated users"
  ON profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admin can update any profile"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- TRUCKS TABLE
-- ============================================
CREATE TABLE trucks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  carrier_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plate_number VARCHAR(20) NOT NULL UNIQUE,
  truck_type truck_type NOT NULL,
  capacity_tons DECIMAL(10,2) NOT NULL CHECK (capacity_tons > 0),
  status truck_status NOT NULL DEFAULT 'available',
  documents JSONB DEFAULT '[]'::JSONB, -- Array of {type, url, expiry_date}
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE trucks ENABLE ROW LEVEL SECURITY;

-- Trucks policies
CREATE POLICY "Trucks viewable by authenticated users"
  ON trucks FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Carriers can create own trucks"
  ON trucks FOR INSERT
  WITH CHECK (
    auth.uid() = carrier_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'carrier')
  );

CREATE POLICY "Carriers can update own trucks"
  ON trucks FOR UPDATE
  USING (auth.uid() = carrier_id);

CREATE POLICY "Admin can update any truck"
  ON trucks FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Carriers can delete own unverified trucks"
  ON trucks FOR DELETE
  USING (auth.uid() = carrier_id AND is_verified = FALSE);

-- ============================================
-- SHIPMENTS TABLE
-- ============================================
CREATE TABLE shipments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipper_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pickup_city VARCHAR(100) NOT NULL,
  pickup_address TEXT,
  dropoff_city VARCHAR(100) NOT NULL,
  dropoff_address TEXT,
  cargo_type cargo_type NOT NULL,
  weight_tons DECIMAL(10,2) NOT NULL CHECK (weight_tons > 0),
  description TEXT,
  pickup_date DATE NOT NULL,
  status shipment_status NOT NULL DEFAULT 'pending',
  accepted_offer_id UUID, -- Set when offer accepted
  accepted_price DECIMAL(12,2), -- Final agreed price
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;

-- Shipments policies
CREATE POLICY "Open shipments viewable by all authenticated users"
  ON shipments FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    (
      status = 'pending' OR
      status = 'offered' OR
      shipper_id = auth.uid() OR
      EXISTS (SELECT 1 FROM offers WHERE shipment_id = shipments.id AND carrier_id = auth.uid()) OR
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    )
  );

CREATE POLICY "Shippers can create shipments"
  ON shipments FOR INSERT
  WITH CHECK (
    auth.uid() = shipper_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'shipper')
  );

CREATE POLICY "Shippers can update own pending shipments"
  ON shipments FOR UPDATE
  USING (
    auth.uid() = shipper_id AND
    status IN ('pending', 'offered')
  );

CREATE POLICY "Admin can update any shipment"
  ON shipments FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Carriers can update assigned shipments"
  ON shipments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM offers
      WHERE offers.shipment_id = shipments.id
      AND offers.carrier_id = auth.uid()
      AND offers.status = 'accepted'
    )
  );

-- ============================================
-- OFFERS TABLE
-- ============================================
CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  carrier_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  truck_id UUID NOT NULL REFERENCES trucks(id) ON DELETE CASCADE,
  price DECIMAL(12,2) NOT NULL CHECK (price > 0),
  notes TEXT,
  status offer_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(shipment_id, carrier_id) -- One offer per carrier per shipment
);

-- Enable RLS
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- Offers policies
CREATE POLICY "Offers viewable by shipment owner or offer owner"
  ON offers FOR SELECT
  USING (
    auth.uid() = carrier_id OR
    EXISTS (SELECT 1 FROM shipments WHERE id = shipment_id AND shipper_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Carriers can create offers"
  ON offers FOR INSERT
  WITH CHECK (
    auth.uid() = carrier_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'carrier') AND
    EXISTS (SELECT 1 FROM trucks WHERE id = truck_id AND carrier_id = auth.uid() AND is_verified = TRUE)
  );

CREATE POLICY "Carriers can update own pending offers"
  ON offers FOR UPDATE
  USING (auth.uid() = carrier_id AND status = 'pending');

CREATE POLICY "Shippers can update offers on their shipments"
  ON offers FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM shipments WHERE id = shipment_id AND shipper_id = auth.uid())
  );

CREATE POLICY "Admin can update any offer"
  ON offers FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- RATINGS TABLE
-- ============================================
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  rater_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rated_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(shipment_id, rater_id, rated_id)
);

-- Enable RLS
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Ratings policies
CREATE POLICY "Ratings viewable by everyone"
  ON ratings FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create ratings for completed shipments they participated in"
  ON ratings FOR INSERT
  WITH CHECK (
    auth.uid() = rater_id AND
    auth.uid() != rated_id AND
    EXISTS (
      SELECT 1 FROM shipments
      WHERE id = shipment_id
      AND status = 'completed'
      AND (
        shipper_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM offers
          WHERE shipment_id = ratings.shipment_id
          AND carrier_id = auth.uid()
          AND status = 'accepted'
        )
      )
    )
  );

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_city ON profiles(city);
CREATE INDEX idx_profiles_verified ON profiles(is_verified);

CREATE INDEX idx_trucks_carrier ON trucks(carrier_id);
CREATE INDEX idx_trucks_status ON trucks(status);
CREATE INDEX idx_trucks_verified ON trucks(is_verified);
CREATE INDEX idx_trucks_type ON trucks(truck_type);

CREATE INDEX idx_shipments_shipper ON shipments(shipper_id);
CREATE INDEX idx_shipments_status ON shipments(status);
CREATE INDEX idx_shipments_pickup_date ON shipments(pickup_date);
CREATE INDEX idx_shipments_pickup_city ON shipments(pickup_city);
CREATE INDEX idx_shipments_dropoff_city ON shipments(dropoff_city);
CREATE INDEX idx_shipments_cargo_type ON shipments(cargo_type);

CREATE INDEX idx_offers_shipment ON offers(shipment_id);
CREATE INDEX idx_offers_carrier ON offers(carrier_id);
CREATE INDEX idx_offers_status ON offers(status);

CREATE INDEX idx_ratings_rated ON ratings(rated_id);
CREATE INDEX idx_ratings_shipment ON ratings(shipment_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trucks_updated_at
  BEFORE UPDATE ON trucks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shipments_updated_at
  BEFORE UPDATE ON shipments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_offers_updated_at
  BEFORE UPDATE ON offers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, phone, name, role, preferred_language)
  VALUES (
    NEW.id,
    COALESCE(NEW.phone, ''),
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'shipper'),
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'ar')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update shipment status when first offer is made
CREATE OR REPLACE FUNCTION update_shipment_on_first_offer()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE shipments
  SET status = 'offered', updated_at = NOW()
  WHERE id = NEW.shipment_id AND status = 'pending';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_offer_created
  AFTER INSERT ON offers
  FOR EACH ROW EXECUTE FUNCTION update_shipment_on_first_offer();

-- Function to update shipment when offer is accepted
CREATE OR REPLACE FUNCTION update_shipment_on_offer_accepted()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    -- Update the shipment
    UPDATE shipments
    SET
      status = 'accepted',
      accepted_offer_id = NEW.id,
      accepted_price = NEW.price,
      updated_at = NOW()
    WHERE id = NEW.shipment_id;

    -- Reject all other offers for this shipment
    UPDATE offers
    SET status = 'rejected', updated_at = NOW()
    WHERE shipment_id = NEW.shipment_id AND id != NEW.id AND status = 'pending';

    -- Update truck status
    UPDATE trucks
    SET status = 'in_use', updated_at = NOW()
    WHERE id = NEW.truck_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_offer_accepted
  AFTER UPDATE ON offers
  FOR EACH ROW EXECUTE FUNCTION update_shipment_on_offer_accepted();

-- Function to update truck status when shipment is completed
CREATE OR REPLACE FUNCTION update_truck_on_shipment_completed()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE trucks
    SET status = 'available', updated_at = NOW()
    WHERE id = (
      SELECT truck_id FROM offers WHERE id = NEW.accepted_offer_id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_shipment_completed
  AFTER UPDATE ON shipments
  FOR EACH ROW EXECUTE FUNCTION update_truck_on_shipment_completed();

-- Function to get user average rating
CREATE OR REPLACE FUNCTION get_user_rating(user_uuid UUID)
RETURNS TABLE (avg_rating NUMERIC, rating_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(ROUND(AVG(rating)::NUMERIC, 1), 0) AS avg_rating,
    COUNT(*) AS rating_count
  FROM ratings
  WHERE rated_id = user_uuid;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STORAGE BUCKETS (to be created in Supabase Dashboard)
-- ============================================
-- 1. 'documents' bucket (private) - for truck licenses, permits
-- 2. 'avatars' bucket (public) - for user profile photos

-- Note: Storage bucket policies should be configured in Supabase Dashboard:
-- documents bucket:
--   - Authenticated users can upload to their own folder
--   - Only admins and file owners can view
-- avatars bucket:
--   - Public read access
--   - Authenticated users can upload to their own folder
