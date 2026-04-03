'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useDatabase } from '@nozbe/watermelondb/react'
import { Q } from '@nozbe/watermelondb'

import type Post from '@/db/models/Post'

export default function PostsPage() {
  const database = useDatabase()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const subscription = database
      .get<Post>('posts')
      .query(Q.sortBy('created_at', Q.desc))
      .observe()
      .subscribe(results => {
        setPosts(results)
        setLoading(false)
      })

    return () => subscription.unsubscribe()
  }, [database])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading posts...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Posts
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {posts.length} post{posts.length !== 1 ? 's' : ''} synced locally
          </p>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
          <p className="text-gray-500 dark:text-gray-400">
            No posts yet. Create posts in the admin panel.
          </p>
          <Link
            href="/admin/collections/posts"
            className="mt-4 inline-block text-blue-600 hover:text-blue-500"
          >
            Go to Admin Panel
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {posts.map(post => (
            <div
              key={post.id}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span
                      className={`rounded-full px-2 py-0.5 ${
                        post.status === 'published'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}
                    >
                      {post.status}
                    </span>
                    <span>/{post.slug}</span>
                    {post.syncedAt && (
                      <span>
                        Synced: {new Date(post.syncedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                {post.isDirty && (
                  <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                    Pending sync
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
