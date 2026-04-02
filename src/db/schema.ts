import { appSchema, tableSchema } from '@nozbe/watermelondb'

/**
 * WatermelonDB schema for offline-first data
 * Mirrors the Payload CMS collections that need offline support
 */
export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'categories',
      columns: [
        { name: 'server_id', type: 'string', isIndexed: true },
        { name: 'name', type: 'string' },
        { name: 'slug', type: 'string', isIndexed: true },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'color', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'synced_at', type: 'number', isOptional: true },
        { name: 'is_dirty', type: 'boolean' },
      ],
    }),
    tableSchema({
      name: 'posts',
      columns: [
        { name: 'server_id', type: 'string', isIndexed: true },
        { name: 'title', type: 'string' },
        { name: 'slug', type: 'string', isIndexed: true },
        { name: 'excerpt', type: 'string', isOptional: true },
        { name: 'content', type: 'string' }, // JSON stringified Lexical content
        { name: 'featured_image_id', type: 'string', isOptional: true },
        { name: 'author_id', type: 'string', isIndexed: true },
        { name: 'status', type: 'string', isIndexed: true }, // draft | published | archived
        { name: 'published_at', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'synced_at', type: 'number', isOptional: true },
        { name: 'is_dirty', type: 'boolean' },
      ],
    }),
    tableSchema({
      name: 'post_categories',
      columns: [
        { name: 'post_id', type: 'string', isIndexed: true },
        { name: 'category_id', type: 'string', isIndexed: true },
      ],
    }),
  ],
})

export default schema
