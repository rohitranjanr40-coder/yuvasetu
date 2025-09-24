
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Clock, FileQuestion, Loader2, Search } from "lucide-react";
import { getPublishedTests } from '@/lib/actions';
import type { Test } from '@/types';


function UpcomingPageContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q')?.toLowerCase() || '';

  const [allPublishedTests, setAllPublishedTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
        setLoading(true);
        const testData = await getPublishedTests();
        setAllPublishedTests(testData as unknown as Test[]);
        setLoading(false);
    }
    fetchData();
  }, []);

  const filteredTests = searchQuery
    ? allPublishedTests.filter((t: Test) =>
        t.subject.toLowerCase().includes(searchQuery)
      )
    : allPublishedTests;

  if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight font-headline">Post Hub</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Latest posts and updates from educators.
        </p>
      </div>

       <section>
            <h2 className="text-2xl font-bold tracking-tight mb-4 font-headline">Available Tests</h2>
            {filteredTests.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {filteredTests.map(test => (
                         <Card key={test.id}>
                            <CardHeader>
                                <CardTitle>{test.subject}</CardTitle>
                                <CardDescription>A test on {test.subject.toLowerCase()}.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <FileQuestion className="mr-2 h-4 w-4" />
                                    <span>{test.questions?.length || 0} Questions</span>
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Clock className="mr-2 h-4 w-4" />
                                    <span>{test.instructions?.durationInMinutes || 'N/A'} Minutes</span>
                                </div>
                            </CardContent>
                            <div className="flex justify-end p-4 pt-0">
                                <Button asChild>
                                    <Link href={`/educational/instructions?testId=${test.id}`}>Start Test</Link>
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : searchQuery ? (
                 <div className="text-center py-12">
                    <Search className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="mt-4 text-xl font-semibold">No Tests Found</h3>
                    <p className="mt-1 text-muted-foreground">
                        Your search for "{searchQuery}" did not match any tests.
                    </p>
                </div>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>No Tests Available</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">There are currently no published tests. Check back later!</p>
                    </CardContent>
                </Card>
            )}
            {!searchQuery && (
                <Button variant="outline" className="w-full mt-4" asChild>
                    <Link href="/educational/test/live">View All Tests</Link>
                </Button>
            )}
          </section>
    </div>
  );
}

export default function UpcomingPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        }>
            <UpcomingPageContent />
        </Suspense>
    )
}
