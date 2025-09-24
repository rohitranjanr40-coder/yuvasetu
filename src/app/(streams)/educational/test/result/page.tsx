
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, HelpCircle, FileText, Loader2 } from "lucide-react";
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { getTestSubmissionById } from '@/lib/actions';
import type { TestSubmission, Question as QuestionType } from '@/types';

type QuestionWithAnswer = QuestionType & { userAnswer?: string };

interface PopulatedTestSubmission extends TestSubmission {
    test: {
        subject: string;
        questions: QuestionWithAnswer[];
    }
}

function ResultPageContent() {
  const searchParams = useSearchParams();
  const reportId = searchParams.get('reportId');
  const [report, setReport] = useState<PopulatedTestSubmission | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchReport() {
        if (reportId) {
            setIsLoading(true);
            try {
                const submission = await getTestSubmissionById(parseInt(reportId, 10));
                setReport(submission as PopulatedTestSubmission);
            } catch (error) {
                console.error("Failed to load test report from DB:", error);
            } finally {
                setIsLoading(false);
            }
        } else {
            setIsLoading(false);
        }
    }
    fetchReport();
  }, [reportId]);

  const getOptionStyle = (option: string, question: QuestionWithAnswer) => {
    const isCorrect = option === question.correctAnswer;
    const isUserChoice = option === question.userAnswer;

    if (isCorrect) return 'border-green-500 bg-green-100 dark:bg-green-900/50';
    if (isUserChoice && !isCorrect) return 'border-red-500 bg-red-100 dark:bg-red-900/50';
    return 'border-border';
  };

  const getResultIcon = (question: QuestionWithAnswer) => {
    if (!question.userAnswer) {
      return <HelpCircle className="h-5 w-5 text-yellow-500" />;
    }
    if (question.userAnswer === question.correctAnswer) {
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    }
    return <XCircle className="h-5 w-5 text-red-500" />;
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-96"><Loader2 className="animate-spin h-8 w-8" /></div>;
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
  
  const score = report.score || 0;
  const total = report.test.questions.length;
  const questions = report.test.questions.map(q => {
      const userAnswer = report.answers[q.id.toString()];
      return { ...q, userAnswer };
  });

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight font-headline">Test Result: {report.test.subject}</h1>
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
                    <p className="text-2xl font-bold text-primary">{total > 0 ? ((score / total) * 100).toFixed(2) : 0}%</p>
                </Card>
            </div>
        </CardContent>
      </Card>
      
      <div>
        <h2 className="text-2xl font-bold mb-4 font-headline">Solution Review</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {questions.map((q, index) => (
            <Card key={q.id}>
              <CardHeader className="flex flex-row justify-between items-start">
                  <div>
                    <CardDescription>Question {index + 1}</CardDescription>
                    <CardTitle className="text-lg">{q.questionText}</CardTitle>
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
