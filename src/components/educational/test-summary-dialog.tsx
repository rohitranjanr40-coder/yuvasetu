
'use client';

import { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

type QuestionStatus = 'answered' | 'not-answered' | 'marked' | 'not-visited';

interface Question {
  status: QuestionStatus;
}

interface TestSummaryDialogProps {
  isOpen: boolean;
  onClose: (viewSolution: boolean) => void;
  questions: Question[];
}

const feedbackItems = [
  "The questions were relevant to the subject.",
  "The difficulty level of the test was appropriate.",
  "The time allocated for the test was sufficient.",
  "The platform was easy to use.",
  "Overall, I am satisfied with the test experience."
];

export function TestSummaryDialog({ isOpen, onClose, questions }: TestSummaryDialogProps) {
  const summary = useMemo(() => {
    const counts = {
      answered: 0,
      'not-answered': 0,
      marked: 0,
      'not-visited': 0,
    };
    questions.forEach(q => {
      counts[q.status]++;
    });
    return counts;
  }, [questions]);

  const summaryItems = [
    { label: 'Answered', count: summary.answered, color: 'bg-green-500' },
    { label: 'Not Answered', count: summary['not-answered'], color: 'bg-red-500' },
    { label: 'Marked for Review', count: summary.marked, color: 'bg-purple-500' },
    { label: 'Not Visited', count: summary['not-visited'], color: 'bg-muted' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose(false)}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Test Submitted Successfully!</DialogTitle>
          <DialogDescription>
            Here is a summary of your performance. Please provide your valuable feedback.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-6 -mr-6">
            <div className="my-4 space-y-6">
            <Card>
                <CardContent className="p-4">
                <h3 className="font-semibold mb-4 text-center">Your Performance Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    {summaryItems.map(item => (
                    <div key={item.label} className="p-3 rounded-lg border">
                        <div className="flex items-center justify-center gap-2">
                            <div className={cn('w-4 h-4 rounded-sm', item.color)} />
                            <span className="text-sm font-medium">{item.label}</span>
                        </div>
                        <p className="text-2xl font-bold mt-2">{item.count}</p>
                    </div>
                    ))}
                </div>
                </CardContent>
            </Card>

            <Separator />
            
            <Card>
                <CardContent className="p-4">
                    <h3 className="font-semibold mb-4 text-center">Feedback</h3>
                    <div className="space-y-4">
                        {feedbackItems.map((item, index) => (
                            <div key={index} className="p-3 rounded-lg border space-y-3">
                            <Label className="font-normal">{index + 1}. {item}</Label>
                            <RadioGroup defaultValue="3" className="flex justify-around">
                                {[1,2,3,4,5].map(val => (
                                <div key={val} className="flex flex-col items-center space-y-1">
                                    <RadioGroupItem value={String(val)} id={`rating-${index}-${val}`}/>
                                    <Label htmlFor={`rating-${index}-${val}`} className="text-xs">{val}</Label>
                                </div>
                                ))}
                            </RadioGroup>
                            </div>
                        ))}
                        <div className="space-y-2">
                            <Label htmlFor="text-feedback">Additional Comments</Label>
                            <Textarea id="text-feedback" placeholder="Share any other thoughts or suggestions..." />
                        </div>
                    </div>
                </CardContent>
            </Card>
            </div>
        </ScrollArea>

        <DialogFooter className="mt-4 pt-4 border-t sm:justify-between">
           <Button variant="outline" onClick={() => onClose(false)}>Exit to Dashboard</Button>
           <Button onClick={() => onClose(true)}>View Solution</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
