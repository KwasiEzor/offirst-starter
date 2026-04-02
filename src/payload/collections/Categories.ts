import type { CollectionConfig } from 'payload'

import { adminOnly, authenticated } from '../access'
import { trackChange, trackDelete } from '../hooks'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'createdAt'],
  },
  access: {
    read: () => true,
    create: authenticated,
    update: authenticated,
    delete: adminOnly,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'color',
      type: 'text',
      admin: {
        description: 'Hex color code (e.g., #3B82F6)',
      },
    },
  ],
  hooks: {
    afterChange: [trackChange('categories')],
    afterDelete: [trackDelete('categories')],
  },
  timestamps: true,
}
