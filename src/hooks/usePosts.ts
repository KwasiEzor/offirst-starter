'use client'

import { useDatabase } from '@nozbe/watermelondb/react'
import { Q } from '@nozbe/watermelondb'

import type Post from '@/db/models/Post'

type PostStatus = 'draft' | 'published' | 'archived'

interface PostFilters {
  status?: PostStatus
  authorId?: string
  categoryId?: string
}

/**
 * Hook to get a query for posts with optional filters
 */
export function usePostsQuery(filters?: PostFilters) {
  const database = useDatabase()
  const conditions: Q.Clause[] = []

  if (filters?.status) {
    conditions.push(Q.where('status', filters.status))
  }

  if (filters?.authorId) {
    conditions.push(Q.where('author_id', filters.authorId))
  }

  // Sort by updated_at descending (most recent first)
  return database.collections
    .get<Post>('posts')
    .query(...conditions, Q.sortBy('updated_at', Q.desc))
}

/**
 * Hook to get a query for published posts
 */
export function usePublishedPostsQuery() {
  return usePostsQuery({ status: 'published' })
}

/**
 * Hook to get a query for draft posts
 */
export function useDraftPostsQuery() {
  return usePostsQuery({ status: 'draft' })
}

/**
 * Hook to get a query for a single post by slug
 */
export function usePostBySlugQuery(slug: string) {
  const database = useDatabase()
  return database.collections.get<Post>('posts').query(Q.where('slug', slug))
}

/**
 * Hook to get a query for dirty (unsynced) posts
 */
export function useDirtyPostsQuery() {
  const database = useDatabase()
  return database.collections
    .get<Post>('posts')
    .query(Q.where('is_dirty', true))
}
