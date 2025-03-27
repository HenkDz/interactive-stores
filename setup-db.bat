@echo off
echo Setting up D1 database from scratch...

echo Running table creation script...
wrangler d1 execute stores-deals --local --file=./migrations/setup_tables.sql

echo.
echo Inserting store data...
wrangler d1 execute stores-deals --local --command="INSERT INTO stores (name, logo, bg_color, color, active) VALUES ('Amazon', '/assets/amazon-logo.svg', 'from-orange-500 to-yellow-500', 'bg-orange-500', 1)"
wrangler d1 execute stores-deals --local --command="INSERT INTO stores (name, logo, bg_color, color, active) VALUES ('AliExpress', '/assets/aliexpress-logo.svg', 'from-[#e43225] to-[#c62a20]', 'bg-[#e43225]', 1)"

echo.
echo Inserting deals...
wrangler d1 execute stores-deals --local --command="INSERT INTO deals (store_id, title, description, importance, link, active) VALUES (1, 'Just-added Deals', 'Fresh deals added daily', 'medium', 'https://amazon.com/deals', 1)"
wrangler d1 execute stores-deals --local --command="INSERT INTO deals (store_id, title, description, importance, link, active) VALUES (2, 'Flash Deals', 'Limited-time offers', 'high', 'https://aliexpress.com/flashdeals', 1)"

echo.
echo Inserting admin users...
wrangler d1 execute stores-deals --local --command="INSERT INTO admins (username, password, role) VALUES ('admin', 'password123', 'super_admin')"

echo.
echo Inserting footer links...
wrangler d1 execute stores-deals --local --command="INSERT INTO footer_links (category_id, title, link, active) VALUES (1, 'About Us', '/about', 1)"
wrangler d1 execute stores-deals --local --command="INSERT INTO footer_links (category_id, title, link, active) VALUES (2, 'Help Center', '/help', 1)"
wrangler d1 execute stores-deals --local --command="INSERT INTO footer_links (category_id, title, link, active) VALUES (3, 'Privacy Policy', '/privacy-policy', 1)"

echo.
echo Verifying data...

echo.
echo Stores:
wrangler d1 execute stores-deals --local --command="SELECT * FROM stores"

echo.
echo Deals:
wrangler d1 execute stores-deals --local --command="SELECT * FROM deals"

echo.
echo Footer Links:
wrangler d1 execute stores-deals --local --command="SELECT * FROM footer_links"

echo.
echo Admins:
wrangler d1 execute stores-deals --local --command="SELECT * FROM admins"

echo.
echo Setup complete! 