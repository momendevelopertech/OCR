import { NextRequest, NextResponse } from 'next/server';
import { egyptianIdSchema } from '@/lib/validations';
import { findStudentByNationalId, logScan } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const nationalId = searchParams.get('nationalId');

    if (!nationalId) {
      return NextResponse.json(
        { error: 'nationalId parameter is required' },
        { status: 400 },
      );
    }

    const parsed = egyptianIdSchema.safeParse(nationalId);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const student = await findStudentByNationalId(parsed.data);

    if (!student) {
      await logScan(parsed.data, 'manual', false);
      return NextResponse.json({ found: false, student: null });
    }

    await logScan(parsed.data, 'manual', true);
    return NextResponse.json({
      found: true,
      student: {
        nationalId: student.national_id,
        studentName: student.student_name,
        faculty: student.faculty,
        academicYear: student.academic_year,
        pdfUrl: student.pdf_url,
      },
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to search for ticket' },
      { status: 500 },
    );
  }
}
