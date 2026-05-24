import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

interface Student {
  national_id: string;
  student_name: string;
  faculty: string;
  academic_year: string;
  seat_number: string;
  exam_hall: string;
  pdf_url: string;
  pdf_blob_key: string;
}

const DUMMY_PDF = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

const students: Student[] = [
  // ✅ YOUR REAL TEST CARD — must work with OCR scan
  {
    national_id: '29503010200394',
    student_name: 'أحمد عبده محمد اللبان',
    faculty: 'كلية الهندسة',
    academic_year: '2024/2025',
    seat_number: 'A-101',
    exam_hall: 'قاعة 1 - مبنى الهندسة',
    pdf_url: DUMMY_PDF,
    pdf_blob_key: 'seed-29503010200394',
  },

  // --- كلية الهندسة ---
  {
    national_id: '29801011234567',
    student_name: 'محمد عبدالله حسن',
    faculty: 'كلية الهندسة',
    academic_year: '2024/2025',
    seat_number: 'A-102',
    exam_hall: 'قاعة 1 - مبنى الهندسة',
    pdf_url: DUMMY_PDF,
    pdf_blob_key: 'seed-29801011234567',
  },
  {
    national_id: '30005201234568',
    student_name: 'عمر خالد إبراهيم',
    faculty: 'كلية الهندسة',
    academic_year: '2024/2025',
    seat_number: 'A-103',
    exam_hall: 'قاعة 1 - مبنى الهندسة',
    pdf_url: DUMMY_PDF,
    pdf_blob_key: 'seed-30005201234568',
  },
  {
    national_id: '29912151234569',
    student_name: 'يوسف محمود سعيد',
    faculty: 'كلية الهندسة',
    academic_year: '2024/2025',
    seat_number: 'A-104',
    exam_hall: 'قاعة 2 - مبنى الهندسة',
    pdf_url: DUMMY_PDF,
    pdf_blob_key: 'seed-29912151234569',
  },

  // --- كلية الطب ---
  {
    national_id: '30012051234570',
    student_name: 'سارة أحمد إبراهيم',
    faculty: 'كلية الطب',
    academic_year: '2024/2025',
    seat_number: 'B-201',
    exam_hall: 'قاعة 1 - كلية الطب',
    pdf_url: DUMMY_PDF,
    pdf_blob_key: 'seed-30012051234570',
  },
  {
    national_id: '29807221234571',
    student_name: 'نور الهدى علي مصطفى',
    faculty: 'كلية الطب',
    academic_year: '2024/2025',
    seat_number: 'B-202',
    exam_hall: 'قاعة 1 - كلية الطب',
    pdf_url: DUMMY_PDF,
    pdf_blob_key: 'seed-29807221234571',
  },
  {
    national_id: '29911031234572',
    student_name: 'ريم عبدالرحمن فاروق',
    faculty: 'كلية الطب',
    academic_year: '2024/2025',
    seat_number: 'B-203',
    exam_hall: 'قاعة 2 - كلية الطب',
    pdf_url: DUMMY_PDF,
    pdf_blob_key: 'seed-29911031234572',
  },

  // --- كلية الحاسبات ---
  {
    national_id: '30103101234573',
    student_name: 'كريم وليد منصور',
    faculty: 'كلية الحاسبات والمعلومات',
    academic_year: '2024/2025',
    seat_number: 'C-301',
    exam_hall: 'معمل 1 - الحاسبات',
    pdf_url: DUMMY_PDF,
    pdf_blob_key: 'seed-30103101234573',
  },
  {
    national_id: '29806141234574',
    student_name: 'مريم حسام الدين',
    faculty: 'كلية الحاسبات والمعلومات',
    academic_year: '2024/2025',
    seat_number: 'C-302',
    exam_hall: 'معمل 1 - الحاسبات',
    pdf_url: DUMMY_PDF,
    pdf_blob_key: 'seed-29806141234574',
  },
  {
    national_id: '30209181234575',
    student_name: 'أدم طارق عبدالعزيز',
    faculty: 'كلية الحاسبات والمعلومات',
    academic_year: '2024/2025',
    seat_number: 'C-303',
    exam_hall: 'معمل 2 - الحاسبات',
    pdf_url: DUMMY_PDF,
    pdf_blob_key: 'seed-30209181234575',
  },

  // --- كلية التجارة ---
  {
    national_id: '29904271234576',
    student_name: 'هنا سامي عبدالله',
    faculty: 'كلية التجارة',
    academic_year: '2024/2025',
    seat_number: 'D-401',
    exam_hall: 'قاعة 1 - التجارة',
    pdf_url: DUMMY_PDF,
    pdf_blob_key: 'seed-29904271234576',
  },
  {
    national_id: '30301091234577',
    student_name: 'زياد فتحي النجار',
    faculty: 'كلية التجارة',
    academic_year: '2024/2025',
    seat_number: 'D-402',
    exam_hall: 'قاعة 1 - التجارة',
    pdf_url: DUMMY_PDF,
    pdf_blob_key: 'seed-30301091234577',
  },

  // --- كلية الآداب ---
  {
    national_id: '29708301234578',
    student_name: 'دينا محمد الشريف',
    faculty: 'كلية الآداب',
    academic_year: '2024/2025',
    seat_number: 'E-501',
    exam_hall: 'قاعة 1 - الآداب',
    pdf_url: DUMMY_PDF,
    pdf_blob_key: 'seed-29708301234578',
  },
  {
    national_id: '30407161234579',
    student_name: 'باسم عادل حلمي',
    faculty: 'كلية الآداب',
    academic_year: '2024/2025',
    seat_number: 'E-502',
    exam_hall: 'قاعة 1 - الآداب',
    pdf_url: DUMMY_PDF,
    pdf_blob_key: 'seed-30407161234579',
  },

  // --- كلية العلوم ---
  {
    national_id: '30506121234580',
    student_name: 'لمياء إبراهيم القاضي',
    faculty: 'كلية العلوم',
    academic_year: '2024/2025',
    seat_number: 'F-601',
    exam_hall: 'معمل 1 - العلوم',
    pdf_url: DUMMY_PDF,
    pdf_blob_key: 'seed-30506121234580',
  },
  {
    national_id: '29602251234581',
    student_name: 'عبدالرحمن سعد الغامدي',
    faculty: 'كلية العلوم',
    academic_year: '2024/2025',
    seat_number: 'F-602',
    exam_hall: 'معمل 1 - العلوم',
    pdf_url: DUMMY_PDF,
    pdf_blob_key: 'seed-29602251234581',
  },
];

async function seed() {
  console.log(`\n🌱 Starting seed — ${students.length} students\n`);

  // Make sure the columns exist (seat_number, exam_hall)
  await sql`
    ALTER TABLE students
    ADD COLUMN IF NOT EXISTS seat_number VARCHAR(20),
    ADD COLUMN IF NOT EXISTS exam_hall   VARCHAR(255)
  `;

  let inserted = 0;
  let skipped = 0;

  for (const s of students) {
    try {
      const result = await sql`
        INSERT INTO students (
          national_id, student_name, faculty, academic_year,
          seat_number, exam_hall, pdf_url, pdf_blob_key
        )
        VALUES (
          ${s.national_id}, ${s.student_name}, ${s.faculty}, ${s.academic_year},
          ${s.seat_number}, ${s.exam_hall}, ${s.pdf_url}, ${s.pdf_blob_key}
        )
        ON CONFLICT (national_id) DO UPDATE SET
          student_name  = EXCLUDED.student_name,
          faculty       = EXCLUDED.faculty,
          seat_number   = EXCLUDED.seat_number,
          exam_hall     = EXCLUDED.exam_hall,
          pdf_url       = EXCLUDED.pdf_url,
          updated_at    = NOW()
        RETURNING national_id
      `;
      if (result.length > 0) {
        console.log(`✅ ${s.student_name} (${s.national_id})`);
        inserted++;
      }
    } catch (err) {
      console.error(`❌ Failed: ${s.national_id}`, err);
      skipped++;
    }
  }

  console.log(`\n📊 Done: ${inserted} inserted/updated, ${skipped} failed\n`);

  // Verify your test card exists
  const check = await sql`
    SELECT national_id, student_name, seat_number, exam_hall
    FROM students WHERE national_id = '29503010200394'
  `;
  if (check.length > 0) {
    console.log('🎯 Test card verified:');
    console.table(check);
  } else {
    console.error('❌ Test card 29503010200394 NOT found — something went wrong!');
  }

  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
