
'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Timer, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { TestSummaryDialog } from '@/components/educational/test-summary-dialog';
import { getTestById, saveTestSubmission } from '@/lib/actions';
import { useAuth } from '@/hooks/use-auth';
import type { Test, Question } from '@/types';
import { useToast } from '@/hooks/use-toast';

type QuestionStatus = 'answered' | 'not-answered' | 'marked' | 'not-visited';
type QuestionWithState = Question & { status: QuestionStatus; userAnswer?: string };

async function getTest(id: number) {
    return await getTestById(id);
}

function TestSessionPageContent({ testId }: { testId: number }) {
  const router = useRouter();
  const { toast } = useToast();
  const { user: loggedInUser, loading: authLoading } = useAuth();
  
  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<QuestionWithState[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showSummary, setShowSummary] = useState(false);
  const [lastSubmissionId, setLastSubmissionId] = useState<number | null>(null);

  const handleSubmitTest = useCallback(async () => {
    if (!test || !loggedInUser) return;

    const userAnswers: { [key: string]: string } = {};
    let score = 0;
    questions.forEach(q => {
        if(q.userAnswer) {
            userAnswers[q.id.toString()] = q.userAnswer;
            if(q.userAnswer === q.options[q.correctAnswer as any]) { // This needs adjustment based on correctAnswer format
                 score += (test.instructions?.marksPerQuestion || 1);
            } else if (test.instructions?.negativeMarks) {
                 score -= test.instructions.negativeMarks;
            }
        }
    });

    const submission = {
        testId: test.id,
        studentId: loggedInUser.id,
        score,
        answers: userAnswers
    };
    
    try {
        const result = await saveTestSubmission(submission);
        if (result.success && result.submissionId) {
            setLastSubmissionId(result.submissionId);
        } else {
            throw new Error(result.error || "Failed to save submission");
        }
    } catch(error) {
        console.error("Failed to save submission", error);
        toast({ variant: 'destructive', title: "Submission Failed", description: "Your test result could not be saved." });
    }
    
    setShowSummary(true);
  }, [test, questions, loggedInUser, toast]);

  useEffect(() => {
    async function fetchTest() {
        if(isNaN(testId)) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        const testData = await getTest(testId);
        if (testData) {
            const initialTest = testData as Test;
            setTest(initialTest);
            setTimeRemaining((initialTest.instructions?.durationInMinutes || 0) * 60);
            if (initialTest.questions?.length) {
                const initialQuestions: QuestionWithState[] = initialTest.questions.map((q, index) => ({
                    ...q,
                    status: index === 0 ? 'not-answered' : 'not-visited',
                }));
                setQuestions(initialQuestions);
            }
        }
        setIsLoading(false);
    }
    fetchTest();
  }, [testId]);

  useEffect(() => {
    if (isLoading || authLoading || showSummary) return;
    const timer = setInterval(() => {
      setTimeRemaining(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          handleSubmitTest();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isLoading, authLoading, showSummary, handleSubmitTest]);
  
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const handleStatusChange = (index: number, status: QuestionStatus) => {
    setQuestions(currentQuestions => {
        const newQuestions = [...currentQuestions];
        if (newQuestions[index]) {
            newQuestions[index].status = status;
        }
        return newQuestions;
    });
  };

  const navigateToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      if (questions[index].status === 'not-visited') {
        handleStatusChange(index, 'not-answered');
      }
      setCurrentQuestionIndex(index);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
        navigateToQuestion(currentQuestionIndex + 1);
    }
  };
  
  const handlePrevious = () => {
     if (currentQuestionIndex > 0) {
        navigateToQuestion(currentQuestionIndex - 1);
    }
  };
  
  const handleSaveAndNext = (status: QuestionStatus) => {
    const hasAnswer = !!questions[currentQuestionIndex]?.userAnswer;
    if (status === 'answered' && !hasAnswer) {
      handleStatusChange(currentQuestionIndex, 'not-answered');
    } else {
      handleStatusChange(currentQuestionIndex, status);
    }
    handleNext();
  };

  const handleOptionSelect = (option: string) => {
    setQuestions(currentQuestions => {
        const newQuestions = [...currentQuestions];
        if(newQuestions[currentQuestionIndex]) {
            newQuestions[currentQuestionIndex].userAnswer = option;
            newQuestions[currentQuestionIndex].status = 'answered';
        }
        return newQuestions;
    });
  }

  const handleClearResponse = () => {
    setQuestions(currentQuestions => {
        const newQuestions = [...currentQuestions];
        if (newQuestions[currentQuestionIndex]) {
            delete newQuestions[currentQuestionIndex].userAnswer;
            newQuestions[currentQuestionIndex].status = 'not-answered';
        }
        return newQuestions;
    });
  };

  const getStatusColor = (status: QuestionStatus) => {
    switch (status) {
      case 'answered': return 'bg-green-500 text-white';
      case 'not-answered': return 'bg-red-500 text-white';
      case 'marked': return 'bg-purple-500 text-white';
      case 'not-visited':
      default: return 'bg-muted';
    }
  };

  const handleExit = (viewSolution: boolean) => {
    setShowSummary(false);
    if (viewSolution && lastSubmissionId) {
        router.push(`/educational/test/result?reportId=${lastSubmissionId}`);
    } else {
        router.push('/educational/test/live');
    }
  }


  if (isLoading || authLoading) {
    return <div className="flex items-center justify-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!loggedInUser) {
    return <div className="flex items-center justify-center h-screen"><p>Please log in to take the test.</p></div>;
  }
  
  if (!test) {
    return <div className="flex items-center justify-center h-screen"><p>Loading Test...</p></div>;
  }
  
  const currentQuestion = questions[currentQuestionIndex];

  return (
    <>
    <TestSummaryDialog 
        isOpen={showSummary}
        onClose={handleExit}
        questions={questions}
    />
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center justify-between p-2 border-b">
        <h1 className="text-xl font-bold font-headline">{test.subject}</h1>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" className="gap-2">
            <Timer className="h-5 w-5" />
            <span className="font-mono text-lg">{formatTime(timeRemaining)}</span>
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-60 border-r flex flex-col overflow-hidden">
             <div className="flex-1 p-4 overflow-y-auto">
                <Card>
                    <CardHeader className='p-4'>
                        <CardTitle className="text-base">Question no</CardTitle>
                    </CardHeader>
                    <CardContent className='p-4'>
                        <div className="grid grid-cols-5 gap-2 text-center">
                            {questions.map((question, index) => (
                              <Button
                                  key={question.id}
                                  variant={currentQuestionIndex === index ? "default" : "outline"}
                                  className={cn("h-7 w-7 p-0", getStatusColor(question.status))}
                                  onClick={() => navigateToQuestion(index)}
                              >
                                  {index + 1}
                              </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className='mt-4'>
                    <CardHeader className='p-4'>
                        <CardTitle className="text-base">Colour Mark</CardTitle>
                    </CardHeader>
                    <CardContent className='p-4 text-xs space-y-2'>
                        <div className='flex items-center gap-2'><div className='w-4 h-4 rounded-sm bg-green-500' /> Answered</div>
                        <div className='flex items-center gap-2'><div className='w-4 h-4 rounded-sm bg-red-500' /> Not Answered</div>
                        <div className='flex items-center gap-2'><div className='w-4 h-4 rounded-sm bg-purple-500' /> Marked for Review</div>
                        <div className='flex items-center gap-2'><div className='w-4 h-4 rounded-sm bg-muted' /> Not Visited</div>
                    </CardContent>
                </Card>
            </div>
             <div className="p-4 border-t">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="w-full">Submit Test</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure you want to submit?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Once you submit, you cannot change your answers. Please review your test before submitting.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleSubmitTest}>
                        Submit
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
            </div>
        </aside>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
            {currentQuestion && (
              <Card>
                <CardHeader>
                  <CardDescription>Question {currentQuestionIndex + 1} of {questions.length}</CardDescription>
                  <CardTitle>{currentQuestion.questionText}</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup 
                    className="space-y-4" 
                    value={currentQuestion.userAnswer}
                    onValueChange={(value) => handleOptionSelect(value)}
                  >
                    {currentQuestion.options.map((option, index) => (
                      <Label key={index} className="flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:bg-muted has-[input:checked]:bg-primary has-[input:checked]:text-primary-foreground has-[input:checked]:border-primary">
                        <RadioGroupItem value={option} />
                        <span>{option}</span>
                      </Label>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
            )}
        </main>
      </div>

       <footer className="flex items-center justify-between p-2 border-t bg-card">
          <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0}><ChevronLeft/> Previous</Button>
              <Button variant="outline" onClick={handleNext} disabled={currentQuestionIndex === questions.length - 1}>Next <ChevronRight/></Button>
          </div>
          <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={() => handleSaveAndNext('marked')}>Mark for Review & Next</Button>
              <Button variant="destructive" onClick={handleClearResponse}>Clear Response</Button>
              <Button className="bg-accent hover:bg-accent/90" onClick={() => handleSaveAndNext('answered')}>Save & Next</Button>
          </div>
        </footer>
    </div>
    </>
  );
}


export default function TestSessionPage({ params }: { params: { id: string } }) {
    const testId = parseInt(params.id, 10);
   
    if (isNaN(testId)) {
        return <div className="flex items-center justify-center h-screen"><p>Invalid Test ID.</p></div>;
    }

    return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <TestSessionPageContent testId={testId} />
        </Suspense>
    )
}
