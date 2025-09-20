import { NextRequest, NextResponse } from 'next/server';
import { addToBlacklist, checkBlacklist } from '@/lib/db/services';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { domain, reason, severity, evidence, reportedBy } = body;

    if (!domain || !reason || !severity) {
      return NextResponse.json(
        { error: 'Domain, reason, and severity are required' },
        { status: 400 }
      );
    }

    // Check if already blacklisted
    const existing = await checkBlacklist(domain);
    if (existing) {
      return NextResponse.json(
        { error: 'Domain is already blacklisted' },
        { status: 409 }
      );
    }

    const result = await addToBlacklist(
      domain,
      reason,
      severity,
      evidence || [],
      reportedBy
    );

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to add domain to blacklist' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Blacklist API error:', error);
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

    const result = await checkBlacklist(domain);

    return NextResponse.json({
      success: true,
      isBlacklisted: !!result,
      data: result
    });
  } catch (error) {
    console.error('Blacklist check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}