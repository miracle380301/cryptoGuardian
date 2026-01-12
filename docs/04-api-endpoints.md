# CryptoGuardian API Endpoints

## Base URL

```
Production: https://your-domain.vercel.app
Development: http://localhost:3000
```

---

## Public Endpoints

### 1. Validate Domain

Validates a domain for safety and legitimacy.

**Endpoint**: `POST /api/validate`

**Request Body**:
```json
{
  "domain": "binance.com",
  "type": "crypto",
  "language": "ko"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| domain | string | Yes | Domain or URL to validate |
| type | string | No | "crypto" or "general" (default: "general") |
| language | string | No | "ko" or "en" (default: "ko") |

**Response** (Success - Verified Exchange):
```json
{
  "domain": "binance.com",
  "finalScore": 100,
  "status": "safe",
  "checks": {
    "maliciousSite": {
      "name": "Blacklist Check",
      "passed": true,
      "score": 100,
      "weight": 0.25
    },
    "exchange": {
      "name": "Exchange Verification",
      "passed": true,
      "score": 100,
      "weight": 1.0,
      "data": {
        "isVerified": true,
        "name": "Binance",
        "url": "https://www.binance.com",
        "trustScore": 10,
        "tradeVolume24hBtc": 208500.5
      }
    }
  },
  "summary": "Verified cryptocurrency exchange",
  "recommendations": [],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Response** (Danger - Phishing):
```json
{
  "domain": "binnance.com",
  "finalScore": 25,
  "status": "danger",
  "checks": {
    "aiPhishing": {
      "name": "AI Phishing Pattern Analysis",
      "passed": false,
      "score": 50,
      "weight": 0.15,
      "data": {
        "isTyposquatting": true,
        "similarTo": "binance.com",
        "similarity": 92,
        "officialUrl": "https://www.binance.com"
      }
    }
  },
  "summary": "Suspected phishing site",
  "recommendations": [
    "This domain is similar to binance.com",
    "Do not enter personal information",
    "Official site: https://www.binance.com"
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

### 2. Get Statistics

Returns platform statistics.

**Endpoint**: `GET /api/stats`

**Response**:
```json
{
  "totalBlacklisted": 15420,
  "totalExchanges": 642,
  "recentDetections": 127,
  "detectionRate": "2.3%",
  "sourceBreakdown": {
    "kisa": 8500,
    "virustotal": 4200,
    "cryptoscamdb": 1800,
    "manual": 920
  },
  "categoryBreakdown": {
    "phishing": 6200,
    "scam": 4100,
    "malware": 3200,
    "impersonation": 1920
  },
  "lastUpdated": "2024-01-15T00:00:00Z"
}
```

---

### 3. Get Exchanges

Returns list of verified exchanges.

**Endpoint**: `GET /api/exchanges`

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | number | 20 | Number of results (max: 100) |
| offset | number | 0 | Pagination offset |
| sortBy | string | "trustScore" | Sort field |
| order | string | "desc" | Sort order |
| search | string | - | Search by name |

**Response**:
```json
{
  "total": 642,
  "exchanges": [
    {
      "id": "binance",
      "name": "Binance",
      "url": "https://www.binance.com",
      "trustScore": 10,
      "tradeVolume24hBtc": 208500.5,
      "cryptocompareGrade": "AA",
      "country": "Cayman Islands",
      "yearEstablished": 2017,
      "isVerified": true
    }
  ]
}
```

---

### 4. Submit Report

Submit a user report for a suspicious domain.

**Endpoint**: `POST /api/reports`

**Request Body**:
```json
{
  "domain": "suspicious-site.com",
  "reportType": "phishing",
  "description": "This site is impersonating Binance",
  "reporterEmail": "user@example.com",
  "evidence": "Screenshot URL or description"
}
```

**Response**:
```json
{
  "success": true,
  "reportId": "rpt_abc123",
  "message": "Report submitted successfully"
}
```

---

### 5. SSL Check

Check SSL certificate validity.

**Endpoint**: `POST /api/ssl-check`

**Request Body**:
```json
{
  "domain": "example.com"
}
```

**Response**:
```json
{
  "valid": true,
  "issuer": "Let's Encrypt",
  "expiresAt": "2024-06-15T00:00:00Z",
  "daysUntilExpiry": 152
}
```

---

## Admin Endpoints

### Authentication

Admin endpoints require authentication (implementation-specific).

---

### 1. Manage Blacklist

**Add to Blacklist**:
```
POST /api/admin/blacklist
```

**Request Body**:
```json
{
  "domain": "malicious-site.com",
  "category": "phishing",
  "severity": "high",
  "reason": "Impersonating Binance",
  "source": "manual"
}
```

**Sync Blacklist**:
```
POST /api/admin/blacklist/sync
```

---

### 2. Manage Whitelist

**Add to Whitelist**:
```
POST /api/admin/whitelist
```

**Request Body**:
```json
{
  "domain": "legitimate-exchange.com",
  "reason": "Verified exchange"
}
```

---

### 3. Sync Exchange Data

**CoinGecko Sync**:
```
POST /api/admin/collect-exchanges
```

**CryptoCompare Sync**:
```
POST /api/admin/collect-cryptocompare
```

**Manual Sync**:
```
POST /api/admin/exchanges/sync
```

---

### 4. Refresh Statistics

```
POST /api/stats/refresh
```

---

## MCP Server Tools

The MCP server exposes these tools for AI integration:

### 1. validate_crypto_site

```json
{
  "name": "validate_crypto_site",
  "description": "Validates crypto site safety",
  "parameters": {
    "domain": "string (required)",
    "language": "ko | en (optional)"
  }
}
```

### 2. list_verified_exchanges

```json
{
  "name": "list_verified_exchanges",
  "description": "Lists verified exchanges",
  "parameters": {
    "limit": "number (optional, default: 20)",
    "sortBy": "trustScore | volume | name (optional)"
  }
}
```

### 3. get_crypto_stats

```json
{
  "name": "get_crypto_stats",
  "description": "Gets platform statistics",
  "parameters": {}
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid domain format",
  "code": "INVALID_DOMAIN"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found",
  "code": "NOT_FOUND"
}
```

### 429 Too Many Requests
```json
{
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT",
  "retryAfter": 60
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "code": "INTERNAL_ERROR"
}
```

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| /api/validate | 60/minute |
| /api/stats | 120/minute |
| /api/exchanges | 120/minute |
| /api/reports | 10/minute |
| Admin endpoints | 30/minute |
