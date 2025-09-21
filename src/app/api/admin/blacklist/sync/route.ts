import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'

// 블랙리스트 동기화 API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { source, data } = body

    if (!source || !data || !Array.isArray(data)) {
      return NextResponse.json(
        { error: 'Invalid request. Source and data array required.' },
        { status: 400 }
      )
    }

    const batchId = `${source.toUpperCase()}-BATCH-${Date.now()}`
    const batchDate = new Date()
    let successCount = 0
    let updateCount = 0
    let errorCount = 0
    const errors: Array<{ domain: string; error: string }> = []

    for (const item of data) {
      try {
        // 도메인 정규화
        const domain = item.domain.toLowerCase().trim()

        // 기존 도메인 확인
        const existing = await prisma.blacklistedDomain.findUnique({
          where: { domain }
        })

        const commonData = {
          reason: item.reason || 'Reported as malicious',
          severity: item.severity || 'high',
          riskLevel: item.riskLevel || 'suspicious',
          category: item.category || 'crypto',
          targetBrand: item.targetBrand,
          description: item.description,
          evidence: item.evidence || [],
          reportDate: item.reportDate ? new Date(item.reportDate) : new Date(),
          reportedBy: item.reportedBy || source,
          lastUpdated: new Date(),
          isConfirmed: item.isConfirmed !== false,
          priority: item.priority || 5
        }

        // 소스별 데이터 추가
        const sourceSpecificData = getSourceSpecificData(source, item)

        if (existing) {
          // 기존 데이터 업데이트
          await prisma.blacklistedDomain.update({
            where: { domain },
            data: {
              ...commonData,
              ...sourceSpecificData,
              dataSources: {
                set: Array.from(new Set([...existing.dataSources, source]))
              },
              verificationSources: {
                set: Array.from(new Set([...existing.verificationSources, source]))
              },
              verificationStatus: 'verified',
              verificationDate: new Date(),
              batchId,
              batchDate,
              lastChecked: new Date()
            }
          })
          updateCount++
        } else {
          // 새 데이터 추가
          await prisma.blacklistedDomain.create({
            data: {
              domain,
              ...commonData,
              ...sourceSpecificData,
              primaryDataSource: source,
              dataSources: [source],
              verificationStatus: 'verified',
              verificationSources: [source],
              verificationDate: new Date(),
              batchId,
              batchDate,
              lastChecked: new Date(),
              isActive: true
            }
          })
          successCount++
        }
      } catch (error: unknown) {
        errorCount++
        errors.push({
          domain: item.domain,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // 동기화 로그 저장
    await prisma.blacklistSyncLog.create({
      data: {
        batchDate,
        source,
        totalFetched: data.length,
        totalInserted: successCount,
        totalUpdated: updateCount,
        totalFailed: errorCount,
        status: errorCount === 0 ? 'success' : errorCount === data.length ? 'failed' : 'partial',
        errorMessage: errors.length > 0 ? JSON.stringify(errors) : null,
        executionTime: Date.now() - batchDate.getTime()
      }
    })

    return NextResponse.json({
      success: true,
      batchId,
      summary: {
        total: data.length,
        inserted: successCount,
        updated: updateCount,
        failed: errorCount
      },
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    console.error('Blacklist sync error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// 소스별 특정 필드 매핑
function getSourceSpecificData(source: string, item: Record<string, unknown>): Record<string, unknown> {
  const data: Record<string, unknown> = {}

  switch (source.toLowerCase()) {
    case 'kisa':
      if (item.kisaId) data.kisaId = item.kisaId
      if (item.kisaCategory) data.kisaCategory = item.kisaCategory
      if (item.kisaReportDate && typeof item.kisaReportDate === 'string') data.kisaReportDate = new Date(item.kisaReportDate)
      if (item.kisaStatus) data.kisaStatus = item.kisaStatus
      if (item.kisaReference) data.kisaReference = item.kisaReference
      break

    case 'virustotal':
      if (item.detections) data.virusTotalDetections = item.detections
      if (item.virusTotalUrl) data.virusTotalUrl = item.virusTotalUrl
      break

    case 'phishtank':
      if (item.phishId) data.phishTankId = item.phishId
      if (item.phishUrl) data.phishTankUrl = item.phishUrl
      break

    case 'cryptoscamdb':
      if (item.scamId) data.cryptoScamDBId = item.scamId
      break

    case 'fca':
      if (item.warningId) data.fcaWarningId = item.warningId
      break

    case 'sec':
      if (item.actionId) data.secActionId = item.actionId
      break
  }

  return data
}

// GET: 블랙리스트 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const source = searchParams.get('source')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: Record<string, unknown> = {
      isActive: true
    }

    if (source) {
      where.dataSources = {
        has: source
      }
    }

    const [blacklist, total] = await Promise.all([
      prisma.blacklistedDomain.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: [
          { priority: 'desc' },
          { updatedAt: 'desc' }
        ]
      }),
      prisma.blacklistedDomain.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: blacklist,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })
  } catch (error) {
    console.error('Blacklist fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}