-- Users Table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  virtual_credit NUMERIC(10,2) DEFAULT 10.00,
  winning_balance NUMERIC(10,2) DEFAULT 0.00,
  upi_id TEXT,
  level INT DEFAULT 1,
  xp INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Marketplace Items
CREATE TABLE marketplace_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  creator_username TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  category TEXT DEFAULT 'skin',
  image_data TEXT,
  verified BOOLEAN DEFAULT false,
  sales_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Inventory
CREATE TABLE inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL,
  item_id UUID REFERENCES marketplace_items(id),
  equipped BOOLEAN DEFAULT false,
  purchased_at TIMESTAMP DEFAULT NOW()
);

-- Transactions
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL,
  type TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'success',
  meta JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security (optional for now)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
