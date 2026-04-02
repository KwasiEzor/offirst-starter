import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Get the Payload instance for server-side operations
 * This should only be called in Server Components or API routes
 */
export async function getPayloadClient() {
  return getPayload({ config })
}

export { config }
