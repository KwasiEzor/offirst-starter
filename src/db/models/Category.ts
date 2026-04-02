import { Model } from '@nozbe/watermelondb'
import { field, date, readonly, writer } from '@nozbe/watermelondb/decorators'

export default class Category extends Model {
  static table = 'categories'

  // Server sync fields
  @field('server_id') serverId!: string
  @field('is_dirty') isDirty!: boolean
  @date('synced_at') syncedAt!: Date | null

  // Data fields
  @field('name') name!: string
  @field('slug') slug!: string
  @field('description') description!: string | null
  @field('color') color!: string | null

  // Timestamps
  @readonly @date('created_at') createdAt!: Date
  @date('updated_at') updatedAt!: Date

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
      record.isDirty = false
      record.syncedAt = new Date()
    })
  }
}
