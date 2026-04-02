'use client'

import { useDatabase } from '@nozbe/watermelondb/react'
import { Q } from '@nozbe/watermelondb'

import type Category from '@/db/models/Category'

/**
 * Hook to get a query for all categories
 * Use with withObservables or useObservable for reactive updates
 */
export function useCategoriesQuery() {
  const database = useDatabase()
  return database.collections
    .get<Category>('categories')
    .query(Q.sortBy('name', Q.asc))
}

/**
 * Hook to get a query for a single category by slug
 */
export function useCategoryBySlugQuery(slug: string) {
  const database = useDatabase()
  return database.collections
    .get<Category>('categories')
    .query(Q.where('slug', slug))
}

/**
 * Hook to get a query for dirty (unsynced) categories
 */
export function useDirtyCategoriesQuery() {
  const database = useDatabase()
  return database.collections
    .get<Category>('categories')
    .query(Q.where('is_dirty', true))
}
