CREATE TABLE IF NOT EXISTS users (
  id              SERIAL PRIMARY KEY,
  name            TEXT NOT NULL,
  email           TEXT NOT NULL UNIQUE,
  password_hash   TEXT NOT NULL,
  role            TEXT NOT NULL DEFAULT 'student',
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
  id              SERIAL PRIMARY KEY,
  student_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_name    TEXT NOT NULL,
  budget          NUMERIC NOT NULL,
  currency        TEXT NOT NULL DEFAULT '₦',
  description     TEXT NOT NULL,
  preferred_date  TEXT NOT NULL,
  preferred_time  TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'Pending',
  admin_note      TEXT,
  confirmed_date  TEXT,
  confirmed_time  TEXT,
  attachment_url  TEXT,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id              SERIAL PRIMARY KEY,
  project_id      INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  sender_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content         TEXT NOT NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS password_resets (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token           TEXT NOT NULL,
  expires_at      TIMESTAMP NOT NULL,
  used            BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS project_catalog (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  domain VARCHAR(50) NOT NULL,
  short_description TEXT,
  difficulty VARCHAR(20) DEFAULT 'Intermediate' CHECK (difficulty IN ('Beginner','Intermediate','Advanced')),
  is_active BOOLEAN DEFAULT TRUE,
  full_description TEXT,
  tech_stack VARCHAR(255),
  estimated_duration VARCHAR(50),
  objectives TEXT[],
  prerequisites TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_catalog_domain ON project_catalog(domain);

ALTER TABLE projects ADD COLUMN IF NOT EXISTS catalog_project_id INTEGER REFERENCES project_catalog(id);
