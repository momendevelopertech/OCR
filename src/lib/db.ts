import { neon } from '@neondatabase/serverless';
import type { StudentRecord, DashboardStats, ScanHistoryRow } from '@/types';

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return neon(url);
}

export async function findStudentByNationalId(
  nationalId: string,
): Promise<StudentRecord | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT national_id, student_name, faculty, academic_year, seat_number, exam_hall, pdf_url
    FROM students
    WHERE national_id = ${nationalId}
    LIMIT 1
  `;
  return (rows[0] as StudentRecord | undefined) ?? null;
}

export async function logScan(
  nationalId: string,
  method: 'ocr' | 'manual',
  found: boolean,
  confidence?: number,
) {
  const sql = getSql();
  await sql`
    INSERT INTO scan_history (national_id, method, found, ocr_confidence)
    VALUES (${nationalId}, ${method}, ${found}, ${confidence ?? null})
  `;
}

export async function getDashboardStats(): Promise<DashboardStats | null> {
  const sql = getSql();
  const [stats] = await sql`
    SELECT
      COUNT(*) FILTER (WHERE scanned_at >= NOW() - INTERVAL '24 hours')::int AS today_scans,
      COUNT(*) FILTER (WHERE found = true AND scanned_at >= NOW() - INTERVAL '24 hours')::int AS today_found,
      COUNT(*) FILTER (WHERE found = false AND scanned_at >= NOW() - INTERVAL '24 hours')::int AS today_not_found
    FROM scan_history
  `;
  return (stats as DashboardStats | undefined) ?? null;
}

export async function getRecentScans(limit = 10): Promise<ScanHistoryRow[]> {
  const sql = getSql();
  return sql`
    SELECT sh.national_id, sh.method, sh.found, sh.scanned_at, s.student_name
    FROM scan_history sh
    LEFT JOIN students s ON sh.national_id = s.national_id
    ORDER BY sh.scanned_at DESC
    LIMIT ${limit}
  ` as unknown as ScanHistoryRow[];
}

export async function insertStudent(
  nationalId: string,
  studentName: string,
  pdfUrl: string,
  pdfBlobKey: string,
  faculty?: string,
  academicYear?: string,
) {
  const sql = getSql();
  await sql`
    INSERT INTO students (national_id, student_name, faculty, academic_year, pdf_url, pdf_blob_key)
    VALUES (${nationalId}, ${studentName}, ${faculty ?? null}, ${academicYear ?? null}, ${pdfUrl}, ${pdfBlobKey})
    ON CONFLICT (national_id) DO UPDATE SET
      student_name = EXCLUDED.student_name,
      faculty = EXCLUDED.faculty,
      academic_year = EXCLUDED.academic_year,
      pdf_url = EXCLUDED.pdf_url,
      pdf_blob_key = EXCLUDED.pdf_blob_key,
      updated_at = NOW()
  `;
}
