
'use client'

import TopNav from '@/components/layout/top-nav';
import Sidebar from '@/components/layout/sidebar';

export default function StreamsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <div className="flex-1">
        <TopNav />
        <div className="container mx-auto flex">
          <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </main>
          <Sidebar />
        </div>
      </div>
    </div>
  );
}
