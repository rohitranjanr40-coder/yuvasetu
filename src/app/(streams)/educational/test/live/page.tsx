
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { BookOpen, Clock, FileQuestion, Loader2, MoreHorizontal, Archive } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from '@/hooks/use-toast';
import { getPublishedTests, unpublishTest } from '@/lib/actions';
import type { Test } from '@/types';


export default function LiveTestPage() {
    const [publishedTests, setPublishedTests] = useState<Test[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchTests = async () => {
        setIsLoading(true);
        try {
            const tests = await getPublishedTests();
            setPublishedTests(tests as unknown as Test[]);
        } catch (error) {
            console.error("Failed to load tests from DB", error);
            toast({ variant: 'destructive', title: 'Failed to load tests.' });
        } finally {
            setIsLoading(false);
        }
      }

    useEffect(() => {
      fetchTests();
    }, []);

    const moveToDrafts = async (testToMove: Test) => {
        try {
            const result = await unpublishTest(testToMove.id);
            if(result.success) {
                toast({
                    title: 'Test Moved to Drafts',
                    description: `"${testToMove.subject}" has been unpublished. You can find it in your drafts.`
                });
                fetchTests(); // Refresh the list
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error("Failed to move test to drafts:", error);
            toast({
                variant: 'destructive',
                title: 'Operation Failed',
                description: 'Could not unpublish the test.'
            });
        }
    };


    if (isLoading) {
        return (
             <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8">
                <Loader2 className="h-12 w-12 mb-4 animate-spin"/>
                <h2 className="text-xl font-semibold">Loading Available Tests...</h2>
                <p>Please wait a moment.</p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold tracking-tight font-headline">Available Tests</h1>
                <p className="mt-2 text-lg text-muted-foreground">Choose a test to begin your assessment.</p>
            </div>
            
            {publishedTests.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {publishedTests.map(test => (
                        <Card key={test.id}>
                             <CardHeader className="flex flex-row items-start justify-between">
                                <div>
                                    <CardTitle>{test.subject}</CardTitle>
                                    <CardDescription>A test on {test.subject.toLowerCase()}.</CardDescription>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => moveToDrafts(test)}>
                                        <Archive className="mr-2 h-4 w-4" />
                                        <span>Unpublish</span>
                                    </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <FileQuestion className="mr-2 h-4 w-4" />
                                    <span>{test.questions?.length || 0} Questions</span>
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Clock className="mr-2 h-4 w-4" />
                                    <span>{test.instructions?.durationInMinutes || 'N/A'} Minutes</span>
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <BookOpen className="mr-2 h-4 w-4" />
                                    <span>Calculus, Algebra</span>
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
            ) : (
                <Card className="text-center py-16">
                     <CardHeader>
                        <CardTitle>No Published Tests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">There are currently no tests available to attempt. Please check back later.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
