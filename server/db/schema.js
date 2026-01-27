import { query } from "../db.js";

export const ensureBriefsTable = async () => {
  await query(
    `CREATE TABLE IF NOT EXISTS briefs (
      id SERIAL PRIMARY KEY,
      wp_id INTEGER UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      subtitle TEXT,
      published_at TIMESTAMPTZ,
      modified_at TIMESTAMPTZ,
      source TEXT NOT NULL DEFAULT 'charedim.co.il',
      source_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`
  );

  await query(
    "CREATE INDEX IF NOT EXISTS briefs_published_at_idx ON briefs (published_at DESC)"
  );
};
