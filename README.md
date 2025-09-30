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

## Project Structure

```
src/
├── app/                # Next.js App Router pages
│   ├── api/           # API routes
│   └── check/         # Result pages
├── components/        # React components
├── lib/              # Core business logic
│   ├── score/        # Scoring system
│   ├── validation/   # Validation logic
│   ├── apis/         # External API integrations
│   └── db/           # Database services
└── types/            # TypeScript types
```

## Deployment

Deploy on Vercel:

1. Push to GitHub
2. Import project to Vercel
3. Add environment variables
4. Deploy

## License

MIT