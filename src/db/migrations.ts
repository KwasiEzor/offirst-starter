import {
  schemaMigrations,
  createTable,
  addColumns,
} from '@nozbe/watermelondb/Schema/migrations'

/**
 * WatermelonDB migrations
 * Add new migrations here when schema changes
 *
 * IMPORTANT: Never modify existing migrations, only add new ones
 * Each migration should increment the toVersion by 1
 */
export const migrations = schemaMigrations({
  migrations: [
    // Initial schema - version 1
    // No migrations needed for v1, schema.ts handles initial setup
    //
    // Example migration for future reference:
    // {
    //   toVersion: 2,
    //   steps: [
    //     addColumns({
    //       table: 'posts',
    //       columns: [
    //         { name: 'new_field', type: 'string', isOptional: true },
    //       ],
    //     }),
    //   ],
    // },
  ],
})

export default migrations

// Re-export migration helpers for convenience
export { createTable, addColumns }
