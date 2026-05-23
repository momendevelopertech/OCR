import { NextResponse } from 'next/server';
import { getDashboardStats, getRecentScans } from '@/lib/db';

export async function GET() {
  try {
    const [stats, scans] = await Promise.all([
      getDashboardStats(),
      getRecentScans(10),
    ]);

    return NextResponse.json({ stats, scans });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: 'Failed to load dashboard data' },
      { status: 500 },
    );
  }
}
