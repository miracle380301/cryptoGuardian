# CryptoGuardian System Architecture

## Overview

CryptoGuardian is a crypto exchange verification platform that helps users identify legitimate exchanges and detect phishing/scam sites.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15 + React 19 + TypeScript |
| Backend | Next.js API Routes |
| Database | PostgreSQL (Neon) + Prisma ORM |
| Cache | Redis (Upstash KV) |
| UI | shadcn/ui + Tailwind CSS 4 |
| External APIs | VirusTotal, Google Safe Browsing, CoinGecko, CryptoCompare, KISA |

## System Architecture Diagram

```
                                    +------------------+
                                    |   Web Browser    |
                                    |   (User)         |
                                    +--------+---------+
                                             |
                                             v
+------------------+              +----------+---------+
|   MCP Server     |              |                    |
| (AI Integration) +------------->|   Next.js App      |
+------------------+              |                    |
                                  |  +-------------+   |
                                  |  | API Routes  |   |
                                  |  +------+------+   |
                                  +---------|----------+
                                            |
              +-----------------------------+-----------------------------+
              |                             |                             |
              v                             v                             v
    +---------+--------+          +---------+--------+          +---------+--------+
    |                  |          |                  |          |                  |
    |  PostgreSQL DB   |          |   Redis Cache    |          |  External APIs   |
    |  (Neon)          |          |   (Upstash)      |          |                  |
    |                  |          |                  |          |  - VirusTotal    |
    |  - Exchanges     |          |  - Stats (7d)    |          |  - Safe Browsing |
    |  - Blacklist     |          |  - WHOIS cache   |          |  - CoinGecko     |
    |  - Reports       |          |                  |          |  - CryptoCompare |
    |  - Stats         |          |                  |          |                  |
    +------------------+          +------------------+          +------------------+
```

## Directory Structure

```
src/
├── app/                      # Next.js App Router
│   ├── api/                  # API Endpoints
│   │   ├── validate/         # Domain validation
│   │   ├── stats/            # Statistics
│   │   ├── exchanges/        # Exchange data
│   │   ├── ssl-check/        # SSL verification
│   │   ├── admin/            # Admin endpoints
│   │   └── reports/          # User reports
│   ├── check/[domain]/       # Validation result page
│   └── page.tsx              # Homepage
│
├── lib/
│   ├── score/                # Scoring engine (PROTECTED)
│   │   ├── score-calculator.ts
│   │   ├── score-config.ts
│   │   ├── validation-result-builder.ts
│   │   └── processors/       # Per-check processors
│   │
│   ├── validation/           # Validation logic (PROTECTED)
│   │   ├── blacklist-checker.ts
│   │   ├── crypto-exchange-checker.ts
│   │   ├── typosquatting-detector.ts
│   │   ├── suspicious-domain-detector.ts
│   │   ├── ssl-check.ts
│   │   ├── whois.ts
│   │   ├── safe-browsing.ts
│   │   └── user-reports.ts
│   │
│   ├── apis/
│   │   └── exchange.ts       # Exchange API client
│   ├── db/
│   │   ├── prisma.ts
│   │   └── services.ts
│   └── cache/
│       └── statsCache.ts
│
├── components/               # React components
│   ├── CheckForm.tsx
│   ├── CheckResults.tsx
│   └── ui/                   # shadcn/ui (PROTECTED)
│
└── types/                    # TypeScript types

scripts/                      # Data collection scripts
├── collect-exchanges.ts      # CoinGecko data
├── collect-cryptocompare.ts  # CryptoCompare data
├── calculate-daily-stats.ts  # Daily stats
├── import-real-kisa-data.ts  # KISA blacklist
├── import-cryptoscamdb.ts    # CryptoScamDB
└── import-urlhaus.ts         # URLhaus

mcp-server/                   # MCP Server for AI integration
├── src/
│   └── index.ts
└── package.json
```

## Request Flow

### Domain Validation Flow

```
1. User Input
   │
   ▼
2. Domain Normalization (cleanDomain)
   │
   ▼
3. Blacklist Check ──────────────────────┐
   │                                     │
   │ (if blacklisted)                    │
   │                                     ▼
   │                            Return score: 0 (danger)
   │
   ▼
4. Exchange Verification ────────────────┐
   │                                     │
   │ (if verified exchange)              │
   │                                     ▼
   │                            Return score: 100 (safe)
   │
   ▼
5. Parallel Checks (Promise.allSettled)
   ├── WHOIS lookup
   ├── SSL certificate check
   ├── Google Safe Browsing
   ├── User reports check
   ├── AI phishing pattern analysis
   └── AI suspicious domain analysis
   │
   ▼
6. Score Calculation (weighted average)
   │
   ▼
7. Generate Recommendations
   │
   ▼
8. Return Response
```

## Caching Strategy

| Data | Cache Location | TTL |
|------|----------------|-----|
| Daily Stats | Redis | 7 days |
| WHOIS Data | PostgreSQL | 30 days |
| SSL Data | PostgreSQL | - |
| Exchange Data | PostgreSQL | Updated via scripts |

## Database Models

### Core Models

- **Exchange**: Verified crypto exchanges (CoinGecko + CryptoCompare)
- **BlacklistedDomain**: Known malicious domains
- **WhitelistedDomain**: Verified safe domains
- **UserReport**: User-submitted reports
- **DailyStats**: Daily statistics snapshot
- **ApiUsage**: API usage tracking

### Sync Logs

- **ExchangeSyncLog**: Exchange data sync history
- **BlacklistSyncLog**: Blacklist sync history

## Performance Optimizations

1. **Early Return**: Blacklisted/verified domains return immediately
2. **Parallel Processing**: All checks run concurrently via Promise.allSettled
3. **Redis Caching**: Stats cached for 7 days
4. **Database Indexing**: domain, isActive, severity, category indexed
