# CryptoGuardian Data Sources

## Overview

CryptoGuardian aggregates data from multiple sources to provide accurate verification results.

## Whitelist Sources (Verified Exchanges)

### 1. CoinGecko API

**Script**: `scripts/collect-exchanges.ts`

**Data Provided**:
| Field | Description |
|-------|-------------|
| id | CoinGecko exchange ID |
| name | Exchange name |
| url | Official website URL |
| trust_score | Trust score (0-10) |
| trade_volume_24h_btc | 24h trading volume in BTC |
| country | Country of operation |
| year_established | Year founded |

**Update Frequency**: Manual via script or admin API

**API Endpoint**: `https://api.coingecko.com/api/v3/exchanges`

---

### 2. CryptoCompare API

**Script**: `scripts/collect-cryptocompare.ts`

**Data Provided**:
| Field | Description |
|-------|-------------|
| Id | CryptoCompare exchange ID |
| Name | Exchange name |
| Url | Official website URL |
| TotalVolume24H | 24h total volume (USD) |
| Grade | Exchange grade (AA, A, B, C, D, E) |
| GradePoints | Numerical grade score |
| NumberOfTrades | 24h trade count |

**Update Frequency**: Manual via script or admin API

**API Endpoint**: `https://min-api.cryptocompare.com/data/exchanges/general`

---

## Blacklist Sources

### 1. KISA (Korean Internet & Security Agency)

**Script**: `scripts/import-real-kisa-data.ts`

**Categories**:
- Investment fraud (투자사기)
- Phishing (피싱)
- Exchange impersonation (거래소 사칭)
- Illegal gambling (불법도박)

**Data Fields**:
| Field | Description |
|-------|-------------|
| domain | Malicious domain |
| category | Threat category |
| severity | Threat severity |
| kisaReference | KISA reference number |
| impersonatedBrand | Target brand (if impersonation) |

---

### 2. VirusTotal API

**File**: `src/lib/validation/blacklist-checker.ts`

**Real-time API Call**:
- Checks domain against 60+ security vendors
- Auto-adds to blacklist if malicious detected

**Data Fields**:
| Field | Description |
|-------|-------------|
| vtPositives | Number of vendors flagging as malicious |
| vtTotal | Total vendors checked |
| vtCategories | Categories by vendor |
| vtScanDate | Last scan date |

**API Endpoint**: `https://www.virustotal.com/api/v3/domains/{domain}`

---

### 3. PhishTank

**Data Type**: Phishing URLs database

**Categories**: Phishing sites targeting various services

---

### 4. CryptoScamDB

**Script**: `scripts/import-cryptoscamdb.ts`

**Data Type**: Crypto-specific scam database

**Categories**:
- Fake exchanges
- Fake ICOs
- Wallet scams
- Giveaway scams

---

### 5. URLhaus

**Script**: `scripts/import-urlhaus.ts`

**Data Type**: Malware distribution URLs

**Categories**:
- Malware hosting
- Phishing
- Cryptojacking

---

### 6. Google Safe Browsing API

**File**: `src/lib/validation/safe-browsing.ts`

**Real-time API Call**:
- Checks against Google's threat database

**Threat Types**:
| Type | Description |
|------|-------------|
| MALWARE | Malware distribution |
| SOCIAL_ENGINEERING | Phishing/deceptive sites |
| UNWANTED_SOFTWARE | PUP distribution |
| POTENTIALLY_HARMFUL_APPLICATION | Harmful apps |

**API Endpoint**: `https://safebrowsing.googleapis.com/v4/threatMatches:find`

---

## Database Schema

### Exchange Model

```prisma
model Exchange {
  id                    String    @id
  name                  String
  url                   String?
  image                 String?
  country               String?
  yearEstablished       Int?
  trustScore            Int?
  tradeVolume24hBtc     Float?

  // CryptoCompare data
  cryptocompareId       String?
  cryptocompareName     String?
  totalVolume24h        Float?
  cryptocompareGrade    String?
  cryptocompareGradePoints Float?

  // Metadata
  isActive              Boolean   @default(true)
  isVerified            Boolean   @default(false)
  primaryDataSource     String    @default("coingecko")
  dataSources           String[]  @default([])

  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
}
```

### BlacklistedDomain Model

```prisma
model BlacklistedDomain {
  id                String    @id @default(cuid())
  domain            String    @unique

  // Classification
  category          String?   // phishing, malware, scam, etc.
  severity          String?   // low, medium, high, critical
  riskLevel         String?   // low, medium, high

  // Source tracking
  source            String?   // kisa, virustotal, manual, etc.
  primaryDataSource String    @default("manual")

  // VirusTotal data
  vtPositives       Int?
  vtTotal           Int?
  vtCategories      Json?
  vtScanDate        DateTime?

  // KISA data
  kisaReference     String?
  impersonatedBrand String?

  // Metadata
  isActive          Boolean   @default(true)
  reason            String?
  evidence          String?

  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  @@index([domain])
  @@index([isActive])
  @@index([severity])
  @@index([category])
}
```

---

## Data Collection Schedule

| Source | Method | Frequency |
|--------|--------|-----------|
| CoinGecko | Script / Admin API | Weekly |
| CryptoCompare | Script / Admin API | Weekly |
| KISA | Script import | As available |
| VirusTotal | Real-time API | Per request |
| Safe Browsing | Real-time API | Per request |
| CryptoScamDB | Script import | Monthly |
| URLhaus | Script import | Monthly |

---

## Admin API Endpoints

### Sync Exchange Data

```bash
# CoinGecko sync
POST /api/admin/collect-exchanges

# CryptoCompare sync
POST /api/admin/collect-cryptocompare

# Manual exchange sync
POST /api/admin/exchanges/sync
```

### Sync Blacklist Data

```bash
# Blacklist sync
POST /api/admin/blacklist/sync

# Manual blacklist add
POST /api/admin/blacklist
```

---

## Data Quality

### Exchange Data Merging

When same exchange exists in multiple sources:

```
Priority: CoinGecko > CryptoCompare

Merge Strategy:
- Use CoinGecko as primary
- Supplement with CryptoCompare data
- Track all sources in dataSources[]
```

### Blacklist Deduplication

```
- Domain is unique key
- If exists, update metadata
- Track first seen date
- Track all sources
```

---

## Environment Variables

```env
# CoinGecko (free tier, no key needed)
# Rate limit: 10-30 calls/minute

# CryptoCompare
CRYPTOCOMPARE_API_KEY=your_key

# VirusTotal
VIRUSTOTAL_API_KEY=your_key

# Google Safe Browsing
GOOGLE_SAFE_BROWSING_API_KEY=your_key
```
