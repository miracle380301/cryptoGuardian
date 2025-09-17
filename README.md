# CryptoGuardian

A comprehensive security analysis tool for cryptocurrency websites and exchanges. CryptoGuardian helps users identify potentially malicious crypto sites through multi-layered security checks including domain analysis, SSL verification, reputation checking, and Google Safe Browsing integration.

## Features

- **Domain Registration Analysis**: Age verification and status checking
- **SSL Certificate Validation**: Real-time HTTPS connection testing
- **Reputation Scanning**: Multi-source threat intelligence
- **Google Safe Browsing**: Real-time phishing and malware detection
- **Typosquatting Detection**: Algorithm-based domain similarity analysis
- **Exchange Verification**: Known cryptocurrency exchange validation

## Setup

### 1. Environment Configuration

Copy the environment example file:

```bash
cp .env.example .env.local
```

### 2. API Keys Configuration

#### Google Safe Browsing API (Recommended)

For real-time phishing and malware detection:

1. **Create a Google Cloud Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one

2. **Enable Safe Browsing API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Safe Browsing API"
   - Click "Enable"

3. **Create API Key**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the generated API key

4. **Configure API Key**:
   - Open `.env.local`
   - Set: `GOOGLE_SAFE_BROWSING_API_KEY=your_api_key_here`

5. **API Quotas**:
   - Free tier: 10,000 requests per day
   - For higher limits, enable billing in Google Cloud

#### Optional API Keys

Add these to `.env.local` for enhanced functionality:

```bash
# CoinGecko API (Exchange verification)
COINGECKO_API_KEY=your_coingecko_api_key_here

# VirusTotal API (Additional reputation data)
VIRUSTOTAL_API_KEY=your_virustotal_api_key_here

# Real WHOIS lookups
ENABLE_REAL_WHOIS=true
```

### 3. Installation

Install dependencies:

```bash
npm install
```

### 4. Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 5. Production Build

```bash
npm run build
npm start
```

## How It Works

### Security Analysis Pipeline

1. **Domain Registration Check** (Weight: 20%)
   - Domain age analysis (30% weight)
   - Domain status verification (70% weight)
   - Registrar validation

2. **SSL Certificate Validation** (Weight: 20%)
   - Real-time HTTPS connection testing
   - Response time analysis
   - Certificate authority verification

3. **Reputation Analysis** (Weight: 30%)
   - Multi-source threat intelligence
   - Blacklist checking
   - Historical security data

4. **Google Safe Browsing** (Weight: 20%)
   - Real-time phishing detection
   - Malware identification
   - Typosquatting analysis
   - Suspicious pattern recognition

5. **Exchange Verification** (Weight: 10%)
   - Known exchange database
   - Trust score validation

### Scoring System

- **90-100**: ✅ **SAFE** - Verified and secure
- **50-89**: ⚠️ **CAUTION** - Proceed with care
- **0-49**: 🚨 **DANGER** - High risk, avoid

### Typosquatting Detection

Uses Levenshtein distance algorithm to detect domains similar to known exchanges:

- 1 character difference: -50 points
- 2 character difference: -30 points
- 3 character difference: -10 points

Examples of detected patterns:
- `binance.com` → `binnance.com` (typo)
- `coinbase.com` → `coinbasse.com` (typo)

## API Endpoints

### `/api/validate`
Main validation endpoint that performs comprehensive security analysis.

### `/api/ssl-check`
Real-time SSL certificate and HTTPS connectivity testing.

### `/api/safe-browsing-check`
Google Safe Browsing API integration with pattern analysis fallback.

## Technology Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **APIs**: Google Safe Browsing, CoinGecko, VirusTotal
- **Deployment**: Vercel

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Security Notice

This tool is designed for security research and user protection. It should not be used to:
- Circumvent security measures
- Test systems without authorization
- Gather intelligence for malicious purposes

## License

MIT License - see [LICENSE](LICENSE) for details.
