'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Scan, Search, LayoutDashboard, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/scanner', label: 'Scanner', icon: Scan },
  { href: '/manual-search', label: 'Manual Search', icon: Search },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-40 border-b border-neutral-200 bg-white/80 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-950/80">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Scan className="h-5 w-5" />
          <span className="hidden sm:inline">OCR Scanner</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  size="sm"
                  className="gap-1.5"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Button>
              </Link>
            );
          })}
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-red-500 hover:text-red-600"
            onClick={() => signOut({ callbackUrl: '/login' })}
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </nav>
  );
}
