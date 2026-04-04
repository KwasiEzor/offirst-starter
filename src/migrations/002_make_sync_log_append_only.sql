-- Migration: Convert sync_log to append-only event storage
-- This removes the one-row-per-document constraint that causes
-- create/update sequences to collapse and break incremental sync.

ALTER TABLE sync_log
DROP CONSTRAINT IF EXISTS sync_log_unique_doc;

CREATE INDEX IF NOT EXISTS idx_sync_log_collection_id
ON sync_log (collection, id);

CREATE INDEX IF NOT EXISTS idx_sync_log_collection_document_id
ON sync_log (collection, document_id, id DESC);
