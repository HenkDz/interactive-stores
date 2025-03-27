# Interactive Stores

An interactive affiliate stores application built with Cloudflare Workers, React, and Tailwind CSS.

## Features

- Multiple affiliate store fronts (Amazon, AliExpress, Temu)
- Admin dashboard for managing content
- Cloudflare D1 database integration
- KV storage for static content

## Setup

### Prerequisites

- Node.js
- Bun (optional but recommended)
- Cloudflare account with Workers, D1, and KV access

### Installation

```bash
# Clone the repository
git clone https://github.com/HenkDz/interactive-stores.git
cd interactive-stores

# Install dependencies
npm install
# or with Bun
bun install

# Setup local development environment
npm run setup-db
# or with Bun
bun run setup-db
```

### Development

```bash
npm run dev
# or with Bun
bun run dev
```

### Build

```bash
npm run build
# or with Bun
bun run build
```

### Deploy

```bash
npm run deploy
# or with Bun
bun run deploy
```

## License

MIT