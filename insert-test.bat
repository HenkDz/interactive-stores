@echo off
wrangler d1 execute stores-deals --local --command="INSERT INTO stores (name, logo, bg_color, color, active) VALUES ('Test Store', '/assets/test-logo.svg', 'blue', 'blue', 1)" 