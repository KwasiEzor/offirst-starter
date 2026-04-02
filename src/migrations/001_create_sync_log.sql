-- Migration: Create sync_log table for offline-first synchronization
-- This table tracks all changes made to documents for WatermelonDB sync

CREATE TABLE IF NOT EXISTS sync_log (
  id SERIAL PRIMARY KEY,
  collection VARCHAR(255) NOT NULL,
  document_id VARCHAR(255) NOT NULL,
  operation VARCHAR(50) NOT NULL CHECK (operation IN ('create', 'update', 'delete')),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint to prevent duplicate entries
  CONSTRAINT sync_log_unique_doc UNIQUE (collection, document_id)
);

-- Index for efficient querying by timestamp (used in sync pull)
CREATE INDEX IF NOT EXISTS idx_sync_log_timestamp ON sync_log (timestamp);

-- Index for querying by collection
CREATE INDEX IF NOT EXISTS idx_sync_log_collection ON sync_log (collection);

-- Index for querying by user (useful for user-scoped sync)
CREATE INDEX IF NOT EXISTS idx_sync_log_user_id ON sync_log (user_id);
