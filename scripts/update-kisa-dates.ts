import { PrismaClient } from '@prisma/client';
import { ReputationCheckAPI } from '../src/lib/apis/reputation-check';

const prisma = new PrismaClient();

interface KISARecord {
  DATE: string;
  URL: string;
  홈페이지주소?: string;
  날짜?: string;
  등록일?: string;
  탐지날짜?: string;
}

async function updateKISADates() {
  console.log('🔄 KISA 탐지날짜 업데이트 시작...');

  try {
    // KISA에서 신고된 모든 blacklistedDomain 가져오기
    const blacklistedDomains = await prisma.blacklistedDomain.findMany({
      where: {
        reportedBy: 'KISA'
      }
    });

    console.log(`📊 KISA 신고 도메인 ${blacklistedDomains.length}개 발견`);

    if (blacklistedDomains.length === 0) {
      console.log('❌ KISA 신고 도메인이 없습니다.');
      return;
    }

    // KISA API 설정
    const kisaApiKey = process.env.KISA_API_KEY;
    if (!kisaApiKey) {
      console.error('❌ KISA API 키가 설정되지 않았습니다.');
      return;
    }

    // KISA API에서 전체 데이터 가져오기
    console.log('🌐 KISA API에서 데이터 가져오는 중...');
    const apiUrl = new URL('https://api.odcloud.kr/api/15109780/v1/uddi:707478dd-938f-4155-badb-fae6202ee7ed');
    apiUrl.searchParams.append('serviceKey', kisaApiKey);
    apiUrl.searchParams.append('page', '1');
    apiUrl.searchParams.append('perPage', '10000'); // 충분히 큰 값
    apiUrl.searchParams.append('returnType', 'JSON');

    const response = await fetch(apiUrl.toString());
    if (!response.ok) {
      throw new Error(`KISA API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const kisaRecords: KISARecord[] = data.data || [];

    console.log(`📝 KISA API에서 ${kisaRecords.length}개 레코드 수신`);

    // 첫 번째 레코드 구조 확인
    if (kisaRecords.length > 0) {
      console.log('📋 KISA 레코드 필드:', Object.keys(kisaRecords[0]));
      console.log('📋 샘플 레코드:', JSON.stringify(kisaRecords[0], null, 2));
    }

    let updatedCount = 0;

    // 각 blacklisted domain에 대해 KISA 데이터에서 탐지날짜 찾기
    for (const domain of blacklistedDomains) {
      console.log(`🔍 ${domain.domain} 처리 중...`);

      // KISA 레코드에서 매칭되는 URL 찾기
      const matchedRecords = kisaRecords.filter(record => {
        const kisaUrl = (record.URL || record.홈페이지주소 || '').toLowerCase();
        const domainName = domain.domain.toLowerCase();

        return kisaUrl.includes(domainName) ||
               kisaUrl.includes(`//${domainName}`) ||
               kisaUrl.includes(`//${domainName}/`);
      });

      if (matchedRecords.length > 0) {
        const firstMatch = matchedRecords[0];
        console.log(`✅ ${domain.domain}에 대한 매칭 레코드 발견`);
        console.log('📅 날짜 필드들:', {
          DATE: firstMatch.DATE,
          날짜: firstMatch.날짜,
          등록일: firstMatch.등록일,
          탐지날짜: firstMatch.탐지날짜
        });

        // 실제 탐지날짜 찾기 (여러 필드 시도)
        const actualDetectionDate = firstMatch.DATE ||
                                   firstMatch.날짜 ||
                                   firstMatch.등록일 ||
                                   firstMatch.탐지날짜;

        if (actualDetectionDate) {
          // 날짜 형식 변환 (YYYYMMDD -> ISO Date)
          let parsedDate: Date;

          if (actualDetectionDate.length === 8) {
            // YYYYMMDD 형식
            const year = actualDetectionDate.substring(0, 4);
            const month = actualDetectionDate.substring(4, 6);
            const day = actualDetectionDate.substring(6, 8);
            parsedDate = new Date(`${year}-${month}-${day}`);
          } else {
            // 다른 형식 시도
            parsedDate = new Date(actualDetectionDate);
          }

          if (!isNaN(parsedDate.getTime())) {
            // DB 업데이트
            await prisma.blacklistedDomain.update({
              where: { id: domain.id },
              data: {
                reportDate: parsedDate,
                updatedAt: new Date()
              }
            });

            console.log(`✅ ${domain.domain} 탐지날짜 업데이트: ${parsedDate.toLocaleDateString('ko-KR')}`);
            updatedCount++;
          } else {
            console.log(`❌ ${domain.domain} 날짜 파싱 실패: ${actualDetectionDate}`);
          }
        } else {
          console.log(`❌ ${domain.domain} 탐지날짜 없음`);
        }
      } else {
        console.log(`❌ ${domain.domain}에 대한 KISA 레코드 없음`);
      }
    }

    console.log(`🎉 업데이트 완료: ${updatedCount}개 도메인의 탐지날짜 업데이트됨`);

  } catch (error) {
    console.error('❌ 업데이트 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
if (require.main === module) {
  updateKISADates()
    .then(() => {
      console.log('✅ 스크립트 실행 완료');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 스크립트 실행 실패:', error);
      process.exit(1);
    });
}

export { updateKISADates };