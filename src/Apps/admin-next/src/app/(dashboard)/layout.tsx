import Sidebar from '@/shared/components/layout/Sidebar';
import AuthGuard from '@/shared/components/auth/AuthGuard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 bg-gray-50">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
