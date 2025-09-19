import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // File upload feature disabled - users should provide image URLs instead
  return NextResponse.json(
    {
      success: false,
      error: 'File upload feature has been disabled. Please provide image URLs instead.'
    },
    { status: 410 } // 410 Gone - feature no longer available
  );
}