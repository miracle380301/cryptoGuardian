import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const SITE_URL = 'https://cryptoguardian.co.kr';

// 피싱 예방 교육 콘텐츠
const EDUCATION_CONTENT: Record<string, {
  title: string;
  titleKr: string;
  description: string;
  tips: { tip: string; importance: 'high' | 'medium' | 'low' }[];
  commonMistakes: string[];
  checkList: string[];
}> = {
  general: {
    title: 'Cryptocurrency Security Guide',
    titleKr: '암호화폐 보안 가이드',
    description: '암호화폐 피싱 및 사기를 예방하기 위한 종합 가이드입니다.',
    tips: [
      { tip: '공식 URL을 북마크해두고 항상 북마크를 통해 접속하세요', importance: 'high' },
      { tip: '거래소나 지갑 서비스는 절대 DM이나 이메일로 시드 문구를 요청하지 않습니다', importance: 'high' },
      { tip: 'URL에 하이픈(-)이 많거나 철자가 이상하면 의심하세요', importance: 'high' },
      { tip: '에어드랍이나 무료 토큰 이벤트는 대부분 사기입니다', importance: 'high' },
      { tip: 'SSL 인증서(https)만으로 안전하다고 판단하지 마세요 - 사기 사이트도 SSL을 사용합니다', importance: 'medium' },
      { tip: '긴급함을 강조하는 메시지는 사기일 가능성이 높습니다', importance: 'medium' },
      { tip: '2단계 인증(2FA)을 반드시 설정하세요', importance: 'high' },
      { tip: '하드웨어 지갑 사용을 권장합니다', importance: 'medium' }
    ],
    commonMistakes: [
      'SNS 광고 링크를 통해 거래소 접속',
      '텔레그램/디스코드 DM의 링크 클릭',
      '이메일의 "긴급 보안 조치 필요" 링크 클릭',
      '검색 엔진 광고(Google Ads)를 통한 접속',
      '시드 문구를 웹사이트에 입력'
    ],
    checkList: [
      'URL이 공식 도메인과 정확히 일치하는가?',
      '북마크를 통해 접속했는가?',
      '시드 문구나 개인키 입력을 요구하는가?',
      '너무 좋은 조건의 이벤트인가?',
      '긴급함을 강조하고 있는가?'
    ]
  },
  'fake-exchange': {
    title: 'Fake Exchange Detection Guide',
    titleKr: '가짜 거래소 구별법',
    description: '가짜 암호화폐 거래소를 식별하는 방법을 안내합니다.',
    tips: [
      { tip: 'CoinGecko, CoinMarketCap에서 거래소 신뢰도를 확인하세요', importance: 'high' },
      { tip: '공식 거래소는 binance.com, coinbase.com 등 단순한 도메인을 사용합니다', importance: 'high' },
      { tip: 'binance-kr.com, coinbase-login.com 같은 변형 도메인은 모두 사기입니다', importance: 'high' },
      { tip: '설립 연도와 거래량을 확인하세요 - 신생 거래소는 위험합니다', importance: 'medium' },
      { tip: '고객 지원 연락처가 명확한지 확인하세요', importance: 'medium' }
    ],
    commonMistakes: [
      'binance-event.com 같은 이벤트성 도메인 신뢰',
      '텔레그램에서 추천받은 "신규 거래소" 가입',
      '높은 수익률을 약속하는 거래소 이용',
      '출금 시 추가 입금을 요구할 때 응함'
    ],
    checkList: [
      'CoinGecko에 등록된 거래소인가?',
      '도메인이 공식 도메인과 정확히 일치하는가?',
      '설립된 지 1년 이상 된 거래소인가?',
      '출금이 정상적으로 가능한가?'
    ]
  },
  'wallet-scam': {
    title: 'Wallet Scam Prevention Guide',
    titleKr: '지갑 사기 예방법',
    description: '암호화폐 지갑 관련 사기를 예방하는 방법입니다.',
    tips: [
      { tip: '시드 문구(복구 구문)는 절대 온라인에 입력하지 마세요', importance: 'high' },
      { tip: 'MetaMask, Trust Wallet 등은 절대 시드 문구를 요청하지 않습니다', importance: 'high' },
      { tip: '지갑 앱은 반드시 공식 앱스토어에서 다운로드하세요', importance: 'high' },
      { tip: '"지갑 동기화", "지갑 연결" 을 요구하는 사이트는 사기입니다', importance: 'high' },
      { tip: '하드웨어 지갑(Ledger, Trezor)을 사용하면 더 안전합니다', importance: 'medium' }
    ],
    commonMistakes: [
      'metamask-sync.com 같은 사이트에서 시드 문구 입력',
      '"지갑 검증" 팝업에서 시드 문구 입력',
      '에어드랍 수령을 위해 지갑 연결',
      '가짜 고객지원에게 시드 문구 전달'
    ],
    checkList: [
      '시드 문구 입력을 요구하는가? (요구하면 100% 사기)',
      '공식 앱스토어에서 다운로드한 앱인가?',
      '연결하려는 사이트가 신뢰할 수 있는가?',
      '하드웨어 지갑을 사용하고 있는가?'
    ]
  },
  'phishing': {
    title: 'Phishing Attack Prevention',
    titleKr: '피싱 공격 예방법',
    description: '피싱 공격의 특징과 예방법을 안내합니다.',
    tips: [
      { tip: '이메일 발신자 주소를 항상 확인하세요 (support@binance.com vs support@binance-help.com)', importance: 'high' },
      { tip: '긴급함을 강조하는 메시지는 대부분 피싱입니다', importance: 'high' },
      { tip: '링크 위에 마우스를 올려 실제 URL을 확인하세요', importance: 'high' },
      { tip: '공식 앱/사이트를 통해 직접 로그인하여 알림을 확인하세요', importance: 'medium' },
      { tip: '의심스러운 이메일의 첨부파일은 절대 열지 마세요', importance: 'high' }
    ],
    commonMistakes: [
      '"계정 정지 예정" 이메일의 링크 클릭',
      '"보안 업데이트 필요" 메시지에 속아 로그인',
      '가짜 고객지원 이메일에 개인정보 회신',
      'QR 코드 스캔을 통한 피싱 사이트 접속'
    ],
    checkList: [
      '발신자 이메일 주소가 공식 도메인인가?',
      '긴급함을 과도하게 강조하고 있는가?',
      '링크의 실제 URL이 공식 사이트인가?',
      '개인정보나 로그인 정보를 요구하는가?'
    ]
  },
  'airdrop-scam': {
    title: 'Airdrop Scam Prevention',
    titleKr: '에어드랍 사기 예방법',
    description: '가짜 에어드랍 사기를 식별하고 예방하는 방법입니다.',
    tips: [
      { tip: '무료 토큰을 받기 위해 시드 문구를 요구하면 100% 사기입니다', importance: 'high' },
      { tip: '에어드랍 수령을 위해 먼저 입금을 요구하면 사기입니다', importance: 'high' },
      { tip: '공식 에어드랍은 프로젝트 공식 채널에서만 안내됩니다', importance: 'high' },
      { tip: 'SNS 광고나 DM으로 오는 에어드랍은 대부분 사기입니다', importance: 'medium' },
      { tip: '너무 큰 금액의 에어드랍은 의심하세요', importance: 'medium' }
    ],
    commonMistakes: [
      '"$10,000 에어드랍 수령" 광고 클릭',
      '에어드랍 수령을 위해 소액 ETH 전송',
      '지갑에 갑자기 들어온 토큰 스왑 시도',
      '에어드랍 사이트에서 지갑 연결 후 모든 권한 승인'
    ],
    checkList: [
      '프로젝트 공식 채널에서 안내된 에어드랍인가?',
      '시드 문구나 개인키를 요구하는가?',
      '먼저 돈을 보내라고 하는가?',
      '비현실적으로 큰 금액인가?'
    ]
  }
};

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'general';
    const lang = searchParams.get('lang') || 'kr';

    // 교육 콘텐츠 가져오기
    const content = EDUCATION_CONTENT[category] || EDUCATION_CONTENT['general'];

    // 해당 카테고리의 실제 사례 가져오기 (최근 것)
    const realExamples = await prisma.blacklistedDomain.findMany({
      where: {
        isActive: true,
        category: category === 'general' ? undefined : category
      },
      select: {
        domain: true,
        reason: true,
        category: true,
        targetBrand: true,
        severity: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // 통계 정보
    const totalCases = await prisma.blacklistedDomain.count({
      where: {
        isActive: true,
        category: category === 'general' ? undefined : category
      }
    });

    const recentCases = await prisma.blacklistedDomain.count({
      where: {
        isActive: true,
        category: category === 'general' ? undefined : category,
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }
    });

    const responseTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: {
        category,
        title: lang === 'kr' ? content.titleKr : content.title,
        description: content.description,
        tips: content.tips,
        commonMistakes: content.commonMistakes,
        checkList: content.checkList,
        realWorldExamples: realExamples.map(e => ({
          domain: e.domain,
          reason: e.reason,
          targetBrand: e.targetBrand,
          severity: e.severity,
          detectedAt: e.createdAt.toISOString()
        })),
        statistics: {
          totalDetected: totalCases,
          last30Days: recentCases,
          message: `지금까지 ${totalCases.toLocaleString()}개의 ${getCategoryKorean(category)} 사이트가 탐지되었습니다.`
        },
        availableCategories: Object.keys(EDUCATION_CONTENT).map(key => ({
          key,
          label: EDUCATION_CONTENT[key].titleKr
        })),
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
    console.error('[Education API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch education content' },
      { status: 500 }
    );
  }
}

function getCategoryKorean(category: string): string {
  const map: Record<string, string> = {
    'general': '사기/피싱',
    'crypto': '암호화폐 사기',
    'phishing': '피싱',
    'malware': '악성코드',
    'scam': '일반 사기',
    'investment-fraud': '투자 사기',
    'fake-exchange': '가짜 거래소',
    'fake-wallet': '가짜 지갑',
    'wallet-scam': '지갑 사기',
    'airdrop-scam': '에어드랍 사기',
    'romance-scam': '로맨스 스캠',
    'impersonation': '사칭'
  };
  return map[category] || category;
}
