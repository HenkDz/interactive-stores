# Direct D1 Commands

These commands let you work directly with your D1 database from the command line using Wrangler.

## Setting up your database

```bash
# Apply the schema to create all tables
wrangler d1 execute stores-db --local --file=./migrations/setup_tables.sql

# Verify the tables were created
wrangler d1 execute stores-db --local --command="SELECT name FROM sqlite_master WHERE type='table'"
```

## Inserting sample data

```bash
# Insert a store
wrangler d1 execute stores-db --local --command="INSERT INTO stores (name, logo, bg_color, color, active) VALUES ('Amazon', '/assets/amazon-logo.svg', 'from-orange-500 to-yellow-500', 'bg-orange-500', 1)"

# Insert a deal for the store (replace 1 with the actual store ID)
wrangler d1 execute stores-db --local --command="INSERT INTO deals (store_id, title, description, importance, link, active) VALUES (1, 'Flash Deals', 'Limited time offers', 'high', 'https://amazon.com/deals', 1)"

# Insert an admin user
wrangler d1 execute stores-db --local --command="INSERT INTO admins (username, password, role) VALUES ('admin', 'password123', 'super_admin')"
```

## Querying data

```bash
# List all stores
wrangler d1 execute stores-db --local --command="SELECT * FROM stores"

# List all deals with store information
wrangler d1 execute stores-db --local --command="SELECT d.*, s.name as store_name FROM deals d JOIN stores s ON d.store_id = s.id"

# List all admins
wrangler d1 execute stores-db --local --command="SELECT id, username, role FROM admins"
```

## Advanced operations

```bash
# Drop a table if needed
wrangler d1 execute stores-db --local --command="DROP TABLE IF EXISTS deals"

# Modify a table structure
wrangler d1 execute stores-db --local --command="ALTER TABLE stores ADD COLUMN website TEXT"

# Delete records
wrangler d1 execute stores-db --local --command="DELETE FROM deals WHERE store_id = 1"
```

## Running the setup script

Instead of running these commands manually, you can use the setup script:

```bash
bun run setup-d1
```

This will set up your tables and populate them with sample data in one step.

## Using with the production database

For production, remove the `--local` flag:

```bash
# Example for production
wrangler d1 execute stores-db --command="SELECT * FROM stores"
``` 