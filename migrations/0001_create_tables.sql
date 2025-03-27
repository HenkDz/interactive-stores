-- Create stores table (which you mentioned already exists with an ID column)
-- Let's add more columns to it
ALTER TABLE stores ADD COLUMN name TEXT NOT NULL;
ALTER TABLE stores ADD COLUMN logo TEXT NOT NULL;
ALTER TABLE stores ADD COLUMN bg_color TEXT NOT NULL;
ALTER TABLE stores ADD COLUMN color TEXT NOT NULL;
ALTER TABLE stores ADD COLUMN active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE stores ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE stores ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create table for store deals
CREATE TABLE IF NOT EXISTS deals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  importance TEXT CHECK(importance IN ('low', 'medium', 'high')),
  link TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
);

-- Create table for footer links categories
CREATE TABLE IF NOT EXISTS footer_link_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create table for footer links
CREATE TABLE IF NOT EXISTS footer_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  link TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES footer_link_categories(id) ON DELETE CASCADE
);

-- Create table for admins
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT CHECK(role IN ('admin', 'super_admin')) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default footer categories
INSERT INTO footer_link_categories (name) VALUES 
  ('about'),
  ('support'),
  ('legal'); 