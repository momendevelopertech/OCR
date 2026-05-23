# OCR Admission Ticket Scanner

A mobile-first web application for scanning Egyptian National ID cards via camera, extracting IDs using client-side OCR, and retrieving matching PDF admission tickets.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS v4 + shadcn/ui
- **OCR:** Tesseract.js (client-side in Web Worker)
- **PDF Preview:** pdfjs-dist (client-side)
- **File Storage:** Vercel Blob
- **Database:** Neon (PostgreSQL)
- **Auth:** NextAuth.js v5 (credentials)
- **Validation:** Zod + React Hook Form
- **Notifications:** Sonner

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy `.env.local.example` to `.env.local` and fill in the values:

```bash
cp .env.local.example .env.local
```

### 3. Database setup

1. Create a free project on [neon.tech](https://neon.tech)
2. Copy the `DATABASE_URL` from Connection Details
3. Run the schema in Neon console:

```sql
CREATE TABLE students (
  id               SERIAL PRIMARY KEY,
  national_id      VARCHAR(14) NOT NULL UNIQUE,
  student_name     VARCHAR(255) NOT NULL,
  faculty          VARCHAR(255),
  academic_year    VARCHAR(50),
  pdf_url          TEXT NOT NULL,
  pdf_blob_key     TEXT NOT NULL,
  uploaded_at      TIMESTAMP DEFAULT NOW(),
  updated_at       TIMESTAMP DEFAULT NOW()
);

CREATE TABLE scan_history (
  id               SERIAL PRIMARY KEY,
  national_id      VARCHAR(14) NOT NULL,
  method           VARCHAR(10) NOT NULL,
  found            BOOLEAN NOT NULL,
  ocr_confidence   FLOAT,
  scanned_at       TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_students_national_id ON students(national_id);
CREATE INDEX idx_scan_history_scanned_at ON scan_history(scanned_at DESC);
```

### 4. Seed mock data (optional)

```bash
npx ts-node scripts/seed.ts
```

### 5. Run the app

```bash
npm run dev
```

Demo credentials: `admin@example.com` / `admin123`

## Project Structure

```
src/
├── app/
│   ├── (auth)/login/         ← Login page
│   ├── (dashboard)/          ← Protected pages
│   │   ├── dashboard/        ← Stats + recent scans
│   │   ├── scanner/          ← Camera + OCR flow
│   │   └── manual-search/    ← Manual ID entry
│   └── api/
│       ├── auth/[...nextauth] ← NextAuth route handler
│       └── tickets/          ← Search + upload + stats APIs
├── components/
│   ├── ui/                   ← shadcn-style components
│   ├── scanner/              ← Camera, OCR, ID preview
│   ├── ticket/               ← PDF preview, download, card
│   └── shared/               ← Navbar, skeleton, error
├── hooks/                    ← useCamera, useOcr, useTicketSearch
├── lib/                      ← auth, db, blob, validations, ocr
├── services/                 ← ticket search service
└── types/                    ← TypeScript types
```

## Deployment

Deploy to Vercel:

1. Push to GitHub
2. Import in Vercel dashboard
3. Add environment variables (DATABASE_URL, BLOB_READ_WRITE_TOKEN, NEXTAUTH_SECRET, NEXTAUTH_URL)
4. Deploy

## Egyptian National ID Format

- Exactly 14 digits
- Starts with 2 (1900s) or 3 (2000s)
- Century + YYMMDD + Governorate + Serial + Checksum
