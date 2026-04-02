import { NextResponse } from 'next/server'

import { getPayloadClient } from '@/lib/payload'

interface HealthStatus {
  status: 'ok' | 'degraded' | 'error'
  timestamp: string
  services: {
    api: boolean
    database: boolean
  }
  version?: string
}

/**
 * GET /api/health
 *
 * Health check endpoint for monitoring and sync connectivity checks
 */
export async function GET() {
  const timestamp = new Date().toISOString()
  let databaseOk = false

  try {
    // Check database connection via Payload
    const payload = await getPayloadClient()

    // Simple query to verify database connection
    await payload.find({
      collection: 'users',
      limit: 1,
    })

    databaseOk = true
  } catch (error) {
    console.error('Health check - database error:', error)
  }

  const status: HealthStatus = {
    status: databaseOk ? 'ok' : 'degraded',
    timestamp,
    services: {
      api: true,
      database: databaseOk,
    },
    version: process.env.npm_package_version || '0.1.0',
  }

  return NextResponse.json(status, {
    status: databaseOk ? 200 : 503,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  })
}
