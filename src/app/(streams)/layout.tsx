

import type { Metadata } from 'next';
import '../globals.css';
import { Toaster } from '@/components/ui/toaster';
import Header from '../_components/header';
import { AuthProvider } from '@/hooks/use-auth';
import { ThemeProvider } from '@/components/layout/theme-provider';
import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export default function StreamsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-background">
        <div className="sticky top-0 z-50">
          <Header />
        </div>
        <div className="container mx-auto flex flex-1 overflow-hidden">
            <main className="flex-1 overflow-y-auto py-6 px-4 sm:px-6 lg:px-8" dir="rtl">
                <div dir="ltr">
                  <Suspense fallback={<div className="flex h-14 items-center justify-center bg-background"><Loader2 className="h-5 w-5 animate-spin" /></div>}>
                    {children}
                  </Suspense>
                </div>
            </main>
        </div>
        <Toaster />
    </div>
  );
}
