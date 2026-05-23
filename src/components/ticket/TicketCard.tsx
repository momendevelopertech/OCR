'use client';

import PdfPreview from './PdfPreview';
import DownloadButton from './DownloadButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Building2, Calendar } from 'lucide-react';
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
          <Badge variant="secondary">Found</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
            <GraduationCap className="h-4 w-4 shrink-0" />
            <span className="font-mono">{student.national_id}</span>
          </div>
          {student.faculty && (
            <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
              <Building2 className="h-4 w-4 shrink-0" />
              <span>{student.faculty}</span>
            </div>
          )}
          {student.academic_year && (
            <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
              <Calendar className="h-4 w-4 shrink-0" />
              <span>{student.academic_year}</span>
            </div>
          )}
        </div>

        <PdfPreview pdfUrl={student.pdf_url} />
        <DownloadButton pdfUrl={student.pdf_url} fileName={`ticket-${student.national_id}.pdf`} />
      </CardContent>
    </Card>
  );
}
