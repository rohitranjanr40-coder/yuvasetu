
'use client';

import React, { Suspense } from 'react';
import TopNav from './top-nav';
import Sidebar from './sidebar';
import { Loader2 } from 'lucide-react';

export default function MainStreamLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col h-full">
        <Suspense fallback={<div className="flex h-14 items-center justify-center bg-background"><Loader2 className="h-5 w-5 animate-spin" /></div>}>
          <TopNav />
        </Suspense>
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
        <Sidebar />
      </div>
    </div>
  );
}
