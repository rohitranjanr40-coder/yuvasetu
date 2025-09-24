
'use client';

import { useState, useEffect, Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, ArrowRight, Timer } from "lucide-react";
import Link from 'next/link';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getTestById } from '@/lib/actions';
import type { Test } from '@/types';
import { Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

function ProceedButton({ testId, disabled }: { testId: number, disabled: boolean }) {
    const [agreed, setAgreed] = useState(false);
    
    return (
        <div className="space-y-6">
             <div className="space-y-4 p-4 border rounded-md bg-muted/50">
                 <div className="flex items-start space-x-3">
                    <Checkbox id="declaration-check" checked={agreed} onCheckedChange={(checked) => setAgreed(checked as boolean)} />
                    <Label htmlFor="declaration-check" className="font-normal text-sm">
                       {disabled ? "Loading declaration..." : "I have read and understood all the instructions. I agree that in case of any dispute, the conducting body will be final. I understand that my test will be monitored and any malpractice will lead to disqualification."}
                    </Label>
                </div>
            </div>
            <div className="text-center">
                <Button size="lg" disabled={!agreed} asChild>
                <Link href={`/educational/test/session/${testId}`}>
                    Proceed to Test <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                </Button>
            </div>
        </div>
    );
}


function InstructionsPageContent() {
  const searchParams = useSearchParams();
  const testId = searchParams.get('testId');
  const [test, setTest] = useState<Test | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTest() {
      if (!testId || typeof testId !== 'string') {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      const testData = await getTestById(parseInt(testId, 10)) as unknown as Test;
      setTest(testData);
      setIsLoading(false);
    }
    fetchTest();
  }, [testId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!testId || typeof testId !== 'string') {
     return (
        <div className="text-center py-16">
            <h2 className="text-2xl font-semibold">Invalid Test ID</h2>
            <p className="text-muted-foreground mt-2">The provided test ID is missing or invalid.</p>
            <Button asChild className="mt-4">
                <Link href="/educational/test/live">Go to Tests</Link>
            </Button>
        </div>
     );
  }

  if (!test || !test.instructions) {
    return (
        <div className="text-center py-16">
            <h2 className="text-2xl font-semibold">Test Not Found</h2>
            <p className="text-muted-foreground mt-2">Could not find the test with the provided ID.</p>
            <Button asChild className="mt-4">
                <Link href="/educational/test/live">Go to Tests</Link>
            </Button>
        </div>
    )
  }

  const { instructions } = test;

  return (
    <div className="max-w-4xl mx-auto space-y-8 my-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight font-headline">Test Instructions: {test.subject}</h1>
        <p className="mt-2 text-lg text-muted-foreground">Please read the following instructions carefully before starting the test.</p>
      </div>

      <Card>
        <CardHeader>
             <div>
              <CardTitle>Test Duration</CardTitle>
            </div>
        </CardHeader>
        <CardContent className="space-y-2">
             <div className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-muted-foreground" />
                <p className="text-base">{instructions.durationInMinutes} minutes</p>
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <div>
              <CardTitle>Marking Scheme</CardTitle>
            </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="correct-marks">Marks for Correct Answer</Label>
             <p className="text-base">{instructions.marksPerQuestion}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="negative-marks">Negative Marks for Incorrect Answer</Label>
            <p className="text-base">{instructions.negativeMarks}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>General Instructions</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
            <ul className="list-disc list-inside space-y-2">
                {instructions.generalInstructions.map((inst: string, index: number) => (
                    <li key={index}>{inst}</li>
                ))}
            </ul>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-4">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-1"/>
                <div className="flex-1 space-y-2">
                    <h4 className="font-semibold text-blue-800">Permitted Items:</h4>
                    <p className="text-blue-700">{instructions.permittedItems}</p>
                </div>
            </div>
             <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-4">
                <AlertCircle className="h-5 w-5 text-red-600 mt-1"/>
                 <div className="flex-1 space-y-2">
                    <h4 className="font-semibold text-red-800">Prohibited Items:</h4>
                    <p className="text-red-700">{instructions.prohibitedItems}</p>
                </div>
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <div>
              <CardTitle>Language & Declaration</CardTitle>
            </div>
        </CardHeader>
        <CardContent className="space-y-6">
            <div>
              <Label htmlFor="language-select">Choose your default language:</Label>
              <Select defaultValue="english">
                <SelectTrigger id="language-select" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="hindi">Hindi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <ProceedButton testId={test.id} disabled={!instructions.declaration} />

        </CardContent>
      </Card>
    </div>
  );
}

export default function InstructionsPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        }>
            <InstructionsPageContent />
        </Suspense>
    )
}
