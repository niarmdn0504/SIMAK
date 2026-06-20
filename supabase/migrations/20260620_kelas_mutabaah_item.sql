-- ============================================================
-- Migration: kelas_mutabaah_item — relasi kelas ↔ item mutabaah
-- Guru memilih item mana yang berlaku untuk kelasnya
-- ============================================================

CREATE TABLE IF NOT EXISTS kelas_mutabaah_item (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kelas_id         UUID NOT NULL REFERENCES kelas(id) ON DELETE CASCADE,
  mutabaah_item_id UUID NOT NULL REFERENCES mutabaah_item(id) ON DELETE CASCADE,
  created_at       TIMESTAMPTZ DEFAULT now(),
  UNIQUE(kelas_id, mutabaah_item_id)
);

-- Indeks
CREATE INDEX IF NOT EXISTS idx_kelas_mutabaah_item_kelas
  ON kelas_mutabaah_item(kelas_id);

CREATE INDEX IF NOT EXISTS idx_kelas_mutabaah_item_item
  ON kelas_mutabaah_item(mutabaah_item_id);

-- RLS
ALTER TABLE kelas_mutabaah_item ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "Admin all access kelas_mutabaah_item"
  ON kelas_mutabaah_item FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_profile WHERE id = auth.uid() AND role = 'admin' AND is_active = true)
  );

-- Guru read own class items
CREATE POLICY "Guru read own class items"
  ON kelas_mutabaah_item FOR SELECT
  TO authenticated
  USING (
    kelas_id IN (
      SELECT id FROM kelas WHERE wali_kelas_id = auth.uid()
    )
  );

-- Guru insert/update own class items
CREATE POLICY "Guru manage own class items"
  ON kelas_mutabaah_item FOR INSERT
  TO authenticated
  WITH CHECK (
    kelas_id IN (
      SELECT id FROM kelas WHERE wali_kelas_id = auth.uid()
    )
  );

CREATE POLICY "Guru delete own class items"
  ON kelas_mutabaah_item FOR DELETE
  TO authenticated
  USING (
    kelas_id IN (
      SELECT id FROM kelas WHERE wali_kelas_id = auth.uid()
    )
  );
