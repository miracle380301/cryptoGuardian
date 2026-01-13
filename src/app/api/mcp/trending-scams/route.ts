import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const SITE_URL = 'https://cryptoguardian.co.kr';

// 30일 기준 트렌딩 사기 유형 분석
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

    // 최근 30일 카테고리별 통계
    const recentByCategory = await prisma.blacklistedDomain.groupBy({
      by: ['category'],
      where: {
        createdAt: { gte: thirtyDaysAgo },
        isActive: true,
        category: { not: null }
      },
      _count: { domain: true },
      orderBy: { _count: { domain: 'desc' } }
    });

    // 이전 30일 카테고리별 통계 (비교용)
    const previousByCategory = await prisma.blacklistedDomain.groupBy({
      by: ['category'],
      where: {
        createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        isActive: true,
        category: { not: null }
      },
      _count: { domain: true }
    });

    // 변화율 계산
    const previousMap = new Map(
      previousByCategory.map(p => [p.category, p._count.domain])
    );

    const categoryTrends = recentByCategory.map(r => {
      const previousCount = previousMap.get(r.category) || 0;
      const change = previousCount > 0
        ? Math.round(((r._count.domain - previousCount) / previousCount) * 100)
        : r._count.domain > 0 ? 100 : 0;

      return {
        category: r.category || 'unknown',
        categoryKr: getCategoryKorean(r.category),
        count: r._count.domain,
        previousCount,
        change: change >= 0 ? `+${change}%` : `${change}%`,
        trend: change > 20 ? 'rising' : change < -20 ? 'falling' : 'stable'
      };
    });

    // 최근 30일 타겟 브랜드별 통계
    const targetBrands = await prisma.blacklistedDomain.groupBy({
      by: ['targetBrand'],
      where: {
        createdAt: { gte: thirtyDaysAgo },
        isActive: true,
        targetBrand: { not: null }
      },
      _count: { domain: true },
      orderBy: { _count: { domain: 'desc' } },
      take: 10
    });

    // 최근 30일 severity별 통계
    const severityStats = await prisma.blacklistedDomain.groupBy({
      by: ['severity'],
      where: {
        createdAt: { gte: thirtyDaysAgo },
        isActive: true
      },
      _count: { domain: true },
      orderBy: { _count: { domain: 'desc' } }
    });

    // 최근 급증한 패턴 분석 (도메인 패턴)
    const recentDomains = await prisma.blacklistedDomain.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        isActive: true
      },
      select: {
        domain: true,
        targetBrand: true,
        category: true
      },
      take: 100,
      orderBy: { createdAt: 'desc' }
    });

    // 패턴 분석
    const patterns = analyzePatterns(recentDomains);

    // 총 통계
    const totalRecent = await prisma.blacklistedDomain.count({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        isActive: true
      }
    });

    const totalPrevious = await prisma.blacklistedDomain.count({
      where: {
        createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        isActive: true
      }
    });

    const overallChange = totalPrevious > 0
      ? Math.round(((totalRecent - totalPrevious) / totalPrevious) * 100)
      : 0;

    const responseTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: {
        period: '30days',
        periodLabel: '최근 30일',
        summary: {
          totalNewScams: totalRecent,
          previousPeriod: totalPrevious,
          overallChange: overallChange >= 0 ? `+${overallChange}%` : `${overallChange}%`,
          trend: overallChange > 20 ? 'increasing' : overallChange < -20 ? 'decreasing' : 'stable'
        },
        categoryTrends: categoryTrends.slice(0, 10),
        targetedBrands: targetBrands.map(t => ({
          brand: t.targetBrand,
          count: t._count.domain
        })),
        severityDistribution: severityStats.map(s => ({
          severity: s.severity,
          severityKr: getSeverityKorean(s.severity),
          count: s._count.domain
        })),
        emergingPatterns: patterns,
        warningMessage: generateWarningMessage(categoryTrends, targetBrands),
        generatedAt: new Date().toISOString()
      },
      reference: {
        message: '자세한 정보는 CryptoGuardian에서 확인하세요.',
        url: SITE_URL,
        validateUrl: `${SITE_URL}/validate`,
        reportUrl: `${SITE_URL}/report`
      },
      meta: {
        responseTime
      }
    });

  } catch (error) {
    console.error('[TrendingScams API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch trending scams' },
      { status: 500 }
    );
  }
}

function getCategoryKorean(category: string | null): string {
  const map: Record<string, string> = {
    'crypto': '암호화폐 사기',
    'phishing': '피싱',
    'malware': '악성코드',
    'scam': '일반 사기',
    'investment-fraud': '투자 사기',
    'fake-exchange': '가짜 거래소',
    'fake-wallet': '가짜 지갑',
    'airdrop-scam': '에어드랍 사기',
    'romance-scam': '로맨스 스캠',
    'impersonation': '사칭',
    'unknown': '기타'
  };
  return map[category || 'unknown'] || category || '기타';
}

function getSeverityKorean(severity: string): string {
  const map: Record<string, string> = {
    'critical': '매우 위험',
    'high': '위험',
    'medium': '주의',
    'low': '낮음'
  };
  return map[severity] || severity;
}

function analyzePatterns(domains: { domain: string; targetBrand: string | null; category: string | null }[]): {
  pattern: string;
  description: string;
  examples: string[];
  count: number;
}[] {
  const patterns: Record<string, { description: string; examples: string[]; count: number }> = {
    hyphenPhishing: {
      description: '하이픈을 사용한 브랜드 사칭 (예: brand-login.com)',
      examples: [],
      count: 0
    },
    subdomainPhishing: {
      description: '서브도메인을 이용한 피싱 (예: brand.fake-site.com)',
      examples: [],
      count: 0
    },
    typosquatting: {
      description: '오타를 이용한 사칭 (예: binnance.com)',
      examples: [],
      count: 0
    },
    keywordCombo: {
      description: '브랜드+키워드 조합 (예: brand-secure-login.com)',
      examples: [],
      count: 0
    }
  };

  const suspiciousKeywords = ['login', 'secure', 'verify', 'wallet', 'airdrop', 'claim', 'bonus', 'reward'];

  for (const { domain } of domains) {
    // 하이픈 피싱 패턴
    if (domain.includes('-') && domain.split('-').length >= 2) {
      patterns.hyphenPhishing.count++;
      if (patterns.hyphenPhishing.examples.length < 3) {
        patterns.hyphenPhishing.examples.push(domain);
      }
    }

    // 키워드 조합 패턴
    if (suspiciousKeywords.some(kw => domain.toLowerCase().includes(kw))) {
      patterns.keywordCombo.count++;
      if (patterns.keywordCombo.examples.length < 3) {
        patterns.keywordCombo.examples.push(domain);
      }
    }
  }

  return Object.entries(patterns)
    .filter(([_, data]) => data.count > 0)
    .map(([pattern, data]) => ({
      pattern,
      ...data
    }))
    .sort((a, b) => b.count - a.count);
}

function generateWarningMessage(
  categoryTrends: { category: string; categoryKr: string; count: number; change: string; trend: string }[],
  targetBrands: { targetBrand: string | null; _count: { domain: number } }[]
): string {
  const risingCategories = categoryTrends.filter(c => c.trend === 'rising');
  const topBrand = targetBrands[0]?.targetBrand;

  if (risingCategories.length > 0) {
    const topRising = risingCategories[0];
    return `${topRising.categoryKr} 유형이 ${topRising.change} 급증했습니다.${topBrand ? ` ${topBrand} 사칭에 주의하세요.` : ''}`;
  }

  if (topBrand) {
    return `${topBrand} 사칭 사이트가 가장 많이 발견되고 있습니다. 공식 사이트를 북마크해두세요.`;
  }

  return '항상 공식 URL을 확인하고, 의심스러운 링크는 클릭하지 마세요.';
}
