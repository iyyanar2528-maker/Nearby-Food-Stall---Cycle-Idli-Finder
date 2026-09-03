export const CREATE_TABLES_SQL = `
-- 1. Users Table (Customers, Shop Owners, Moving Stall Vendors)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK(role IN ('customer', 'shop_owner', 'moving_stall_owner')),
  language TEXT NOT NULL DEFAULT 'en',
  state_region TEXT NOT NULL DEFAULT 'all',
  avatar TEXT,
  stall_id TEXT,
  business_name TEXT,
  business_address TEXT,
  fssai_number TEXT,
  active_subscription_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 2. Phone OTP Verifications Table
CREATE TABLE IF NOT EXISTS otp_verifications (
  id TEXT PRIMARY KEY,
  phone TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'customer',
  metadata TEXT DEFAULT '{}', -- JSON containing language, stateRegion, businessName, etc.
  expires_at DATETIME NOT NULL,
  is_verified INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_verifications(phone);
CREATE INDEX IF NOT EXISTS idx_otp_expires ON otp_verifications(expires_at);

-- 3. Food Spots & Stalls Table
CREATE TABLE IF NOT EXISTS food_spots (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_ta TEXT,
  name_hi TEXT,
  vendor_id TEXT,
  vendor_name TEXT,
  vendor_phone TEXT,
  category TEXT NOT NULL,
  stall_type TEXT NOT NULL CHECK(stall_type IN ('moving_cycle', 'fixed_stall', 'handcart', 'small_shop')),
  state_region TEXT NOT NULL CHECK(state_region IN ('maharashtra', 'tamil_nadu')),
  city_area TEXT NOT NULL,
  image TEXT NOT NULL,
  thumbnail TEXT NOT NULL,
  rating REAL DEFAULT 4.8,
  review_count INTEGER DEFAULT 1,
  price_range TEXT DEFAULT '₹',
  top_deal_item TEXT NOT NULL,
  top_deal_price REAL NOT NULL,
  top_deal_badge TEXT NOT NULL,
  distance_meters INTEGER DEFAULT 75,
  walking_time_seconds INTEGER DEFAULT 60,
  steps_count INTEGER DEFAULT 100,
  bearing_degrees INTEGER DEFAULT 0,
  address TEXT NOT NULL,
  opening_hours TEXT NOT NULL,
  is_open_now INTEGER DEFAULT 1,
  is_moving_now INTEGER DEFAULT 0,
  speed_kmh REAL DEFAULT 0,
  current_lat REAL,
  current_lng REAL,
  dietary_tags TEXT DEFAULT '[]',
  payment_types TEXT DEFAULT '[]',
  description TEXT,
  secret_tip TEXT,
  photos TEXT DEFAULT '[]',
  live_status_text TEXT,
  stock_count TEXT DEFAULT '{}',
  active_subscribers_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_spots_region ON food_spots(state_region);
CREATE INDEX IF NOT EXISTS idx_spots_type ON food_spots(stall_type);

-- 4. Menu Items Table
CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY,
  spot_id TEXT NOT NULL,
  name TEXT NOT NULL,
  name_ta TEXT,
  name_hi TEXT,
  price REAL NOT NULL,
  description TEXT,
  is_bestseller INTEGER DEFAULT 0,
  is_vegetarian INTEGER DEFAULT 1,
  is_halal INTEGER DEFAULT 0,
  is_gluten_free INTEGER DEFAULT 0,
  FOREIGN KEY (spot_id) REFERENCES food_spots(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_menu_spot ON menu_items(spot_id);

-- 5. Subscription Plans Table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  title_ta TEXT,
  title_hi TEXT,
  target_role TEXT NOT NULL CHECK(target_role IN ('customer', 'vendor', 'shop')),
  price REAL NOT NULL,
  period TEXT NOT NULL,
  badge TEXT,
  popular INTEGER DEFAULT 0,
  savings_text TEXT,
  deliveries_count INTEGER,
  features TEXT DEFAULT '[]',
  features_ta TEXT DEFAULT '[]',
  features_hi TEXT DEFAULT '[]'
);

-- 6. User Subscriptions Table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_phone TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  plan_title TEXT NOT NULL,
  target_role TEXT NOT NULL,
  amount REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'paused', 'expired')),
  start_date DATETIME NOT NULL,
  expiry_date DATETIME NOT NULL,
  deliveries_remaining INTEGER,
  payment_method TEXT NOT NULL,
  payment_id TEXT NOT NULL,
  selected_spot_id TEXT,
  selected_spot_name TEXT,
  special_instructions TEXT,
  qr_pass_code TEXT NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_subs_user ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subs_status ON user_subscriptions(status);

-- 7. Customer Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  customer_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  spot_id TEXT NOT NULL,
  spot_name TEXT NOT NULL,
  items TEXT NOT NULL,
  total_amount REAL NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'preparing', 'ready', 'delivered', 'cancelled')),
  is_subscription_delivery INTEGER DEFAULT 0,
  delivery_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_spot ON orders(spot_id);

-- 8. Live Broadcast States Table
CREATE TABLE IF NOT EXISTS broadcast_states (
  spot_id TEXT PRIMARY KEY,
  is_moving INTEGER DEFAULT 1,
  distance_meters INTEGER DEFAULT 75,
  speed_kmh REAL DEFAULT 6,
  bearing_degrees INTEGER DEFAULT 0,
  last_bell_rung_at DATETIME,
  current_area TEXT,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (spot_id) REFERENCES food_spots(id) ON DELETE CASCADE
);

-- 9. Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  spot_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  rating REAL NOT NULL CHECK(rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (spot_id) REFERENCES food_spots(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_reviews_spot ON reviews(spot_id);
`;
