import { Model } from '@nozbe/watermelondb'
import { field, immutableRelation } from '@nozbe/watermelondb/decorators'

import type Post from './Post'
import type Category from './Category'

/**
 * Join table for Post <-> Category many-to-many relationship
 */
export default class PostCategory extends Model {
  static table = 'post_categories'

  static associations = {
    posts: { type: 'belongs_to' as const, key: 'post_id' },
    categories: { type: 'belongs_to' as const, key: 'category_id' },
  }

  @field('post_id') postId!: string
  @field('category_id') categoryId!: string

  @immutableRelation('posts', 'post_id') post!: Post
  @immutableRelation('categories', 'category_id') category!: Category
}
