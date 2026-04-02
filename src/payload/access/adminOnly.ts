import type { Access } from 'payload'

import type { User } from '../payload-types'

/**
 * Access control that allows only admin users
 */
export const adminOnly: Access<User> = ({ req: { user } }) => {
  if (!user) return false
  return user.role === 'admin'
}
