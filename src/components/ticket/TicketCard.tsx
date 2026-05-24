'use client';

import PdfPreview from './PdfPreview';
import DownloadButton from './DownloadButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Building2, Calendar, MapPin, User } from 'lucide-react';
import type { StudentRecord } from '@/types';

interface TicketCardProps {
  student: StudentRecord;
}

export default function TicketCard({ student }: TicketCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{student.student_name}</span>
          <Badge variant="secondary">تم العثور</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border p-4 space-y-2">
          <h2 className="text-lg font-bold">{student.student_name}</h2>
          <p className="flex items-center gap-2 text-sm">
            <Building2 className="h-4 w-4 shrink-0" />
            🎓 الكلية: {student.faculty}
          </p>
          <p className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 shrink-0" />
            🪑 رقم الجلوس: {student.seat_number}
          </p>
          <p className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 shrink-0" />
            🏛️ القاعة: {student.exam_hall}
          </p>
          <p className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 shrink-0" />
            📅 العام الدراسي: {student.academic_year}
          </p>
          <p className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 shrink-0" />
            🪪 الرقم القومي: {student.national_id}
          </p>
        </div>

        <PdfPreview pdfUrl={student.pdf_url} />
        <DownloadButton pdfUrl={student.pdf_url} fileName={`ticket-${student.national_id}.pdf`} />
      </CardContent>
    </Card>
  );
}
