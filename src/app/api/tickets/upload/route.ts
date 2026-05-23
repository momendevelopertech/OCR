import { NextRequest, NextResponse } from 'next/server';
import { uploadTicketSchema } from '@/lib/validations';
import { uploadPdf } from '@/lib/blob';
import { insertStudent } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const nationalId = formData.get('nationalId') as string | null;
    const studentName = formData.get('studentName') as string | null;
    const faculty = formData.get('faculty') as string | null;
    const academicYear = formData.get('academicYear') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'PDF file is required' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 });
    }

    const parsed = uploadTicketSchema.safeParse({
      nationalId,
      studentName,
      faculty: faculty ?? undefined,
      academicYear: academicYear ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { url, key } = await uploadPdf(file, parsed.data.nationalId);

    await insertStudent(
      parsed.data.nationalId,
      parsed.data.studentName,
      url,
      key,
      parsed.data.faculty,
      parsed.data.academicYear,
    );

    return NextResponse.json({
      success: true,
      nationalId: parsed.data.nationalId,
      studentName: parsed.data.studentName,
      pdfUrl: url,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload ticket' },
      { status: 500 },
    );
  }
}
