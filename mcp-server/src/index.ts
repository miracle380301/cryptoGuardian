#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// API base URL - 환경변수 또는 기본값
const API_BASE_URL = process.env.CRYPTO_GUARDIAN_API_URL || "https://cryptoguardian.co.kr";
const SITE_URL = "https://cryptoguardian.co.kr";

const DISCLAIMER = "본 정보는 CoinGecko, CryptoCompare, KISA 등 외부 데이터를 기반으로 합니다. 투자 결정은 본인의 판단과 책임 하에 신중히 진행하시기 바랍니다.";
const REFERENCE_MESSAGE = `자세한 정보는 ${SITE_URL} 에서 확인하세요.`;

const FOOTER_WARNINGS = [
  "도메인 검증 결과가 \"안전\"이라도 100% 보장은 아닙니다",
  "항상 공식 URL을 북마크해두고 사용하세요",
  "시드 문구(복구 구문)는 절대 입력하지 마세요",
  "의심스러운 링크는 먼저 검증 후 접속하세요"
];
const FOOTER_MORE_INFO = `더 많은 정보는 ${SITE_URL} 을 참고하세요.`;

// API 호출 헬퍼
async function callAPI(endpoint: string, options?: RequestInit) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// 도메인 정규화
function cleanDomain(input: string): string {
  let domain = input.trim().toLowerCase();
  domain = domain.replace(/^(https?:\/\/)?(www\.)?/, "");
  domain = domain.replace(/\/.*$/, "");
  return domain;
}

// MCP 서버 생성
const server = new McpServer({
  name: "crypto-guardian",
  version: "1.0.0",
});

// 도구 1: 도메인/거래소 검증
server.tool(
  "validate_crypto_site",
  "암호화폐 거래소 또는 관련 사이트의 안전성을 검증합니다. 피싱 사이트 탐지, 검증된 거래소 확인, 블랙리스트 확인 등을 수행합니다.",
  {
    domain: z.string().describe("검증할 도메인 또는 URL (예: binance.com, https://upbit.com)"),
    language: z.enum(["ko", "en"]).optional().describe("응답 언어 (기본값: ko)"),
  },
  async ({ domain, language = "ko" }) => {
    try {
      const cleanedDomain = cleanDomain(domain);

      const result = await callAPI("/api/validate", {
        method: "POST",
        body: JSON.stringify({
          domain: cleanedDomain,
          type: "crypto",
          language,
        }),
      });

      // 응답 포맷팅
      const response: Record<string, unknown> = {
        inputDomain: domain,
        cleanedDomain: cleanedDomain,
        score: result.finalScore,
        status: result.status,
        statusLabel: getStatusLabel(result.status, language),
        isVerified: result.checks?.exchange?.data?.isVerified || false,
        reference: REFERENCE_MESSAGE,
        siteUrl: SITE_URL,
        disclaimer: DISCLAIMER,
      };

      // 검증된 거래소인 경우 상세 정보 추가
      if (result.checks?.exchange?.data?.isVerified) {
        const exchangeData = result.checks.exchange.data;
        response.exchange = {
          name: exchangeData.name,
          officialUrl: exchangeData.url,
          trustScore: exchangeData.trustScore,
          volume24h: formatVolume(exchangeData.tradeVolume24hBtc),
          grade: exchangeData.cryptocompareGrade,
        };
      }

      // 피싱 의심인 경우 경고 추가
      if (result.checks?.aiPhishing?.data?.isTyposquatting) {
        const phishingData = result.checks.aiPhishing.data;
        response.phishingAlert = {
          warning: language === "ko" ? "피싱 사이트 의심" : "Suspected phishing site",
          similarTo: phishingData.similarTo,
          officialUrl: phishingData.officialUrl,
          similarity: phishingData.similarity,
        };
      }

      // 블랙리스트에 있는 경우
      if (result.checks?.maliciousSite?.data?.isBlacklisted) {
        const blacklistData = result.checks.maliciousSite.data;
        response.blacklistAlert = {
          warning: language === "ko" ? "블랙리스트에 등록된 위험 사이트" : "Blacklisted dangerous site",
          source: blacklistData.source,
          category: blacklistData.category,
          reason: blacklistData.reason,
        };
      }

      // 검증 항목 요약
      response.checks = {
        blacklist: formatCheck(result.checks?.maliciousSite),
        exchange: formatCheck(result.checks?.exchange),
        whois: formatCheck(result.checks?.whois),
        ssl: formatCheck(result.checks?.ssl),
        safeBrowsing: formatCheck(result.checks?.safeBrowsing),
        userReports: formatCheck(result.checks?.userReports),
        aiPhishing: formatCheck(result.checks?.aiPhishing),
        suspiciousDomain: formatCheck(result.checks?.aiSuspiciousDomain),
      };

      // 추천사항
      if (result.recommendations?.length > 0) {
        response.recommendations = result.recommendations;
      }

      // Footer 정보 추가
      response.warnings = FOOTER_WARNINGS;
      response.moreInfo = FOOTER_MORE_INFO;

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(response, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              error: true,
              message: error instanceof Error ? error.message : "Unknown error",
              warnings: FOOTER_WARNINGS,
              moreInfo: FOOTER_MORE_INFO,
            }, null, 2),
          },
        ],
        isError: true,
      };
    }
  }
);

// 도구 2: 거래소 목록 조회
server.tool(
  "list_verified_exchanges",
  "검증된 암호화폐 거래소 목록을 조회합니다. 신뢰도, 거래량 등의 정보를 포함합니다.",
  {
    limit: z.number().optional().describe("조회할 거래소 수 (기본값: 20, 최대: 100)"),
    sortBy: z.enum(["trustScore", "volume", "name"]).optional().describe("정렬 기준"),
  },
  async ({ limit = 20, sortBy = "trustScore" }) => {
    try {
      const result = await callAPI(`/api/exchanges?limit=${limit}&sortBy=${sortBy}`);

      // API 응답 구조: { success, data: { exchanges, total, ... } }
      const exchangeData = result.data || result;
      const exchanges = exchangeData.exchanges?.map((ex: Record<string, unknown>) => ({
        name: ex.name,
        officialUrl: ex.url,
        trustScore: ex.trustScore,
        volume24h: formatVolume(ex.tradeVolume24hBtc as number),
        grade: ex.cryptocompareGrade,
        isVerified: ex.isVerified,
      })) || [];

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              totalExchanges: exchangeData.total || exchanges.length,
              exchanges,
              warnings: FOOTER_WARNINGS,
              moreInfo: FOOTER_MORE_INFO,
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              error: true,
              message: error instanceof Error ? error.message : "Unknown error",
              warnings: FOOTER_WARNINGS,
              moreInfo: FOOTER_MORE_INFO,
            }, null, 2),
          },
        ],
        isError: true,
      };
    }
  }
);

// 도구 3: 통계 조회
server.tool(
  "get_crypto_stats",
  "암호화폐 사기 탐지 통계를 조회합니다. 블랙리스트 도메인 수, 검증된 거래소 수, 최근 탐지 현황 등을 제공합니다.",
  {},
  async () => {
    try {
      const result = await callAPI("/api/stats");

      // API 응답 구조: { success, stats: { totalBlacklisted, ... } }
      const stats = result.stats || result;

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              totalBlacklistedDomains: stats.totalBlacklisted,
              totalVerifiedExchanges: stats.totalExchanges,
              recentDetections7d: stats.recentDetections,
              detectionRate: stats.detectionRate,
              lastUpdated: stats.lastUpdated,
              warnings: FOOTER_WARNINGS,
              moreInfo: FOOTER_MORE_INFO,
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              error: true,
              message: error instanceof Error ? error.message : "Unknown error",
              warnings: FOOTER_WARNINGS,
              moreInfo: FOOTER_MORE_INFO,
            }, null, 2),
          },
        ],
        isError: true,
      };
    }
  }
);

// 도구 4: 트렌딩 사기 조회
server.tool(
  "get_trending_scams",
  "최근 30일간 급증한 사기 유형, 타겟 브랜드, 위험 패턴을 분석합니다. 현재 유행하는 사기 트렌드를 파악할 수 있습니다.",
  {},
  async () => {
    try {
      const result = await callAPI("/api/mcp/trending-scams");

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch trending scams");
      }

      const data = result.data;
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              period: data.periodLabel,
              summary: {
                totalNewScams: data.summary.totalNewScams,
                change: data.summary.overallChange,
                trend: data.summary.trend,
              },
              categoryTrends: data.categoryTrends?.slice(0, 5).map((t: any) => ({
                category: t.categoryKr,
                count: t.count,
                change: t.change,
                trend: t.trend,
              })),
              targetedBrands: data.targetedBrands?.slice(0, 5),
              emergingPatterns: data.emergingPatterns?.slice(0, 3),
              warningMessage: data.warningMessage,
              reference: REFERENCE_MESSAGE,
              siteUrl: SITE_URL,
              disclaimer: DISCLAIMER,
              warnings: FOOTER_WARNINGS,
              moreInfo: FOOTER_MORE_INFO,
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              error: true,
              message: error instanceof Error ? error.message : "Unknown error",
              warnings: FOOTER_WARNINGS,
              moreInfo: FOOTER_MORE_INFO,
            }, null, 2),
          },
        ],
        isError: true,
      };
    }
  }
);

// 도구 5: 피싱 예방 교육
server.tool(
  "educate_user",
  "카테고리별 피싱 예방 팁, 흔한 실수, 체크리스트, 실제 탐지 사례를 제공합니다. 암호화폐 사기 예방 교육 콘텐츠입니다.",
  {
    category: z.enum(["general", "fake-exchange", "wallet-scam", "phishing", "airdrop-scam"])
      .optional()
      .describe("교육 카테고리 (기본값: general)"),
  },
  async ({ category = "general" }) => {
    try {
      const result = await callAPI(`/api/mcp/education?category=${category}`);

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch education content");
      }

      const data = result.data;
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              category: data.category,
              title: data.title,
              description: data.description,
              tips: data.tips?.map((t: any) => ({
                tip: t.tip,
                importance: t.importance,
              })),
              commonMistakes: data.commonMistakes,
              checkList: data.checkList,
              realWorldExamples: data.realWorldExamples?.slice(0, 3).map((e: any) => ({
                domain: e.domain,
                reason: e.reason,
                severity: e.severity,
              })),
              statistics: data.statistics,
              reference: REFERENCE_MESSAGE,
              siteUrl: SITE_URL,
              disclaimer: DISCLAIMER,
              warnings: FOOTER_WARNINGS,
              moreInfo: FOOTER_MORE_INFO,
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              error: true,
              message: error instanceof Error ? error.message : "Unknown error",
              warnings: FOOTER_WARNINGS,
              moreInfo: FOOTER_MORE_INFO,
            }, null, 2),
          },
        ],
        isError: true,
      };
    }
  }
);

// 도구 6: 사기 신고
server.tool(
  "report_scam",
  "의심되는 사기/피싱 사이트를 신고합니다. 검증 결과 알려진 정보가 없는 사이트를 사용자가 직접 신고하여 다른 사용자들을 보호할 수 있습니다.",
  {
    domain: z.string().describe("신고할 도메인 또는 URL"),
    reportType: z.enum(["phishing", "scam", "malware", "fake-exchange", "wallet-scam", "airdrop-scam", "other"])
      .describe("신고 유형"),
    description: z.string().describe("신고 사유 설명"),
  },
  async ({ domain, reportType, description }) => {
    try {
      const cleanedDomain = cleanDomain(domain);

      const result = await callAPI("/api/mcp/report", {
        method: "POST",
        body: JSON.stringify({
          domain: cleanedDomain,
          reportType,
          description,
        }),
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to submit report");
      }

      const data = result.data;
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              status: data.status,
              message: data.messageKr || data.message,
              domain: data.domain,
              reportId: data.reportId,
              reportType: data.reportTypeKr || reportType,
              nextSteps: data.nextSteps,
              reference: REFERENCE_MESSAGE,
              siteUrl: SITE_URL,
              disclaimer: DISCLAIMER,
              warnings: FOOTER_WARNINGS,
              moreInfo: FOOTER_MORE_INFO,
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              error: true,
              message: error instanceof Error ? error.message : "Unknown error",
              warnings: FOOTER_WARNINGS,
              moreInfo: FOOTER_MORE_INFO,
            }, null, 2),
          },
        ],
        isError: true,
      };
    }
  }
);

// 헬퍼 함수들
function getStatusLabel(status: string, language: string): string {
  const labels: Record<string, Record<string, string>> = {
    safe: { ko: "안전", en: "Safe" },
    warning: { ko: "주의 필요", en: "Warning" },
    danger: { ko: "위험", en: "Danger" },
  };
  return labels[status]?.[language] || status;
}

function formatVolume(btcVolume: number | undefined): string {
  if (!btcVolume) return "N/A";
  const usdVolume = btcVolume * 60000; // 대략적인 BTC 가격
  if (usdVolume >= 1e9) return `$${(usdVolume / 1e9).toFixed(1)}B`;
  if (usdVolume >= 1e6) return `$${(usdVolume / 1e6).toFixed(1)}M`;
  return `$${usdVolume.toFixed(0)}`;
}

function formatCheck(check: Record<string, unknown> | undefined): { score: number; status: string } | null {
  if (!check) return null;
  return {
    score: check.score as number,
    status: check.status as string,
  };
}

// 서버 시작
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Crypto Guardian MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
