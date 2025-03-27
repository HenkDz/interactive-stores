# Stores.deals

An interactive store deals comparison platform built with React, TypeScript, and Cloudflare Pages.

## Features

- Compare deals across multiple stores
- Interactive UI with animations
- Admin dashboard for managing store data
- Data stored in Cloudflare D1 database and KV for improved performance and scalability

## Getting Started

### Prerequisites

- Bun (v1.0 or higher) - Recommended
- Node.js (v18 or higher)
- NPM or Yarn
- Cloudflare account with Pages and D1 database access

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   # Using Bun (recommended for faster installs)
   bun install

   # Using npm
   npm install
   ```
3. Start the development server:
   ```
   # Using Bun
   bun run local-dev

   # Using npm
   npm run dev
   ```

## Using Bun (Recommended)

This project is optimized to use Bun, a fast JavaScript runtime and package manager. Benefits include:

- Faster package installations
- Improved local development experience
- More efficient file operations
- Better ESM support

### Bun-specific Configuration

This project includes Bun-specific optimizations:
- `bunfig.toml` - Configures Bun behavior for this project
- Optimized scripts in package.json
- Enhanced file I/O in development scripts

To get started with Bun:
1. Install Bun: `npm install -g bun` or follow instructions at [bun.sh](https://bun.sh)
2. Use `bun` commands instead of npm: `bun run local-dev`, `bun install`, etc.

## D1 Database Setup

The application uses Cloudflare D1 for data storage. Follow these steps to set it up:

1. Create a D1 database in your Cloudflare dashboard:
   ```
   wrangler d1 create stores-db
   ```

2. Update the `wrangler.toml` file with your D1 database ID:
   ```toml
   [[d1_databases]]
   binding = "STORES_DB"
   database_name = "stores-db" 
   database_id = "YOUR_D1_DATABASE_ID"
   ```

3. Initialize the D1 database with your local data:
   ```
   bun run init-d1
   ```

4. To use the D1 database locally:
   ```
   wrangler d1 execute stores-db --local --file=./migrations/0001_create_tables.sql
   ```

## Cloudflare KV Setup

The application also uses Cloudflare KV as a fallback storage. Follow these steps to set it up:

1. Create a KV namespace in your Cloudflare account
2. Update the `wrangler.toml` file with your KV namespace ID:
   ```
   kv_namespaces = [
     { binding = "STORE_DATA", id = "YOUR_KV_NAMESPACE_ID" }
   ]
   ```
3. Initialize the KV store with your local data:
   ```
   bun run init-kv
   ```

## Deployment

To deploy to Cloudflare Pages:

```
bun run pages:deploy
```

This will build the application and deploy it to Cloudflare Pages.

## Managing Data

There are two ways to manage the store data:

1. **Admin Dashboard**: Use the built-in admin dashboard at `/admin/dashboard`
2. **D1 Database API**: Use the D1 database REST API endpoints:
   - `GET /api/admin/stores` - Get all stores
   - `GET /api/admin/stores/{id}` - Get a specific store
   - `POST /api/admin/stores` - Create a new store
   - `POST /api/admin/save` - Save all store data

## API Endpoints

- `GET /api/data` - Get all store data 
- `POST /api/admin/save` - Save updated store data
- `POST /api/admin/init-db` - Initialize D1 database with data

## License

MIT 