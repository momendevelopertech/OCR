import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Navbar from '@/components/shared/Navbar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect('/login');

  return (
    <div className="flex flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl flex-1 p-4 sm:p-6">
        {children}
      </main>
    </div>
  );
}
