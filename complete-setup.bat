@echo off
echo Adding deals...
wrangler d1 execute stores-deals --local --command="INSERT INTO deals (store_id, title, description, importance, link, active) VALUES (1, 'Flash Deals', 'Limited time offers', 'high', 'https://teststore.com/deals', 1)"

echo Adding admin...
wrangler d1 execute stores-deals --local --command="INSERT INTO admins (username, password, role) VALUES ('admin', 'password123', 'super_admin')"

echo Adding footer links...
wrangler d1 execute stores-deals --local --command="INSERT INTO footer_links (category_id, title, link, active) VALUES (1, 'About Us', '/about', 1)"
wrangler d1 execute stores-deals --local --command="INSERT INTO footer_links (category_id, title, link, active) VALUES (2, 'Help Center', '/help', 1)"
wrangler d1 execute stores-deals --local --command="INSERT INTO footer_links (category_id, title, link, active) VALUES (3, 'Privacy Policy', '/privacy-policy', 1)"

echo All data added! 