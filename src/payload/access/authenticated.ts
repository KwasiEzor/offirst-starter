import type { Access } from 'payload'

/**
 * Access control that allows any authenticated user
 */
export const authenticated: Access = ({ req: { user } }) => {
  return Boolean(user)
}
