// User roles
export type UserRole = 'shipper' | 'carrier' | 'admin';

// Listing status (for both trips and cargo requests)
export type ListingStatus = 'pending_payment' | 'published' | 'completed' | 'cancelled';

// Cargo types
export type CargoType =
  | 'general'
  | 'construction'
  | 'agricultural'
  | 'livestock'
  | 'furniture'
  | 'electronics'
  | 'food'
  | 'other';

// Truck types
export type TruckType = 'flatbed' | 'enclosed' | 'refrigerated' | 'tanker';

// Profile
export interface Profile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  company_name?: string | null;
  city?: string | null;
  is_verified: boolean;
  is_active: boolean;
  preferred_language: 'ar' | 'en';
  created_at: string;
  updated_at: string;
  // Computed fields
  avg_rating?: number;
  rating_count?: number;
}

// Trip (Carrier posts available trips)
export interface Trip {
  id: string;
  carrier_id: string;
  from_city: string;
  to_city: string;
  trip_date: string;
  truck_type?: string | null;
  capacity_tons?: number | null;
  price_sdg?: number | null;
  notes?: string | null;
  is_published: boolean;
  fee_amount?: number | null;
  fee_note?: string | null;
  status: ListingStatus;
  created_at: string;
  updated_at: string;
  // Joined fields
  carrier?: Profile;
}

// Cargo Request / Shipment (Shipper posts cargo requests)
export interface Shipment {
  id: string;
  shipper_id: string;
  pickup_city: string;
  pickup_address?: string | null;
  dropoff_city: string;
  dropoff_address?: string | null;
  cargo_type: CargoType;
  weight_tons: number;
  description?: string | null;
  pickup_date: string;
  status: ListingStatus;
  is_published: boolean;
  fee_amount?: number | null;
  fee_note?: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  shipper?: Profile;
}

// Form data types
export interface TripFormData {
  from_city: string;
  to_city: string;
  trip_date: string;
  truck_type?: string;
  capacity_tons?: number;
  price_sdg?: number;
  notes?: string;
}

export interface ShipmentFormData {
  pickup_city: string;
  pickup_address?: string;
  dropoff_city: string;
  dropoff_address?: string;
  cargo_type: CargoType;
  weight_tons: number;
  description?: string;
  pickup_date: string;
}

export interface RegisterFormData {
  email: string;
  name: string;
  role: 'shipper' | 'carrier';
  company_name?: string;
  city?: string;
  preferred_language: 'ar' | 'en';
}

// Filter types
export interface TripFilters {
  from_city?: string;
  to_city?: string;
  truck_type?: string;
  date_from?: string;
  date_to?: string;
}

export interface ShipmentFilters {
  cargo_type?: CargoType;
  pickup_city?: string;
  dropoff_city?: string;
  min_weight?: number;
  max_weight?: number;
  pickup_date_from?: string;
  pickup_date_to?: string;
}

// Dashboard stats
export interface ShipperStats {
  total_requests: number;
  pending_payment: number;
  published: number;
}

export interface CarrierStats {
  total_trips: number;
  pending_payment: number;
  published: number;
}

export interface AdminStats {
  total_users: number;
  total_shippers: number;
  total_carriers: number;
  pending_trips: number;
  pending_shipments: number;
  published_trips: number;
  published_shipments: number;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Auth types
export interface AuthUser {
  id: string;
  email: string;
  profile?: Profile;
}
