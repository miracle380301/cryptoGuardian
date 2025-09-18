import prisma from '../src/lib/db/prisma'

async function clearBlacklist() {
  try {
    console.log('Deleting all BlacklistedDomain data...')

    const result = await prisma.blacklistedDomain.deleteMany({})

    console.log(`Deleted ${result.count} blacklisted domains`)

    // 동기화 로그도 삭제
    const syncResult = await prisma.blacklistSyncLog.deleteMany({})
    console.log(`Deleted ${syncResult.count} sync logs`)

  } catch (error) {
    console.error('Error clearing blacklist:', error)
  } finally {
    await prisma.$disconnect()
  }
}

clearBlacklist()