#!/usr/bin/env node

import express, { Request, Response } from "express";
import cors from "cors";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";

// API base URL
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

// 브랜드 정보 (모든 응답에 포함)
const BRAND_INFO = {
  serviceName: "CryptoGuardian (크립토가디언)",
  description: "암호화폐 피싱 탐지 서비스",
  url: SITE_URL,
  poweredBy: `이 결과는 CryptoGuardian(크립토가디언)에서 제공합니다. ${SITE_URL}`,
};

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
  const usdVolume = btcVolume * 60000;
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

// MCP 서버 생성 함수
function createMcpServer(): McpServer {
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

        const response: Record<string, unknown> = {
          ...BRAND_INFO,
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

        if (result.checks?.aiPhishing?.data?.isTyposquatting) {
          const phishingData = result.checks.aiPhishing.data;
          response.phishingAlert = {
            warning: language === "ko" ? "피싱 사이트 의심" : "Suspected phishing site",
            similarTo: phishingData.similarTo,
            officialUrl: phishingData.officialUrl,
            similarity: phishingData.similarity,
          };
        }

        if (result.checks?.maliciousSite?.data?.isBlacklisted) {
          const blacklistData = result.checks.maliciousSite.data;
          response.blacklistAlert = {
            warning: language === "ko" ? "블랙리스트에 등록된 위험 사이트" : "Blacklisted dangerous site",
            source: blacklistData.source,
            category: blacklistData.category,
            reason: blacklistData.reason,
          };
        }

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

        if (result.recommendations?.length > 0) {
          response.recommendations = result.recommendations;
        }

        response.warnings = FOOTER_WARNINGS;
        response.moreInfo = FOOTER_MORE_INFO;

        return {
          content: [{ type: "text" as const, text: JSON.stringify(response, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({
              error: true,
              message: error instanceof Error ? error.message : "Unknown error",
              warnings: FOOTER_WARNINGS,
              moreInfo: FOOTER_MORE_INFO,
            }, null, 2),
          }],
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

        const exchanges = result.exchanges?.map((ex: Record<string, unknown>) => ({
          name: ex.name,
          officialUrl: ex.url,
          trustScore: ex.trustScore,
          volume24h: formatVolume(ex.tradeVolume24hBtc as number),
          grade: ex.cryptocompareGrade,
          isVerified: ex.isVerified,
        })) || [];

        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({
              ...BRAND_INFO,
              totalExchanges: result.total || exchanges.length,
              exchanges,
              warnings: FOOTER_WARNINGS,
              moreInfo: FOOTER_MORE_INFO,
            }, null, 2),
          }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({
              error: true,
              message: error instanceof Error ? error.message : "Unknown error",
              warnings: FOOTER_WARNINGS,
              moreInfo: FOOTER_MORE_INFO,
            }, null, 2),
          }],
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

        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({
              ...BRAND_INFO,
              totalBlacklistedDomains: result.totalBlacklisted,
              totalVerifiedExchanges: result.totalExchanges,
              recentDetections7d: result.recentDetections,
              detectionRate: result.detectionRate,
              lastUpdated: result.lastUpdated,
              warnings: FOOTER_WARNINGS,
              moreInfo: FOOTER_MORE_INFO,
            }, null, 2),
          }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({
              error: true,
              message: error instanceof Error ? error.message : "Unknown error",
              warnings: FOOTER_WARNINGS,
              moreInfo: FOOTER_MORE_INFO,
            }, null, 2),
          }],
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
          content: [{
            type: "text" as const,
            text: JSON.stringify({
              ...BRAND_INFO,
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
          }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({
              error: true,
              message: error instanceof Error ? error.message : "Unknown error",
              warnings: FOOTER_WARNINGS,
              moreInfo: FOOTER_MORE_INFO,
            }, null, 2),
          }],
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
          content: [{
            type: "text" as const,
            text: JSON.stringify({
              ...BRAND_INFO,
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
          }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({
              error: true,
              message: error instanceof Error ? error.message : "Unknown error",
              warnings: FOOTER_WARNINGS,
              moreInfo: FOOTER_MORE_INFO,
            }, null, 2),
          }],
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
          content: [{
            type: "text" as const,
            text: JSON.stringify({
              ...BRAND_INFO,
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
          }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({
              error: true,
              message: error instanceof Error ? error.message : "Unknown error",
              warnings: FOOTER_WARNINGS,
              moreInfo: FOOTER_MORE_INFO,
            }, null, 2),
          }],
          isError: true,
        };
      }
    }
  );

  return server;
}

// Express 서버 설정
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// express.json()을 /messages 제외한 라우트에만 적용
app.use((req, res, next) => {
  if (req.path === "/messages") {
    next(); // /messages는 raw body 유지 (SSEServerTransport가 직접 처리)
  } else {
    express.json()(req, res, next);
  }
});

// 활성 트랜스포트 저장
const transports: Map<string, SSEServerTransport> = new Map();

// Health check
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", server: "crypto-guardian-mcp", version: "1.0.0" });
});

// SSE 엔드포인트 - 클라이언트 연결
app.get("/sse", async (req: Request, res: Response) => {
  console.log("New SSE connection");

  const transport = new SSEServerTransport("/messages", res);
  const sessionId = transport.sessionId;
  transports.set(sessionId, transport);
  console.log(`Created session: ${sessionId}`);

  const server = createMcpServer();

  res.on("close", () => {
    console.log(`SSE connection closed: ${sessionId}`);
    transports.delete(sessionId);
  });

  await server.connect(transport);
});

// 메시지 수신 엔드포인트
app.post("/messages", async (req: Request, res: Response) => {
  const sessionId = req.query.sessionId as string;
  console.log(`POST /messages received - sessionId: ${sessionId}`);
  console.log(`Active sessions: ${Array.from(transports.keys()).join(", ")}`);

  if (!sessionId) {
    console.log("Error: sessionId is required");
    res.status(400).json({ error: "sessionId is required" });
    return;
  }

  const transport = transports.get(sessionId);

  if (!transport) {
    console.log(`Error: Session not found for ${sessionId}`);
    res.status(404).json({ error: "Session not found" });
    return;
  }

  console.log(`Processing message for session ${sessionId}`);
  try {
    await transport.handlePostMessage(req, res);
    console.log(`Message processed successfully for session ${sessionId}`);
  } catch (error) {
    console.error(`Error processing message for session ${sessionId}:`, error);
  }
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`Crypto Guardian MCP Server (Remote) running on port ${PORT}`);
  console.log(`SSE endpoint: http://localhost:${PORT}/sse`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
