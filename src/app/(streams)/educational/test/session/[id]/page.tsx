
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Timer, ChevronLeft, ChevronRight } from "lucide-react";
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

type QuestionStatus = 'answered' | 'not-answered' | 'marked' | 'not-visited';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  status: QuestionStatus;
  userAnswer?: string;
  solution?: string;
}

interface Test {
  id: string;
  subject: string;
  durationInMinutes: number;
  questions: Omit<Question, 'status' | 'userAnswer'>[];
}

export default function TestSessionPage() {
  const params = useParams();
  const testId = params.id as string;
  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSubmitTest = useCallback(() => {
    if (!test || !isClient) return;

    const report = {
      id: `report-${test.id}-${Date.now()}`,
      subject: test.subject,
      questions: questions.map(q => ({
        id: q.id,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        userAnswer: q.userAnswer,
        solution: q.solution,
      })),
      submittedAt: new Date().toISOString(),
    };

    try {
      const existingReports = JSON.parse(localStorage.getItem('testReports') || '[]');
      existingReports.push(report);
      localStorage.setItem('testReports', JSON.stringify(existingReports));
    } catch (error) {
      console.error("Failed to save report to localStorage:", error);
    }
    
    setShowSummary(true);
  }, [test, questions, isClient]);

  useEffect(() => {
    if (isClient) {
      try {
        const tests: Test[] = JSON.parse(localStorage.getItem('publishedTests') || '[]');
        const foundTest = tests.find(t => t.id === testId);
        if (foundTest) {
          setTest(foundTest);
          setTimeRemaining(foundTest.durationInMinutes * 60);
          setQuestions(
            foundTest.questions.map(q => ({
              ...q,
              status: 'not-visited' as QuestionStatus,
            }))
          );
          if (foundTest.questions.length > 0) {
            const initialQuestions = foundTest.questions.map((q, index) => ({
                 ...q,
                 status: index === 0 ? 'not-answered' : ('not-visited' as QuestionStatus),
            }));
            setQuestions(initialQuestions);
          }
        }
      } catch (error) {
        console.error("Failed to parse tests from localStorage", error);
      }
    }
  }, [isClient, testId]);

  useEffect(() => {
    if (!isClient || !test) return;
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
  }, [isClient, test, handleSubmitTest]);
  
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const handleStatusChange = (index: number, status: QuestionStatus) => {
    const newQuestions = [...questions];
    if (newQuestions[index]) {
      newQuestions[index].status = status;
      setQuestions(newQuestions);
    }
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
      // If saving as answered, but no option is selected, treat it as not-answered.
      handleStatusChange(currentQuestionIndex, 'not-answered');
    } else {
      handleStatusChange(currentQuestionIndex, status);
    }
    handleNext();
  };

  const handleOptionSelect = (option: string) => {
    const newQuestions = [...questions];
    if(newQuestions[currentQuestionIndex]) {
        newQuestions[currentQuestionIndex].userAnswer = option;
        // Automatically mark as answered when an option is selected
        newQuestions[currentQuestionIndex].status = 'answered';
        setQuestions(newQuestions);
    }
  }

  const handleClearResponse = () => {
    const newQuestions = [...questions];
    if (newQuestions[currentQuestionIndex]) {
        delete newQuestions[currentQuestionIndex].userAnswer;
        newQuestions[currentQuestionIndex].status = 'not-answered';
        setQuestions(newQuestions);
    }
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
    if (!isClient) return;
    setShowSummary(false);
    if (viewSolution) {
        const reports = JSON.parse(localStorage.getItem('testReports') || '[]');
        const currentReport = reports[reports.length - 1];
        if (currentReport) {
            router.push(`/educational/test/result?reportId=${currentReport.id}`);
        }
    } else {
        router.push('/educational/test/live');
    }
  }


  if (!isClient || !test) {
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
                  <CardTitle>{currentQuestion.question}</CardTitle>
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
