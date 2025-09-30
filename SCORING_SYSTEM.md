# Scoring System

## Architecture

```
API Route → Validation → Score Calculation → Processors → Result
```

## Score Weights

```typescript
maliciousSite: 0.25      // Blacklist check
exchange: 1.0            // Verified exchange (overrides all)
whois: 0.10              // Domain age & status
ssl: 0.15                // SSL certificate
safeBrowsing: 0.10       // Google Safe Browsing
userReports: 0.15        // User reports
aiPhishing: 0.15         // AI phishing detection
aiSuspiciousDomain: 0.10 // Suspicious patterns
```

## Validation Flow

1. **Blacklist Check**: Found → 0 points → Stop
2. **Exchange Check**: Verified → 100 points → Stop
3. **Parallel Checks**: WHOIS, SSL, Safe Browsing, User Reports, AI checks
4. **Weighted Average**: `Σ(score × weight) / Σ(weight)`
5. **Status**: ≥80 safe, 50-79 warning, <50 danger

## Individual Scores

### WHOIS (30% age + 70% status)
- >730 days: 100 pts
- 365-730: 85 pts
- <30 days: 10 pts
- Status ok/active: 100 pts
- Status hold/suspended: 0 pts

### SSL
- Valid: 70 pts
- Invalid/None: 0 pts

### Safe Browsing
- Clean: 100 pts
- Threats: 0 pts
- Unavailable: 75 pts

### User Reports
- 0 reports: 100 pts
- -10 pts per report (max -50)

## Caching
- WHOIS/SSL: 30 days (DB)
- Stats: 1 hour (Redis)
- Safe Browsing: No cache