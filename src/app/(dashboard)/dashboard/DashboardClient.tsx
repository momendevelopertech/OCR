'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Scan, Search, QrCode, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CardSkeleton, TableSkeleton } from '@/components/shared/LoadingSkeleton';
import ErrorMessage from '@/components/shared/ErrorMessage';
import type { DashboardStats, ScanHistoryRow } from '@/types';

export default function DashboardClient() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentScans, setRecentScans] = useState<ScanHistoryRow[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingScans, setIsLoadingScans] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/tickets/stats');

        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
          setRecentScans(data.scans || []);
        }
      } catch {
        setError('Failed to load dashboard data');
      } finally {
        setIsLoadingStats(false);
        setIsLoadingScans(false);
      }
    }
    fetchData();
  }, []);

  if (error) {
    return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Today&apos;s scan overview
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {isLoadingStats ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
                <QrCode className="h-4 w-4 text-neutral-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.today_scans ?? 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Found</CardTitle>
                <Users className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats?.today_found ?? 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Not Found</CardTitle>
                <Scan className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {stats?.today_not_found ?? 0}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="flex gap-3">
        <Link href="/scanner" className="flex-1">
          <Button className="w-full" size="lg">
            <Scan className="mr-2 h-5 w-5" />
            Scan ID
          </Button>
        </Link>
        <Link href="/manual-search" className="flex-1">
          <Button variant="outline" className="w-full" size="lg">
            <Search className="mr-2 h-5 w-5" />
            Manual Search
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Scans</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingScans ? (
            <TableSkeleton rows={5} />
          ) : recentScans.length === 0 ? (
            <p className="py-8 text-center text-sm text-neutral-500">
              No scans yet. Start by scanning a National ID.
            </p>
          ) : (
            <div className="space-y-3">
              {recentScans.map((scan, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-neutral-100 p-3 text-sm dark:border-neutral-800"
                >
                  <div>
                    <p className="font-mono font-medium">{scan.national_id}</p>
                    <p className="text-xs text-neutral-500">
                      {scan.student_name ?? 'Unknown'} &middot;{' '}
                      {new Date(scan.scanned_at).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                      scan.found
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                    }`}
                  >
                    {scan.found ? 'Found' : 'Not Found'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
