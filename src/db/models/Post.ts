import { Model, Q, type Query } from '@nozbe/watermelondb'
import {
  field,
  date,
  readonly,
  writer,
  children,
} from '@nozbe/watermelondb/decorators'

import type PostCategory from './PostCategory'
import type Category from './Category'

export default class Post extends Model {
  static table = 'posts'

  static associations = {
    post_categories: { type: 'has_many' as const, foreignKey: 'post_id' },
  }

  // Server sync fields
  @field('server_id') serverId!: string
  @date('server_updated_at') serverUpdatedAt!: Date | null
  @field('is_dirty') isDirty!: boolean
  @date('synced_at') syncedAt!: Date | null

  // Data fields
  @field('title') title!: string
  @field('slug') slug!: string
  @field('excerpt') excerpt!: string | null
  @field('content') content!: string // JSON stringified Lexical content
  @field('featured_image_id') featuredImageId!: string | null
  @field('author_id') authorId!: string
  @field('status') status!: 'draft' | 'published' | 'archived'
  @date('published_at') publishedAt!: Date | null

  // Timestamps
  @readonly @date('created_at') createdAt!: Date
  @date('updated_at') updatedAt!: Date

  // Relations
  @children('post_categories') postCategories!: PostCategory[]

  // Categories query (using getter instead of @lazy for Next.js compatibility)
  get categories(): Query<Category> {
    return this.collections
      .get<Category>('categories')
      .query(Q.on('post_categories', 'post_id', this.id))
  }

  /**
   * Get parsed Lexical content
   */
  get parsedContent(): unknown {
    try {
      return JSON.parse(this.content)
    } catch {
      return null
    }
  }

  /**
   * Mark this record as needing sync
   */
  @writer async markDirty() {
    await this.update(record => {
      record.isDirty = true
      record.updatedAt = new Date()
    })
  }

  /**
   * Mark this record as synced
   */
  @writer async markSynced(serverId: string) {
    await this.update(record => {
      record.serverId = serverId
      record.serverUpdatedAt = record.updatedAt
      record.isDirty = false
      record.syncedAt = new Date()
    })
  }

  /**
   * Publish this post
   */
  @writer async publish() {
    await this.update(record => {
      record.status = 'published'
      record.publishedAt = new Date()
      record.isDirty = true
      record.updatedAt = new Date()
    })
  }

  /**
   * Unpublish (set to draft)
   */
  @writer async unpublish() {
    await this.update(record => {
      record.status = 'draft'
      record.isDirty = true
      record.updatedAt = new Date()
    })
  }
}
