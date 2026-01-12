# CryptoGuardian Validation Logic

## Overview

The validation system uses 8 different checks with weighted scoring to determine if a domain is safe, suspicious, or dangerous.

## Score Calculation

### Final Score Formula

```
finalScore = Sum(check.score * check.weight) / Sum(weights)
```

### Status Thresholds

| Score Range | Status | Color |
|-------------|--------|-------|
| 80-100 | safe | Green |
| 50-79 | warning | Yellow |
| 0-49 | danger | Red |

## Validation Checks

### 1. Blacklist Check (Weight: 25%)

**File**: `src/lib/validation/blacklist-checker.ts`

**Process**:
1. Check domain against PostgreSQL blacklist
2. If not found, call VirusTotal API
3. If malicious, auto-add to database

**Scoring**:
| Result | Score |
|--------|-------|
| Not blacklisted | 100 |
| Blacklisted | 0 |

**Data Sources**:
- KISA (Korean Internet & Security Agency)
- VirusTotal (60+ security vendors)
- PhishTank
- CryptoScamDB
- URLhaus

---

### 2. Exchange Verification (Weight: 100% - Override)

**File**: `src/lib/validation/crypto-exchange-checker.ts`

**Process**:
1. Search domain in Exchange database
2. Match against CoinGecko/CryptoCompare data

**Scoring**:
| Result | Score | Behavior |
|--------|-------|----------|
| Verified exchange | 100 | Overrides all other checks |
| Not verified | 0 | Excluded from calculation (weight=0) |

**Data**:
- 600+ exchanges from CoinGecko
- Trust scores, 24h volume, grades

---

### 3. WHOIS Check (Weight: 10%)

**File**: `src/lib/validation/whois.ts`

**Process**:
1. Query WHOIS data for domain
2. Analyze creation date and status
3. Cache result for 30 days

**Scoring**:

Domain Age (30% of WHOIS score):
| Age | Score |
|-----|-------|
| 2+ years | 100 |
| 1 year | 85 |
| 6 months | 70 |
| 3 months | 50 |
| 1 month | 30 |
| < 1 month | 10 |

Domain Status (70% of WHOIS score):
| Status | Impact |
|--------|--------|
| clientHold | -50 |
| serverHold | -50 |
| pendingDelete | -30 |
| redemptionPeriod | -20 |

---

### 4. SSL Certificate Check (Weight: 15%)

**File**: `src/lib/validation/ssl-check.ts`

**Process**:
1. Attempt HTTPS connection
2. Validate certificate

**Scoring**:
| Result | Score |
|--------|-------|
| Valid SSL | 70 |
| Invalid/No SSL | 0 |

**Future Improvements**:
- Certificate type (DV vs EV)
- Certificate age
- CA quality analysis

---

### 5. Google Safe Browsing (Weight: 10%)

**File**: `src/lib/validation/safe-browsing.ts`

**Process**:
1. Call Google Safe Browsing API
2. Check for 4 threat types

**Threat Types**:
- MALWARE
- SOCIAL_ENGINEERING
- UNWANTED_SOFTWARE
- POTENTIALLY_HARMFUL_APPLICATION

**Scoring**:
| Result | Score |
|--------|-------|
| Safe | 100 |
| Any threat detected | 0 |

---

### 6. User Reports Check (Weight: 15%)

**File**: `src/lib/validation/user-reports.ts`

**Process**:
1. Query UserReport table for domain
2. Count confirmed reports

**Scoring**:
```
score = 100 - (reportCount * 10)
minimum score = 50
```

| Reports | Score |
|---------|-------|
| 0 | 100 |
| 1 | 90 |
| 2 | 80 |
| 3 | 70 |
| 4 | 60 |
| 5+ | 50 |

---

### 7. AI Phishing Pattern Analysis (Weight: 15%)

**File**: `src/lib/validation/typosquatting-detector.ts`

**Process**:
1. Compare domain to legitimate sites list
2. Calculate Levenshtein distance
3. Detect visual similarity attacks (homoglyphs)

**Typosquatting Detection**:

```
Legitimate: binance.com
Phishing:   binnance.com (1 char difference)
            binanse.com  (1 char difference)
            b1nance.com  (homoglyph: i -> 1)
```

**Scoring Penalties**:
| Pattern | Penalty |
|---------|---------|
| 1 character difference | -50 |
| 2 characters difference | -30 |
| 3 characters difference | -10 |
| Visual similarity (homoglyph) | -60 |

**Homoglyph Mappings**:
```typescript
{
  'I': ['l', '1', '|'],
  'l': ['I', '1', '|'],
  '0': ['O', 'Q'],
  'O': ['0', 'Q'],
  'rn': ['m'],
  'vv': ['w'],
  'cl': ['d']
}
```

**Legitimate Sites Checked**:
- Crypto: binance, coinbase, kraken, upbit, bithumb, etc.
- General: paypal, amazon, apple, google, metamask, etc.

---

### 8. AI Suspicious Domain Analysis (Weight: 10%)

**File**: `src/lib/validation/suspicious-domain-detector.ts`

**Process**:
Analyze domain for 7 risk factors

**Risk Factors**:

| Factor | Threshold | Penalty |
|--------|-----------|---------|
| High digit ratio | > 30% digits | 20 |
| Many hyphens | >= 3 hyphens | 15 |
| Very long name | > 20 chars | 10 |
| Suspicious keywords | phishing, fake, scam, etc. | 25 |
| Random character pattern | entropy analysis | 20 |
| Suspicious TLD | .tk, .ml, .ga, .cf, .gq | 30 |
| Phishing pattern | digit+letter mix | 25 |

**Risk Level**:
| Total Penalty | Level |
|---------------|-------|
| < 25 | Low |
| 25-49 | Medium |
| >= 50 | High |

---

## Validation Flow Diagram

```
Input: domain = "binnance.com"
                    │
                    ▼
┌───────────────────────────────────────┐
│ 1. Blacklist Check                    │
│    Result: Not found                  │
│    Score: 100, Weight: 0.25           │
└───────────────────┬───────────────────┘
                    │
                    ▼
┌───────────────────────────────────────┐
│ 2. Exchange Check                     │
│    Result: Not a verified exchange    │
│    Score: 0, Weight: 0 (excluded)     │
└───────────────────┬───────────────────┘
                    │
                    ▼
┌───────────────────────────────────────┐
│ 3-8. Parallel Checks                  │
│                                       │
│ WHOIS:        Score: 30 (new domain)  │
│ SSL:          Score: 70 (valid)       │
│ Safe Browsing: Score: 100 (safe)      │
│ User Reports: Score: 100 (none)       │
│ AI Phishing:  Score: 50 (typosquat!)  │
│ Suspicious:   Score: 85 (normal)      │
└───────────────────┬───────────────────┘
                    │
                    ▼
┌───────────────────────────────────────┐
│ Score Calculation                     │
│                                       │
│ (100*0.25 + 30*0.10 + 70*0.15 +       │
│  100*0.10 + 100*0.15 + 50*0.15 +      │
│  85*0.10) / (0.25+0.10+0.15+0.10+     │
│             0.15+0.15+0.10)           │
│                                       │
│ = 77.5 / 1.0 = 77.5                   │
│                                       │
│ Status: WARNING (50-79)               │
└───────────────────────────────────────┘
```

## Known Limitations

### 1. Hardcoded Legitimate Sites
- Only ~20 sites in typosquatting check
- Should use Exchange DB (600+ domains)

### 2. Subdomain Phishing Not Detected
```
binance.com.evil-site.com   <- Not detected
secure-binance.com          <- Not detected
binance-login.com           <- Not detected
```

### 3. SSL Analysis Limited
- Only checks valid/invalid
- No DV vs EV distinction
- No certificate age analysis

### 4. Keyboard Typo Patterns
- Adjacent key typos not specially handled
- Example: binsnce.com (a -> s)

## Improvement Roadmap

1. **Dynamic Legitimate Sites**: Load from Exchange DB
2. **Subdomain/Hyphen Pattern Detection**: Detect brand names in malicious contexts
3. **SSL Deep Analysis**: Certificate type, age, CA quality
4. **External API Integration**: ScamAdviser, Chainabuse, PhishTank API
