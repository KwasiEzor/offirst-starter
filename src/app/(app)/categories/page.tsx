'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useDatabase } from '@nozbe/watermelondb/react'
import { Q } from '@nozbe/watermelondb'

import type Category from '@/db/models/Category'

export default function CategoriesPage() {
  const database = useDatabase()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const subscription = database
      .get<Category>('categories')
      .query(Q.sortBy('name', Q.asc))
      .observe()
      .subscribe(results => {
        setCategories(results)
        setLoading(false)
      })

    return () => subscription.unsubscribe()
  }, [database])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading categories...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Categories
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'}{' '}
            synced locally
          </p>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
          <p className="text-gray-500 dark:text-gray-400">
            No categories yet. Create categories in the admin panel.
          </p>
          <Link
            href="/admin/collections/categories"
            className="mt-4 inline-block text-blue-600 hover:text-blue-500"
          >
            Go to Admin Panel
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map(category => (
            <div
              key={category.id}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex items-start gap-3">
                {category.color && (
                  <div
                    className="mt-1 h-4 w-4 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                )}
                <div className="flex-1">
                  <h2 className="font-semibold text-gray-900 dark:text-white">
                    {category.name}
                  </h2>
                  {category.description && (
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {category.description}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span>/{category.slug}</span>
                    {category.syncedAt && (
                      <span>
                        Synced:{' '}
                        {new Date(category.syncedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                {category.isDirty && (
                  <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                    Pending
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
