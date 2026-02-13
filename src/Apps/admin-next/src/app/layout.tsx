import type { Metadata } from 'next';
import './globals.css';
import ReduxProvider from '@/providers/ReduxProvider';

export const metadata: Metadata = {
  title: 'ProG Admin Dashboard',
  description: 'Admin dashboard for ProG Coder Shop',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-gray-50 text-gray-900">
        <ReduxProvider>
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}
