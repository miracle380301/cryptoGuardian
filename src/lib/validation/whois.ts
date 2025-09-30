import { ApiResponse, WhoisData, ApiError } from '@/types/api.types';
import prisma from '@/lib/db/prisma';
import { logger } from '@/lib/logger';

/**
 * WHOIS 도메인 정보 조회 및 검증
 *
 * 검증 방식:
 * 1. whitelistedDomain 테이블에서 기존 데이터 확인 (30일 이내면 재사용)
 * 2. 데이터가 없거나 오래되었으면 whois-json 라이브러리로 새로 조회
 * 3. 도메인 생성일, 만료일, 갱신일 파싱 및 도메인 나이 계산
 * 4. 등록자(Registrar), 네임서버, 도메인 상태 정보 추출
 * 5. 결과를 whitelistedDomain 테이블에 저장 (재조회 최소화)
 *
 * 점수 계산은 validation-result-builder.ts의 processWhoisCheck에서 수행:
 * - 도메인 나이: 오래될수록 높은 점수 (2년 이상: 100점)
 * - 도메인 상태: clientHold, serverHold 등 문제 상태는 0점
 */
export async function whoisLookup(domain: string): Promise<ApiResponse<WhoisData>> {
  try {
    // 클라이언트 사이드에서는 실행 불가 (서버 사이드 전용)
    if (typeof window !== 'undefined') {
      throw new Error('Whois lookup can only be performed on the server side');
    }

    // 1. 먼저 DB에 저장된 데이터가 있는지 확인
    try {
      const existingEntry = await prisma.whitelistedDomain.findUnique({
        where: { domain }
      });

      // 데이터가 있고 최근 30일 이내 조회했다면 DB 데이터 반환
      if (existingEntry?.whoisData && existingEntry.lastWhoisCheck) {
        const daysSinceLastCheck = Math.floor(
          (Date.now() - existingEntry.lastWhoisCheck.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceLastCheck < 30) {
          logger.debug('Using stored WHOIS data', { domain, daysSinceLastCheck });
          return existingEntry.whoisData as unknown as ApiResponse<WhoisData>;
        }
      }
    } catch (dbError) {
      logger.warn('Failed to check stored WHOIS data', { domain, error: dbError instanceof Error ? dbError.message : String(dbError) });
      // DB 조회 실패는 무시하고 계속 진행
    }

    // 2. DB에 데이터가 없거나 오래되었으면 whois-json으로 새로 조회
    logger.debug('Fetching fresh WHOIS data', { domain });
    // @ts-ignore
    const whoisJson = await import('whois-json');
    const rawData = await whoisJson.default(domain);

    const whoisData: any = rawData;

    // WHOIS 응답 필드는 registrar마다 다르므로 여러 필드명 시도
    const creationDateStr = whoisData.creationDate || whoisData.created || whoisData.registrationDate;
    const expirationDateStr = whoisData.registrarRegistrationExpirationDate || whoisData.expirationDate || whoisData.expires;
    const updatedDateStr = whoisData.updatedDate || whoisData.lastUpdated || whoisData.modified;
    const registrarName = whoisData.registrar || whoisData.registrarName || 'Unknown';

    let creationDate: string | undefined;
    let domainAgeDays: number | undefined;

    // 도메인 생성일 파싱 및 나이 계산 (일 단위)
    if (creationDateStr) {
      try {
        const parsedDate = new Date(creationDateStr);
        if (!isNaN(parsedDate.getTime())) {
          creationDate = parsedDate.toISOString().split('T')[0];
          domainAgeDays = Math.floor((Date.now() - parsedDate.getTime()) / (1000 * 60 * 60 * 24));
        }
      } catch (e) {
        logger.warn('Failed to parse creation date', { domain, creationDateStr });
      }
    }

    // 도메인 만료일 파싱
    let expirationDate: string | undefined;
    if (expirationDateStr) {
      try {
        const parsedDate = new Date(expirationDateStr);
        if (!isNaN(parsedDate.getTime())) {
          expirationDate = parsedDate.toISOString().split('T')[0];
        }
      } catch (e) {
        logger.warn('Failed to parse expiration date', { domain, expirationDateStr });
      }
    }

    // 도메인 정보 최종 갱신일 파싱
    let updatedDate: string | undefined;
    if (updatedDateStr) {
      try {
        const parsedDate = new Date(updatedDateStr);
        if (!isNaN(parsedDate.getTime())) {
          updatedDate = parsedDate.toISOString().split('T')[0];
        }
      } catch (e) {
        logger.warn('Failed to parse updated date', { domain, updatedDateStr });
      }
    }

    // 네임서버 정보 추출 (문자열 또는 배열 형태 처리)
    const nameservers: string[] = [];
    if (whoisData.nameServer) {
      if (typeof whoisData.nameServer === 'string') {
        nameservers.push(...whoisData.nameServer.split(' '));
      } else if (Array.isArray(whoisData.nameServer)) {
        nameservers.push(...whoisData.nameServer);
      }
    }

    // WHOIS 데이터에서 관련 링크 추출 (registrar 웹사이트 등)
    const links: string[] = [];
    const urlPattern = /https?:\/\/[^\s]+/gi;
    const whoisText = JSON.stringify(whoisData);
    const foundLinks = whoisText.match(urlPattern) || [];

    if (foundLinks.length > 0) {
      links.push(...[...new Set(foundLinks)]); // 중복 제거
    }

    // registrar URL 추가 (필드명이 다양함)
    if (whoisData.registrarUrl) {
      links.push(whoisData.registrarUrl);
    }
    if (whoisData.registrarURL) {
      links.push(whoisData.registrarURL);
    }

    // 조회 결과를 ApiResponse<WhoisData> 형식으로 구조화
    const result = {
      success: true,
      data: {
        domain,
        registrar: registrarName,
        creation_date: creationDate,
        expiration_date: expirationDate,
        updated_date: updatedDate,
        domain_age_days: domainAgeDays, // validation-result-builder에서 점수 계산에 사용
        is_registered: true,
        registrant: {
          organization: whoisData.registrantOrganization || 'Redacted for privacy',
          country: whoisData.registrantCountry || 'Unknown',
          state: whoisData.registrantStateProvince || 'Unknown'
        },
        nameservers,
        status: whoisData.domainStatus ? [whoisData.domainStatus] : [], // validation-result-builder에서 점수 계산에 사용
        links: links.length > 0 ? links : undefined
      },
      timestamp: new Date().toISOString()
    };

    // 3. 새로 조회한 WHOIS 데이터를 whitelistedDomain 테이블에 저장
    try {
      await prisma.whitelistedDomain.upsert({
        where: { domain },
        update: {
          whoisData: result,
          lastWhoisCheck: new Date()
        } as any,
        create: {
          domain,
          name: domain,
          category: 'unknown',
          whoisData: result,
          lastWhoisCheck: new Date()
        } as any
      });
      logger.debug('Stored WHOIS data', { domain });
    } catch (dbError) {
      // DB 저장 실패는 무시 (조회 결과는 반환)
      logger.error('Failed to store WHOIS data', dbError instanceof Error ? dbError : undefined, { domain });
    }

    return result;
  } catch (error) {
    logger.error('Whois API error', error instanceof Error ? error : undefined, { domain });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}