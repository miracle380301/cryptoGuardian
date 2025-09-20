import { NextRequest, NextResponse } from 'next/server';
import { addToWhitelist, checkWhitelist } from '@/lib/db/services';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { domain, name, category, trustScore, officialUrl, additionalUrls } = body;

    if (!domain || !name || !category) {
      return NextResponse.json(
        { error: 'Domain, name, and category are required' },
        { status: 400 }
      );
    }

    // Check if already whitelisted
    const existing = await checkWhitelist(domain);
    if (existing) {
      return NextResponse.json(
        { error: 'Domain is already whitelisted' },
        { status: 409 }
      );
    }

    const result = await addToWhitelist(
      domain,
      name,
      category,
      trustScore || 100,
      officialUrl,
      additionalUrls || []
    );

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to add domain to whitelist' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Whitelist API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');

    if (!domain) {
      return NextResponse.json(
        { error: 'Domain parameter is required' },
        { status: 400 }
      );
    }

    const result = await checkWhitelist(domain);

    return NextResponse.json({
      success: true,
      isWhitelisted: !!result,
      data: result
    });
  } catch (error) {
    console.error('Whitelist check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}