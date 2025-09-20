'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ApiTestPage() {
  const [domain, setDomain] = useState('binance.com');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testApi = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ domain, language: 'en' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const testDomains = [
    { domain: 'binance.com', label: 'Binance (Safe)' },
    { domain: 'coinbase.com', label: 'Coinbase (Safe)' },
    { domain: 'fake-binance.com', label: 'Fake Binance (Scam)' },
    { domain: 'phishing-site.com', label: 'Phishing Site (Scam)' },
    { domain: 'crypto.com', label: 'Crypto.com (Safe)' },
  ];

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>API Integration Test</CardTitle>
          <CardDescription>Test the validation API with different domains</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Test Domain</label>
            <div className="flex space-x-2">
              <Input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="Enter domain (e.g., binance.com)"
                className="flex-1"
              />
              <Button onClick={testApi} disabled={loading}>
                {loading ? 'Testing...' : 'Test API'}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Quick Tests:</label>
            <div className="flex flex-wrap gap-2">
              {testDomains.map((test) => (
                <Button
                  key={test.domain}
                  variant="outline"
                  size="sm"
                  onClick={() => setDomain(test.domain)}
                >
                  {test.label}
                </Button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 font-medium">Error:</p>
              <p className="text-red-500">{error}</p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Summary</h3>
                <p className="text-sm">Domain: {result.domain}</p>
                <p className="text-sm">Score: {result.finalScore}/100</p>
                <p className="text-sm">
                  Status:
                  <span className={`ml-2 font-semibold ${
                    result.status === 'safe' ? 'text-green-600' :
                    result.status === 'warning' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {result.status.toUpperCase()}
                  </span>
                </p>
                <p className="text-sm mt-2">{result.summary}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Checks</h3>
                {Object.entries(result.checks).map(([key, check]: [string, any]) => (
                  <div key={key} className="mb-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{check.name}:</span>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm ${check.passed ? 'text-green-600' : 'text-red-600'}`}>
                          {check.passed ? '✅' : '❌'}
                        </span>
                        <span className="text-sm">{check.score}/100</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600">{check.message}</p>
                  </div>
                ))}
              </div>

              {result.recommendations && result.recommendations.length > 0 && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Recommendations</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {result.recommendations.map((rec: string, idx: number) => (
                      <li key={idx} className="text-sm">{rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              <details className="cursor-pointer">
                <summary className="font-semibold text-sm">Raw JSON Response</summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}