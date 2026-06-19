-- ============================================================
-- MIGRATION: user_roles (multi-role support)
-- Jalankan ini di Supabase SQL Editor sebelum deploy Fase 2
-- ============================================================

-- 1. Buat tabel user_roles
CREATE TABLE IF NOT EXISTS user_roles (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL CHECK (role IN ('wali_kelas', 'guru_tahfiz', 'guru_wafa')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- 2. Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Policy: admin bisa baca semua, user bisa baca sendiri
CREATE POLICY "Admin can read all user_roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profile
      WHERE user_profile.id = auth.uid()
      AND user_profile.role = 'admin'
      AND user_profile.is_active = true
    )
  );

CREATE POLICY "Users can read own roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 4. Populate dari user_profile.role yang sudah ada
INSERT INTO user_roles (user_id, role)
SELECT id, role
FROM user_profile
WHERE role IN ('wali_kelas', 'guru_tahfiz', 'guru_wafa')
  AND is_active = true
ON CONFLICT (user_id, role) DO NOTHING;

-- 5. Index untuk query cepat
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
