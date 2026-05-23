import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

async function seed() {
  console.log('🌱 Seeding database...');

  const students = [
    {
      national_id: '29801011234567',
      student_name: 'أحمد محمد علي',
      faculty: 'كلية الهندسة',
      academic_year: '2024/2025',
      pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      pdf_blob_key: 'mock-key-1',
    },
    {
      national_id: '30012051234568',
      student_name: 'سارة أحمد إبراهيم',
      faculty: 'كلية الطب',
      academic_year: '2024/2025',
      pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      pdf_blob_key: 'mock-key-2',
    },
    {
      national_id: '29905151234569',
      student_name: 'محمد عبدالله حسن',
      faculty: 'كلية الحاسبات',
      academic_year: '2024/2025',
      pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      pdf_blob_key: 'mock-key-3',
    },
  ];

  for (const s of students) {
    await sql`
      INSERT INTO students (national_id, student_name, faculty, academic_year, pdf_url, pdf_blob_key)
      VALUES (${s.national_id}, ${s.student_name}, ${s.faculty}, ${s.academic_year}, ${s.pdf_url}, ${s.pdf_blob_key})
      ON CONFLICT (national_id) DO NOTHING
    `;
    console.log(`✅ Inserted: ${s.student_name} (${s.national_id})`);
  }

  console.log('✅ Seed complete.');
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
