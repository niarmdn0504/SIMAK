-- ============================================================
-- Migration: Tambah parent_id untuk hierarchical mutabaah items
-- ============================================================

ALTER TABLE mutabaah_item
  ADD COLUMN IF NOT EXISTS parent_id UUID
  REFERENCES mutabaah_item(id)
  ON DELETE CASCADE;

-- Indeks untuk query parent-child
CREATE INDEX IF NOT EXISTS idx_mutabaah_item_parent_id
  ON mutabaah_item(parent_id);
