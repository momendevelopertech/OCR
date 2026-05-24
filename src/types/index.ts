export interface ScanResult {
  nationalId: string;
  confidence: number;
  timestamp: Date;
  status: 'found' | 'not_found' | 'invalid';
}

export interface TicketResult {
  nationalId: string;
  pdfUrl: string;
  previewImageUrl: string;
}

export interface SearchHistoryItem {
  nationalId: string;
  timestamp: Date;
  found: boolean;
  method: 'ocr' | 'manual';
}

export interface StudentRecord {
  national_id: string;
  student_name: string;
  faculty: string | null;
  academic_year: string | null;
  seat_number: string | null;
  exam_hall: string | null;
  pdf_url: string;
}

export interface DashboardStats {
  today_scans: number;
  today_found: number;
  today_not_found: number;
}

export interface ScanHistoryRow {
  national_id: string;
  method: 'ocr' | 'manual';
  found: boolean;
  scanned_at: Date;
  student_name: string | null;
}
