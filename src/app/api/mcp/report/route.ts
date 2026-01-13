import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { z } from 'zod';
import { cleanDomain } from '@/lib/utils/domain';

const SITE_URL = 'https://cryptoguardian.co.kr';

// MCP용 신고 스키마 (이메일 선택사항)
const mcpReportSchema = z.object({
  domain: z.string().min(1, 'Domain is required'),
  reportType: z.enum(['phishing', 'scam', 'malware', 'fake-exchange', 'wallet-scam', 'airdrop-scam', 'other']),
  description: z.string().min(1, 'Description is required'),
  reporterEmail: z.string().email().optional(),
  evidence: z.array(z.string()).default([]),
  source: z.string().default('mcp') // MCP를 통한 신고임을 표시
});

// 신고 타입 한글 매핑
const reportTypeKorean: Record<string, string> = {
  'phishing': '피싱',
  'scam': '사기',
  'malware': '악성코드',
  'fake-exchange': '가짜 거래소',
  'wallet-scam': '지갑 사기',
  'airdrop-scam': '에어드랍 사기',
  'other': '기타'
};

/**
 * MCP용 사기 사이트 신고 API
 * POST /api/mcp/report
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const validatedData = mcpReportSchema.parse(body);

    // 도메인 정제
    const cleanedDomain = cleanDomain(validatedData.domain);

    // MCP 신고는 고유 식별자 생성 (이메일이 없는 경우)
    const reporterIdentifier = validatedData.reporterEmail || `mcp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // 이미 블랙리스트에 있는지 확인
    const existingBlacklist = await prisma.blacklistedDomain.findUnique({
      where: { domain: cleanedDomain }
    });

    if (existingBlacklist) {
      return NextResponse.json({
        success: true,
        data: {
          status: 'already_known',
          message: '이미 알려진 위험 사이트입니다.',
          messageKr: `${cleanedDomain}은(는) 이미 위험 사이트로 등록되어 있습니다.`,
          domain: cleanedDomain,
          severity: existingBlacklist.severity,
          category: existingBlacklist.category
        },
        reference: {
          message: '자세한 정보는 CryptoGuardian에서 확인하세요.',
          url: SITE_URL,
          validateUrl: `${SITE_URL}/validate`
        },
        meta: { responseTime: Date.now() - startTime }
      });
    }

    // 중복 신고 확인 (같은 도메인에 대해 최근 24시간 내 MCP 신고가 있는지)
    const recentReport = await prisma.userReport.findFirst({
      where: {
        domain: cleanedDomain,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }
    });

    if (recentReport) {
      return NextResponse.json({
        success: true,
        data: {
          status: 'already_reported',
          message: '최근 24시간 내에 이미 신고된 사이트입니다.',
          messageKr: `${cleanedDomain}은(는) 이미 신고 접수되어 검토 중입니다.`,
          domain: cleanedDomain,
          reportId: recentReport.id
        },
        reference: {
          message: '신고 현황은 CryptoGuardian에서 확인하세요.',
          url: SITE_URL
        },
        meta: { responseTime: Date.now() - startTime }
      });
    }

    // 신고 생성
    const report = await prisma.userReport.create({
      data: {
        domain: cleanedDomain,
        reportType: validatedData.reportType,
        description: `[MCP 신고] ${validatedData.description.trim()}`,
        reporterEmail: validatedData.reporterEmail || null,
        evidence: validatedData.evidence.filter(e => e.trim().length > 0),
        status: 'pending'
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        status: 'reported',
        message: '신고가 접수되었습니다. 검토 후 블랙리스트에 등록됩니다.',
        messageKr: `${cleanedDomain}에 대한 신고가 접수되었습니다.`,
        domain: cleanedDomain,
        reportId: report.id,
        reportType: validatedData.reportType,
        reportTypeKr: reportTypeKorean[validatedData.reportType] || validatedData.reportType,
        nextSteps: [
          '신고가 검토 대기열에 추가되었습니다',
          '검토 후 위험 사이트로 확인되면 블랙리스트에 등록됩니다',
          '다른 사용자들이 이 사이트에 대해 경고를 받게 됩니다'
        ]
      },
      reference: {
        message: '자세한 정보는 CryptoGuardian에서 확인하세요.',
        url: SITE_URL,
        reportUrl: `${SITE_URL}/report`
      },
      meta: { responseTime: Date.now() - startTime }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input data',
          errorKr: '입력 데이터가 올바르지 않습니다.',
          details: error.issues,
          requiredFields: {
            domain: '신고할 도메인 (필수)',
            reportType: '신고 유형: phishing, scam, malware, fake-exchange, wallet-scam, airdrop-scam, other (필수)',
            description: '신고 사유 설명 (필수)',
            reporterEmail: '신고자 이메일 (선택)',
            evidence: '증거 URL 목록 (선택)'
          }
        },
        { status: 400 }
      );
    }

    console.error('[MCP Report] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to submit report',
        errorKr: '신고 접수에 실패했습니다.'
      },
      { status: 500 }
    );
  }
}

/**
 * 신고 상태 조회 API
 * GET /api/mcp/report?domain=example.com
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');

    if (!domain) {
      return NextResponse.json(
        {
          success: false,
          error: 'Domain query parameter is required',
          errorKr: 'domain 파라미터가 필요합니다.'
        },
        { status: 400 }
      );
    }

    const cleanedDomain = cleanDomain(domain);

    // 해당 도메인에 대한 신고 조회
    const reports = await prisma.userReport.findMany({
      where: {
        domain: { contains: cleanedDomain, mode: 'insensitive' }
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        domain: true,
        reportType: true,
        status: true,
        createdAt: true
      }
    });

    // 블랙리스트 상태 확인
    const blacklistStatus = await prisma.blacklistedDomain.findUnique({
      where: { domain: cleanedDomain },
      select: {
        domain: true,
        severity: true,
        category: true,
        reason: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        domain: cleanedDomain,
        isBlacklisted: !!blacklistStatus,
        blacklistInfo: blacklistStatus ? {
          severity: blacklistStatus.severity,
          category: blacklistStatus.category,
          reason: blacklistStatus.reason,
          addedAt: blacklistStatus.createdAt.toISOString()
        } : null,
        reportCount: reports.length,
        reports: reports.map(r => ({
          id: r.id,
          reportType: r.reportType,
          reportTypeKr: reportTypeKorean[r.reportType] || r.reportType,
          status: r.status,
          statusKr: getStatusKorean(r.status),
          reportedAt: r.createdAt.toISOString()
        }))
      },
      reference: {
        message: '자세한 정보는 CryptoGuardian에서 확인하세요.',
        url: SITE_URL,
        validateUrl: `${SITE_URL}/validate`
      },
      meta: { responseTime: Date.now() - startTime }
    });

  } catch (error) {
    console.error('[MCP Report GET] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch report status',
        errorKr: '신고 상태 조회에 실패했습니다.'
      },
      { status: 500 }
    );
  }
}

function getStatusKorean(status: string): string {
  const map: Record<string, string> = {
    'pending': '검토 대기',
    'reviewing': '검토 중',
    'confirmed': '확인됨',
    'rejected': '반려됨'
  };
  return map[status] || status;
}
