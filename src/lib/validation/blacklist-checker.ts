import { ApiResponse, BlacklistData } from '@/types/api.types';
import { checkBlacklist } from '@/lib/db/services';
import { calculateVirusTotalRisk } from '@/lib/score/score-calculator';
import { logger } from '@/lib/logger';

/**
 * VirusTotal API를 통한 실시간 도메인 검사
 */
async function checkVirusTotal(domain: string): Promise<void> {
  const virusTotalApiKey = process.env.VIRUSTOTAL_API_KEY || '';

  logger.debug('VirusTotal: Checking domain', { domain });

  if (!virusTotalApiKey) {
    logger.error('VirusTotal: API key not configured');
    throw new Error('VirusTotal API key is required');
  }

  const response = await fetch(`https://www.virustotal.com/api/v3/domains/${domain}`, {
    headers: {
      'x-apikey': virusTotalApiKey
    }
  });

  logger.debug('VirusTotal: API response received', { status: response.status });

  if (!response.ok) {
    logger.error('VirusTotal: API error', { status: response.status, statusText: response.statusText });
    throw new Error(`VirusTotal API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  const analysis = data.data?.attributes?.last_analysis_stats || {};
  const maliciousCount = analysis.malicious || 0;
  const suspiciousCount = analysis.suspicious || 0;
  const totalEngines = Object.values(analysis).reduce((sum: number, count: any) => sum + count, 0);

  const { isReported, riskLevel } = calculateVirusTotalRisk(maliciousCount, suspiciousCount);

  if (isReported && (riskLevel === 'malicious' || riskLevel === 'suspicious')) {
    try {
      const { default: prisma } = await import('@/lib/db/prisma');

      const existing = await prisma.blacklistedDomain.findFirst({
        where: { domain: domain.toLowerCase() }
      });

      if (!existing) {
        await prisma.blacklistedDomain.create({
          data: {
            domain: domain.toLowerCase(),
            reason: `VirusTotal detection: ${maliciousCount}/${totalEngines} security vendors flagged as ${riskLevel}`,
            reportedBy: 'VirusTotal',
            reportDate: data.data?.attributes?.last_modification_date ?
                       new Date(data.data.attributes.last_modification_date * 1000) : new Date(),
            primaryDataSource: 'virustotal',
            evidence: [`https://www.virustotal.com/gui/domain/${domain}`],
            riskLevel: riskLevel,
            severity: riskLevel === 'malicious' ? 'high' : 'medium'
          }
        });
      }
    } catch (dbError) {
      logger.error('VirusTotal: Failed to add domain to blacklist', dbError instanceof Error ? dbError : undefined, { domain });
    }
  }
}

/**
 * Check if a domain is blacklisted and return blacklist data
 */
export async function checkDomainBlacklist(
  domain: string
): Promise<ApiResponse<BlacklistData>> {

  try {
    // 1. 블랙리스트 DB 검사
    let blacklisted = await checkBlacklist(domain.toLowerCase());

    // 2. 없으면 VirusTotal API 호출해서 실시간 검사 후 DB 저장
    if (!blacklisted) {
      logger.debug('Calling VirusTotal API to check domain', { domain });
      try {
        await checkVirusTotal(domain);

        // API에서 악성 감지되면 DB에 저장되므로 다시 체크
        blacklisted = await checkBlacklist(domain.toLowerCase());
      } catch (error) {
        logger.error('VirusTotal check error', error instanceof Error ? error : undefined);
        // API 실패해도 계속 진행 (블랙리스트 없는 것으로 처리)
      }
    }

    // 3. 블랙리스트에 없으면 안전한 결과 반환
    if (!blacklisted) {
      return {
        success: true,
        data: {
          isBlacklisted: false,
          domain
        },
        timestamp: new Date().toISOString()
      };
    }

    logger.debug('Blacklist found in DB', { domain, reportedBy: blacklisted.reportedBy });

    // 4. 블랙리스트 데이터 반환
    return {
      success: true,
      data: {
        isBlacklisted: true,
        domain,
        reason: blacklisted.reason,
        reportedBy: blacklisted.reportedBy || 'Security Database',
        reportDate: (blacklisted as any).reportDate,
        severity: blacklisted.severity,
        riskLevel: (blacklisted as any).riskLevel || 'high',
        category: (blacklisted as any).category || 'malicious',
        targetBrand: (blacklisted as any).targetBrand,
        description: (blacklisted as any).description,
        evidence: blacklisted.evidence || [],
        dataSources: (blacklisted as any).dataSources || ['Internal Database'],
        sources: (blacklisted as any).sources || [],
        kisaId: (blacklisted as any).kisaId,
        verificationStatus: (blacklisted as any).verificationStatus || 'confirmed',
        isConfirmed: (blacklisted as any).isConfirmed !== false,
        primaryDataSource: (blacklisted as any).primaryDataSource
      },
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    logger.error('Blacklist check error', error instanceof Error ? error : undefined);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}