import prisma from '@/lib/db/prisma'

async function cleanExpiredCache() {
  console.log('Starting expired cache cleanup...')

  try {
    const result = await prisma.reputationCache.deleteMany({
      where: {
        cacheExpiry: {
          lt: new Date()
        }
      }
    })

    console.log(`Successfully deleted ${result.count} expired cache entries`)
    return result.count
  } catch (error) {
    console.error('Failed to clean expired cache:', error)
    process.exit(1)
  }
}

// Run the cleanup
cleanExpiredCache()
  .then((count) => {
    console.log('Cache cleanup completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Cleanup failed:', error)
    process.exit(1)
  })