@echo off
echo Setting up D1 database...
wrangler d1 execute stores-deals --local --file=./migrations/setup_tables.sql
echo Inserting sample data...
wrangler d1 execute stores-deals --local --command="INSERT INTO stores (name, logo, bg_color, color, active) VALUES ('Amazon', '/assets/amazon-logo.svg', 'from-orange-500 to-yellow-500', 'bg-orange-500', 1)"
wrangler d1 execute stores-deals --local --command="INSERT INTO stores (name, logo, bg_color, color, active) VALUES ('AliExpress', '/assets/aliexpress-logo.svg', 'from-[#e43225] to-[#c62a20]', 'bg-[#e43225]', 1)"

echo Inserting deals...
wrangler d1 execute stores-deals --local --command="INSERT INTO deals (store_id, title, description, importance, link, active) VALUES (1, 'Flash Deals', 'Limited time offers', 'high', 'https://amazon.com/deals', 1)"
wrangler d1 execute stores-deals --local --command="INSERT INTO deals (store_id, title, description, importance, link, active) VALUES (2, 'Just-added Deals', 'Fresh deals added daily', 'medium', 'https://aliexpress.com/flashdeals', 1)"

echo Inserting admin...
wrangler d1 execute stores-deals --local --command="INSERT INTO admins (username, password, role) VALUES ('admin', 'password123', 'super_admin')"

echo Inserting footer links...
wrangler d1 execute stores-deals --local --command="INSERT INTO footer_links (category_id, title, link, active) VALUES (1, 'About Us', '/about', 1)"
wrangler d1 execute stores-deals --local --command="INSERT INTO footer_links (category_id, title, link, active) VALUES (2, 'Help Center', '/help', 1)"
wrangler d1 execute stores-deals --local --command="INSERT INTO footer_links (category_id, title, link, active) VALUES (3, 'Privacy Policy', '/privacy-policy', 1)"

echo Checking database...
wrangler d1 execute stores-deals --local --command="SELECT * FROM stores"
wrangler d1 execute stores-deals --local --command="SELECT d.*, s.name as store_name FROM deals d JOIN stores s ON d.store_id = s.id"
wrangler d1 execute stores-deals --local --command="SELECT * FROM footer_links"
echo Done! 