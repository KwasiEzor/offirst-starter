import path from 'path'
import { fileURLToPath } from 'url'

import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import sharp from 'sharp'

import { Users, Media, Categories, Posts } from './payload/collections'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '- Offirst',
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },

  collections: [Users, Media, Categories, Posts],

  editor: lexicalEditor(),

  secret: process.env.PAYLOAD_SECRET || 'CHANGE_ME_IN_PRODUCTION',

  typescript: {
    outputFile: path.resolve(dirname, 'payload/payload-types.ts'),
  },

  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),

  // Sharp is required for image processing
  sharp,

  // Plugins can be added here
  plugins: [],
})
