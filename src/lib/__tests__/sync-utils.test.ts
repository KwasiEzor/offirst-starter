import { describe, it, expect } from 'vitest'
import {
  isSyncableCollection,
  payloadToWatermelon,
  watermelonToPayload,
  shouldUseServerVersion,
  generateTempId,
  isTempId,
  parseTimestamp,
  formatTimestamp,
  SYNCABLE_COLLECTIONS,
} from '../sync-utils'

describe('sync-utils', () => {
  describe('SYNCABLE_COLLECTIONS', () => {
    it('should include categories and posts', () => {
      expect(SYNCABLE_COLLECTIONS).toContain('categories')
      expect(SYNCABLE_COLLECTIONS).toContain('posts')
    })
  })

  describe('isSyncableCollection', () => {
    it('should return true for syncable collections', () => {
      expect(isSyncableCollection('categories')).toBe(true)
      expect(isSyncableCollection('posts')).toBe(true)
    })

    it('should return false for non-syncable collections', () => {
      expect(isSyncableCollection('users')).toBe(false)
      expect(isSyncableCollection('media')).toBe(false)
      expect(isSyncableCollection('unknown')).toBe(false)
    })
  })

  describe('payloadToWatermelon', () => {
    it('should transform category document', () => {
      const payloadDoc = {
        id: '123',
        name: 'Test Category',
        slug: 'test-category',
        description: 'A test category',
        color: '#ff0000',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
      }

      const result = payloadToWatermelon('categories', payloadDoc)

      expect(result.serverId).toBe('123')
      expect(result.id).toBe('123')
      expect(result.name).toBe('Test Category')
      expect(result.slug).toBe('test-category')
      expect(result.description).toBe('A test category')
      expect(result.color).toBe('#ff0000')
      expect(result.is_dirty).toBe(false)
      expect(result.created_at).toBe(
        new Date('2024-01-01T00:00:00.000Z').getTime()
      )
      expect(result.updated_at).toBe(
        new Date('2024-01-02T00:00:00.000Z').getTime()
      )
    })

    it('should transform post document', () => {
      const payloadDoc = {
        id: '456',
        title: 'Test Post',
        slug: 'test-post',
        excerpt: 'A test excerpt',
        content: { root: { children: [] } },
        featuredImage: { id: 'img-123' },
        author: { id: 'user-123' },
        status: 'published',
        publishedAt: '2024-01-15T00:00:00.000Z',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
      }

      const result = payloadToWatermelon('posts', payloadDoc)

      expect(result.serverId).toBe('456')
      expect(result.id).toBe('456')
      expect(result.title).toBe('Test Post')
      expect(result.slug).toBe('test-post')
      expect(result.excerpt).toBe('A test excerpt')
      expect(result.content).toBe(JSON.stringify({ root: { children: [] } }))
      expect(result.featured_image_id).toBe('img-123')
      expect(result.author_id).toBe('user-123')
      expect(result.status).toBe('published')
      expect(result.published_at).toBe(
        new Date('2024-01-15T00:00:00.000Z').getTime()
      )
    })

    it('should handle null optional fields', () => {
      const payloadDoc = {
        id: '789',
        name: 'Category',
        slug: 'category',
        description: null,
        color: null,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }

      const result = payloadToWatermelon('categories', payloadDoc)

      expect(result.description).toBeNull()
      expect(result.color).toBeNull()
    })

    it('should throw for unknown collection', () => {
      expect(() => {
        payloadToWatermelon('unknown' as 'categories', { id: '1' })
      }).toThrow('Unknown collection: unknown')
    })
  })

  describe('watermelonToPayload', () => {
    it('should transform category record', () => {
      const wmRecord = {
        id: '123',
        serverId: '123',
        name: 'Test Category',
        slug: 'test-category',
        description: 'A test',
        color: '#00ff00',
      }

      const result = watermelonToPayload('categories', wmRecord)

      expect(result.name).toBe('Test Category')
      expect(result.slug).toBe('test-category')
      expect(result.description).toBe('A test')
      expect(result.color).toBe('#00ff00')
    })

    it('should transform post record', () => {
      const wmRecord = {
        id: '456',
        serverId: '456',
        title: 'Test Post',
        slug: 'test-post',
        excerpt: 'An excerpt',
        content: JSON.stringify({ root: { children: [] } }),
        featured_image_id: 'img-1',
        author_id: 'user-1',
        status: 'draft',
        published_at: null,
      }

      const result = watermelonToPayload('posts', wmRecord)

      expect(result.title).toBe('Test Post')
      expect(result.slug).toBe('test-post')
      expect(result.excerpt).toBe('An excerpt')
      expect(result.content).toEqual({ root: { children: [] } })
      expect(result.featuredImage).toBe('img-1')
      expect(result.author).toBe('user-1')
      expect(result.status).toBe('draft')
      expect(result.publishedAt).toBeUndefined()
    })

    it('should convert published_at timestamp to ISO string', () => {
      const timestamp = new Date('2024-06-15T12:00:00.000Z').getTime()
      const wmRecord = {
        id: '789',
        serverId: '789',
        title: 'Post',
        slug: 'post',
        author_id: 'user-1',
        status: 'published',
        published_at: timestamp,
      }

      const result = watermelonToPayload('posts', wmRecord)

      expect(result.publishedAt).toBe('2024-06-15T12:00:00.000Z')
    })
  })

  describe('shouldUseServerVersion', () => {
    it('should return true when server is newer', () => {
      const serverTime = Date.now()
      const localTime = serverTime - 1000

      expect(shouldUseServerVersion(serverTime, localTime)).toBe(true)
    })

    it('should return true when timestamps are equal', () => {
      const time = Date.now()

      expect(shouldUseServerVersion(time, time)).toBe(true)
    })

    it('should return false when local is newer', () => {
      const localTime = Date.now()
      const serverTime = localTime - 1000

      expect(shouldUseServerVersion(serverTime, localTime)).toBe(false)
    })
  })

  describe('generateTempId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateTempId()
      const id2 = generateTempId()

      expect(id1).not.toBe(id2)
    })

    it('should start with temp_ prefix', () => {
      const id = generateTempId()

      expect(id).toMatch(/^temp_/)
    })
  })

  describe('isTempId', () => {
    it('should return true for temp IDs', () => {
      expect(isTempId('temp_1234_abc')).toBe(true)
      expect(isTempId('temp_')).toBe(true)
    })

    it('should return false for regular IDs', () => {
      expect(isTempId('123')).toBe(false)
      expect(isTempId('uuid-abc-123')).toBe(false)
      expect(isTempId('')).toBe(false)
    })
  })

  describe('parseTimestamp', () => {
    it('should parse ISO string to timestamp', () => {
      const isoString = '2024-01-15T12:00:00.000Z'
      const expected = new Date(isoString).getTime()

      expect(parseTimestamp(isoString)).toBe(expected)
    })

    it('should return 0 for null', () => {
      expect(parseTimestamp(null)).toBe(0)
    })
  })

  describe('formatTimestamp', () => {
    it('should format timestamp to ISO string', () => {
      const timestamp = new Date('2024-06-20T15:30:00.000Z').getTime()

      expect(formatTimestamp(timestamp)).toBe('2024-06-20T15:30:00.000Z')
    })
  })
})
