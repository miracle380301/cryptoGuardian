import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { z } from 'zod';

const reportSchema = z.object({
  domain: z.string().min(1, 'Domain is required'),
  reportType: z.enum(['phishing', 'scam', 'malware', 'fake-exchange', 'other']),
  description: z.string().min(1, 'Description is required'),
  reporterEmail: z.string().email('Valid email is required'),
  evidence: z.array(z.string()).default([])
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = reportSchema.parse(body);

    // Email is now required
    const reporterEmail = validatedData.reporterEmail.trim();

    // Check if this email has already reported this domain
    const existingReport = await prisma.userReport.findFirst({
      where: {
        domain: validatedData.domain,
        reporterEmail: reporterEmail
      }
    });

    if (existingReport) {
      return NextResponse.json(
        {
          success: false,
          error: 'ALREADY_REPORTED',
          message: 'You have already reported this domain'
        },
        { status: 409 }
      );
    }

    // Create the report
    const report = await prisma.userReport.create({
      data: {
        domain: validatedData.domain,
        reportType: validatedData.reportType,
        description: validatedData.description.trim(),
        reporterEmail,
        evidence: validatedData.evidence.filter(e => e.trim().length > 0),
        status: 'pending'
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: report.id,
        message: 'Report submitted successfully'
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input data',
          details: error.issues
        },
        { status: 400 }
      );
    }

    console.error('Report submission error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to submit report'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};
    if (domain) where.domain = { contains: domain, mode: 'insensitive' };
    if (status) where.status = status;

    const reports = await prisma.userReport.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        domain: true,
        reportType: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });

    const total = await prisma.userReport.count({ where });

    return NextResponse.json({
      success: true,
      data: {
        reports,
        pagination: {
          total,
          limit,
          offset,
          hasMore: (offset + limit) < total
        }
      }
    });

  } catch (error) {
    console.error('Report fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch reports'
      },
      { status: 500 }
    );
  }
}