import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

async function migrate() {
  console.log('🚀 Running migration...');

  await sql`
    CREATE TABLE IF NOT EXISTS students (
      id               SERIAL PRIMARY KEY,
      national_id      VARCHAR(14) NOT NULL UNIQUE,
      student_name     VARCHAR(255) NOT NULL,
      faculty          VARCHAR(255),
      academic_year    VARCHAR(50),
      pdf_url          TEXT NOT NULL,
      pdf_blob_key     TEXT NOT NULL,
      uploaded_at      TIMESTAMP DEFAULT NOW(),
      updated_at       TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS scan_history (
      id               SERIAL PRIMARY KEY,
      national_id      VARCHAR(14) NOT NULL,
      method           VARCHAR(10) NOT NULL,
      found            BOOLEAN NOT NULL,
      ocr_confidence   FLOAT,
      scanned_at       TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_students_national_id ON students(national_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_scan_history_scanned_at ON scan_history(scanned_at DESC)`;

  console.log('✅ Migration complete.');
  process.exit(0);
}

migrate().catch((e) => { console.error(e); process.exit(1); });
