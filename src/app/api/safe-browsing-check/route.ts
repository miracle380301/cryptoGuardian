import { NextRequest, NextResponse } from 'next/server';
import { SafeBrowsingAPI } from '@/lib/apis/safe-browsing';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { domain } = body;

    if (!domain) {
      return NextResponse.json(
        { error: 'Domain is required' },
        { status: 400 }
      );
    }

    // Use the SafeBrowsingAPI class with our new scoring system
    const safeBrowsingAPI = new SafeBrowsingAPI();
    const result = await safeBrowsingAPI.checkUrl(domain);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { error: result.error || 'Safe browsing check failed' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Safe Browsing check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}