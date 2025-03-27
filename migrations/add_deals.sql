-- Additional deals for Amazon (store_id = 1)
INSERT INTO deals (store_id, title, description, importance, link, active)
VALUES 
    (1, 'Trending Deals', 'Most popular right now', 'high', 'https://amazon.com/trending', 1),
    (1, 'Top Anticipated', 'Upcoming sales events', 'medium', 'https://amazon.com/upcoming', 1),
    (1, 'Creator Favorites', 'Recommended by influencers', 'high', 'https://amazon.com/influencers', 1),
    (1, 'Spring Fashion', 'Latest seasonal trends', 'medium', 'https://amazon.com/fashion', 1),
    (1, 'Best of Beauty', 'Top-rated beauty products', 'low', 'https://amazon.com/beauty', 1);

-- Additional deals for AliExpress (store_id = 2)
INSERT INTO deals (store_id, title, description, importance, link, active)
VALUES 
    (2, 'New User Deals', 'Special first-purchase offers', 'medium', 'https://aliexpress.com/new', 1),
    (2, 'Superdeals', 'Best prices guaranteed', 'high', 'https://aliexpress.com/super', 1),
    (2, 'Clearance', 'Last chance items', 'low', 'https://aliexpress.com/clearance', 1);

-- Add Temu as a new store (store_id = 3)
INSERT INTO stores (name, logo, bg_color, color, active)
VALUES ('Temu', '/assets/temu-logo.svg', 'from-[#fb7701] to-[#f06000]', 'bg-[#fb7701]', 1);

-- Add Temu deals
INSERT INTO deals (store_id, title, description, importance, link, active)
VALUES 
    (3, 'Daily Picks', 'Hand-selected deals', 'high', 'https://temu.com/daily', 1),
    (3, 'Under $1', 'Incredible savings', 'medium', 'https://temu.com/under1', 1),
    (3, 'New Arrivals', 'Just landed', 'medium', 'https://temu.com/new', 1),
    (3, 'Bundle Deals', 'Save more buying together', 'high', 'https://temu.com/bundle', 1); 