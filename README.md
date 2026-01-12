# CryptoGuardian

Cryptocurrency website security analysis tool with multi-layered validation.

## Features

- Domain age & registration analysis
- SSL certificate validation
- Blacklist checking (KISA, VirusTotal, PhishTank)
- Exchange verification
- AI-powered phishing detection
- Google Safe Browsing integration

## Tech Stack

- Next.js 15 + TypeScript
- Prisma + PostgreSQL (Neon)
- Redis (Upstash) for caching
- shadcn/ui components

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local`:

```bash
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Redis Cache
KV_REST_API_URL="https://..."
KV_REST_API_TOKEN="..."

# API Keys (Optional)
GOOGLE_SAFE_BROWSING_API_KEY=""
VIRUSTOTAL_API_KEY=""
COINGECKO_API_KEY=""
CRYPTOCOMPARE_API_KEY=""
```

### 3. Database Setup

```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Scripts

```bash
npm run dev                    # Development server
npm run build                  # Production build
npm run lint                   # ESLint check
npm run type-check             # TypeScript check

# Data Collection
npm run collect-exchanges      # Collect exchange data
npm run collect-cryptocompare  # Collect CryptoCompare data
npm run calculate-stats        # Calculate daily statistics
```

## Documentation

See [docs/](./docs/) for details:

- [System Architecture](./docs/01-system-architecture.md)
- [Validation Logic](./docs/02-validation-logic.md)
- [Data Sources](./docs/03-data-sources.md)
- [API Endpoints](./docs/04-api-endpoints.md)

## MCP Server (AI Integration)

```bash
cd mcp-server
npm install && npm run build
```

See [mcp-server/README.md](./mcp-server/README.md) for Claude Desktop setup.

## Deployment

Deploy on Vercel:

1. Push to GitHub
2. Import project to Vercel
3. Add environment variables
4. Deploy

## License

MIT