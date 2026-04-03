/**
 * Database seed script
 * Creates demo data for development and testing
 *
 * Usage: pnpm db:seed
 */

import { getPayload } from 'payload'
import config from '../src/payload.config'

const ADMIN_EMAIL = 'admin@example.com'
const ADMIN_PASSWORD = 'admin123'

const CATEGORIES = [
  {
    name: 'Technology',
    slug: 'technology',
    description: 'Posts about technology, software, and innovation',
    color: '#3B82F6',
  },
  {
    name: 'Design',
    slug: 'design',
    description: 'UI/UX design, visual design, and creative inspiration',
    color: '#8B5CF6',
  },
  {
    name: 'Business',
    slug: 'business',
    description: 'Business strategies, startups, and entrepreneurship',
    color: '#10B981',
  },
  {
    name: 'Lifestyle',
    slug: 'lifestyle',
    description: 'Life hacks, productivity, and personal development',
    color: '#F59E0B',
  },
]

const POSTS = [
  {
    title: 'Getting Started with Offline-First Apps',
    slug: 'getting-started-offline-first',
    excerpt:
      'Learn how to build applications that work seamlessly offline and sync when connected.',
    status: 'published',
    categorySlug: 'technology',
  },
  {
    title: 'The Future of Web Development',
    slug: 'future-web-development',
    excerpt:
      'Exploring emerging trends and technologies shaping the future of web development.',
    status: 'published',
    categorySlug: 'technology',
  },
  {
    title: 'Designing for Accessibility',
    slug: 'designing-accessibility',
    excerpt:
      'Best practices for creating inclusive designs that work for everyone.',
    status: 'published',
    categorySlug: 'design',
  },
  {
    title: 'Building a Startup in 2024',
    slug: 'building-startup-2024',
    excerpt: 'Key lessons and strategies for launching a successful startup.',
    status: 'draft',
    categorySlug: 'business',
  },
  {
    title: 'Productivity Tips for Developers',
    slug: 'productivity-tips-developers',
    excerpt: 'Maximize your coding efficiency with these proven techniques.',
    status: 'published',
    categorySlug: 'lifestyle',
  },
]

async function seed() {
  console.log('Starting database seed...')

  const payload = await getPayload({ config })

  // Create admin user
  console.log('Creating admin user...')
  const existingAdmin = await payload.find({
    collection: 'users',
    where: { email: { equals: ADMIN_EMAIL } },
  })

  let adminUser: { id: string | number }
  if (existingAdmin.docs.length === 0) {
    adminUser = await payload.create({
      collection: 'users',
      data: {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: 'admin',
        name: 'Admin User',
      },
    })
    console.log(`Created admin user: ${ADMIN_EMAIL}`)
  } else {
    const existingUser = existingAdmin.docs[0]
    if (!existingUser) {
      throw new Error(
        'Unexpected: existingAdmin.docs is not empty but first item is undefined'
      )
    }
    adminUser = existingUser
    console.log(`Admin user already exists: ${ADMIN_EMAIL}`)
  }

  // Create categories
  console.log('Creating categories...')
  const categoryMap = new Map<string, string>()

  for (const category of CATEGORIES) {
    const existing = await payload.find({
      collection: 'categories',
      where: { slug: { equals: category.slug } },
    })

    if (existing.docs.length === 0) {
      const created = await payload.create({
        collection: 'categories',
        data: category,
      })
      categoryMap.set(category.slug, String(created.id))
      console.log(`Created category: ${category.name}`)
    } else {
      const existingCategory = existing.docs[0]
      if (existingCategory) {
        categoryMap.set(category.slug, String(existingCategory.id))
      }
      console.log(`Category already exists: ${category.name}`)
    }
  }

  // Create posts
  console.log('Creating posts...')
  for (const post of POSTS) {
    const existing = await payload.find({
      collection: 'posts',
      where: { slug: { equals: post.slug } },
    })

    if (existing.docs.length === 0) {
      const categoryId = categoryMap.get(post.categorySlug)

      await payload.create({
        collection: 'posts',
        data: {
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          status: post.status,
          author: adminUser.id,
          categories: categoryId ? [categoryId] : [],
          content: {
            root: {
              type: 'root',
              format: '',
              indent: 0,
              version: 1,
              children: [
                {
                  type: 'paragraph',
                  format: '',
                  indent: 0,
                  version: 1,
                  children: [
                    {
                      mode: 'normal',
                      text: `This is the content for "${post.title}". Edit this post in the admin panel to add more content.`,
                      type: 'text',
                      style: '',
                      detail: 0,
                      format: 0,
                      version: 1,
                    },
                  ],
                  direction: 'ltr',
                },
              ],
              direction: 'ltr',
            },
          },
          publishedAt:
            post.status === 'published' ? new Date().toISOString() : undefined,
        },
      })
      console.log(`Created post: ${post.title}`)
    } else {
      console.log(`Post already exists: ${post.title}`)
    }
  }

  console.log('')
  console.log('Seed completed!')
  console.log('')
  console.log('You can now log in with:')
  console.log(`  Email: ${ADMIN_EMAIL}`)
  console.log(`  Password: ${ADMIN_PASSWORD}`)
  console.log('')

  process.exit(0)
}

seed().catch(error => {
  console.error('Seed failed:', error)
  process.exit(1)
})
