
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, HelpCircle, FileText } from "lucide-react";
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface QuestionResult {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  userAnswer?: string;
  solution?: string; // data URI for the solution file
}

interface TestReport {
  id: string;
  subject: string;
  questions: QuestionResult[];
  submittedAt: string;
}

function ResultPageContent() {
  const searchParams = useSearchParams();
  const reportId = searchParams.get('reportId');
  const [report, setReport] = useState<TestReport | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    if (isClient && reportId) {
      try {
        const reports: TestReport[] = JSON.parse(localStorage.getItem('testReports') || '[]');
        const foundReport = reports.find(r => r.id === reportId);
        setReport(foundReport || null);
      } catch (error) {
        console.error("Failed to load test report from localStorage:", error);
      }
    }
  }, [isClient, reportId]);

  const getOptionStyle = (option: string, question: QuestionResult) => {
    const isCorrect = option === question.correctAnswer;
    const isUserChoice = option === question.userAnswer;

    if (isCorrect) return 'border-green-500 bg-green-100 dark:bg-green-900/50';
    if (isUserChoice && !isCorrect) return 'border-red-500 bg-red-100 dark:bg-red-900/50';
    return 'border-border';
  };

  const getResultIcon = (question: QuestionResult) => {
    if (!question.userAnswer) {
      return <HelpCircle className="h-5 w-5 text-yellow-500" />;
    }
    if (question.userAnswer === question.correctAnswer) {
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    }
    return <XCircle className="h-5 w-5 text-red-500" />;
  }

  if (!isClient) {
    return <p>Loading...</p>;
  }

  if (!report) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold">Test Report Not Found</h1>
        <p className="text-muted-foreground mt-2">
          The report you are looking for does not exist or could not be loaded.
        </p>
      </div>
    );
  }
  
  const score = report.questions.filter(q => q.userAnswer === q.correctAnswer).length;
  const total = report.questions.length;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight font-headline">Test Result: {report.subject}</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Submitted on: {new Date(report.submittedAt).toLocaleString()}
        </p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
            <CardDescription>You scored {score} out of {total}.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="p-4">
                    <CardTitle className="text-base">Correct Answers</CardTitle>
                    <p className="text-2xl font-bold text-green-600">{score}</p>
                </Card>
                 <Card className="p-4">
                    <CardTitle className="text-base">Incorrect Answers</CardTitle>
                    <p className="text-2xl font-bold text-red-600">{total - score}</p>
                </Card>
                 <Card className="p-4">
                    <CardTitle className="text-base">Accuracy</CardTitle>
                    <p className="text-2xl font-bold text-primary">{((score / total) * 100).toFixed(2)}%</p>
                </Card>
            </div>
        </CardContent>
      </Card>
      
      <div>
        <h2 className="text-2xl font-bold mb-4 font-headline">Solution Review</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {report.questions.map((q, index) => (
            <Card key={q.id}>
              <CardHeader className="flex flex-row justify-between items-start">
                  <div>
                    <CardDescription>Question {index + 1}</CardDescription>
                    <CardTitle className="text-lg">{q.question}</CardTitle>
                  </div>
                  {getResultIcon(q)}
              </CardHeader>
              <CardContent className="space-y-3">
                {q.options.map((option, optIndex) => (
                  <div
                    key={optIndex}
                    className={cn(
                      "p-3 border rounded-md text-sm",
                      getOptionStyle(option, q)
                    )}
                  >
                    {option}
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                 <Button asChild variant="outline" disabled={!q.solution}>
                    <Link href={q.solution || '#'} target="_blank" download={`solution-q${q.id}.pdf`}>
                      <FileText className="mr-2 h-4 w-4"/>
                      View Solution
                    </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

    </div>
  );
}


export default function ResultPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResultPageContent />
        </Suspense>
    )
}
