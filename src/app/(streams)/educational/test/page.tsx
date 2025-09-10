
'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Timer,
  PauseCircle,
  PlayCircle,
  Maximize,
  Minimize,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Send,
  Plus,
  Camera,
  Edit,
  ClipboardPlus,
  FileUp,
  Loader2,
  Trash2,
  Clock,
  Save,
} from 'lucide-react';
import { users } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getScannedQuestions } from '@/lib/actions';
import { Dialog, DialogContent } from '@/components/ui/dialog';
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
} from '@/components/ui/alert-dialog';
import { ImageCropper } from '@/components/educational/image-cropper';
import Link from 'next/link';

type QuestionStatus = 'answered' | 'not-answered' | 'marked' | 'not-visited';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  status: QuestionStatus;
  solution?: string; // Can be a URL or data URI
}

interface TestDraft {
  id: string;
  subject: string;
  questions: Question[];
  createdAt: string;
}

function GoTestPageContent() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showAddQuestionForm, setShowAddQuestionForm] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | undefined>(undefined);
  const [testSubject, setTestSubject] = useState('');
  const [draftId, setDraftId] = useState<string | null>(null);


  // Form input states
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('option-a');
  const [solutionFile, setSolutionFile] = useState<string | undefined>(undefined);
  
  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    if (!isClient) return;

    const id = searchParams.get('draftId');
    if (id) {
      try {
        const existingDrafts: TestDraft[] = JSON.parse(localStorage.getItem('testDrafts') || '[]');
        const draftToLoad = existingDrafts.find(d => d.id === id);
        if (draftToLoad) {
          setTestSubject(draftToLoad.subject);
          setQuestions(draftToLoad.questions);
          setDraftId(draftToLoad.id);
          if (draftToLoad.questions.length > 0) {
            setCurrentQuestionIndex(0);
            navigateToQuestion(0);
          }
        }
      } catch (error) {
        console.error('Failed to load draft from localStorage:', error);
        toast({
          variant: 'destructive',
          title: 'Failed to Load Draft',
          description: 'Could not load the test draft from your browser storage.',
        });
      }
    }
    
    const getCameraPermission = async () => {
      if (navigator.mediaDevices) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({video: true});
          setHasCameraPermission(true);

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings to use this feature.',
          });
        }
      } else {
        setHasCameraPermission(false);
        toast({
            variant: 'destructive',
            title: 'Camera Not Supported',
            description: 'Your browser does not support camera access.',
        });
      }
    };

    getCameraPermission();

  }, [searchParams, isClient, toast]);

  useEffect(() => {
    if (!isClient) return;
    // When currentQuestion changes, update the form fields
    if (currentQuestion) {
      setQuestionText(currentQuestion.question);
      setOptions(currentQuestion.options);
      setCorrectAnswer(currentQuestion.correctAnswer);
      setSolutionFile(currentQuestion.solution);
      setShowAddQuestionForm(false); // Hide add form when viewing/editing
    }
  }, [currentQuestion, isClient]);


  const handleFullScreenChange = useCallback(() => {
     if (typeof document !== 'undefined') {
        setIsFullScreen(!!document.fullscreenElement);
    }
  }, []);

  useEffect(() => {
    if (!isClient) return;
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, [handleFullScreenChange, isClient]);

  const toggleFullScreen = () => {
    if (typeof document === 'undefined') return;
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };
  
  const handleAddNewClick = () => {
    setShowAddQuestionForm(true);
    setQuestionText('');
    setOptions(['', '', '', '']);
    setCorrectAnswer('option-a');
    setSolutionFile(undefined);
  }

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
      setShowAddQuestionForm(false);
    }
  }
  
  const handleNext = () => {
    if (questions.length === 0) return;
    const nextIndex = (currentQuestionIndex + 1) % questions.length;
    navigateToQuestion(nextIndex);
  };

  const handlePrevious = () => {
    if (questions.length === 0) return;
    const prevIndex = (currentQuestionIndex - 1 + questions.length) % questions.length;
    navigateToQuestion(prevIndex);
  };
  
  const handleSaveAndNext = (status: QuestionStatus) => {
    handleStatusChange(currentQuestionIndex, status);
    handleNext();
  }

  const handleOptionChange = (index: number, value: string) => {
    const updatedOptions = [...options];
    updatedOptions[index] = value;
    setOptions(updatedOptions);
  };

  const handleSolutionFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        setSolutionFile(reader.result as string);
    };
     reader.onerror = (error) => {
      console.error('Error reading file:', error);
      toast({
        variant: 'destructive',
        title: 'File Read Error',
        description: 'There was an error processing your solution file.',
      });
    };
  }

  const handleSaveQuestion = () => {
    if (!questionText.trim() || options.some(opt => !opt.trim())) {
      toast({
        variant: 'destructive',
        title: 'Incomplete Information',
        description: 'Please fill out the question and all four options.',
      });
      return;
    }

    const newQuestion: Question = {
      id: questions.length + 1,
      question: questionText,
      options: options,
      correctAnswer: correctAnswer,
      status: 'not-visited',
      solution: solutionFile,
    };

    const newQuestions = [...questions, newQuestion];
    if (newQuestions.length === 1) {
        newQuestion.status = 'not-answered';
    }
    setQuestions(newQuestions);

    // Reset form
    setQuestionText('');
    setOptions(['', '', '', '']);
    setCorrectAnswer('option-a');
    setSolutionFile(undefined);
    setShowAddQuestionForm(false);
    navigateToQuestion(newQuestions.length - 1);


    toast({
        title: 'Question Saved!',
        description: `Question ${newQuestion.id} has been added to the test.`,
    });
  };
  
  const handleUpdateQuestion = () => {
    if (!questionText.trim() || options.some(opt => !opt.trim())) {
      toast({
        variant: 'destructive',
        title: 'Incomplete Information',
        description: 'Please fill out the question and all four options.',
      });
      return;
    }

    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIndex] = {
      ...updatedQuestions[currentQuestionIndex],
      question: questionText,
      options: options,
      correctAnswer: correctAnswer,
      solution: solutionFile,
    };
    setQuestions(updatedQuestions);
    
    toast({
      title: 'Question Updated!',
      description: `Question ${currentQuestion.id} has been successfully updated.`,
    });
  }

  const handleDeleteQuestion = () => {
    const questionIdToDelete = currentQuestion.id;
    const updatedQuestions = questions
      .filter((_, index) => index !== currentQuestionIndex)
      .map((q, index) => ({ ...q, id: index + 1 })); // Re-number IDs

    setQuestions(updatedQuestions);

    toast({
      title: 'Question Deleted',
      description: `Question ${questionIdToDelete} has been removed from the test.`,
    });

    if (updatedQuestions.length === 0) {
      setShowAddQuestionForm(false);
      setCurrentQuestionIndex(0);
    } else {
      // Navigate to the previous question or the new last one
      const newIndex = Math.max(0, currentQuestionIndex -1);
      navigateToQuestion(newIndex);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setImageToCrop(reader.result as string);
    };
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      toast({
        variant: 'destructive',
        title: 'File Read Error',
        description: 'There was an error processing your file.',
      });
    };
  };

  const handleCaptureFromCamera = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUri = canvas.toDataURL('image/jpeg');
        setImageToCrop(dataUri);
      } else {
        toast({
            variant: 'destructive',
            title: 'Capture Failed',
            description: 'Could not capture an image from the camera.',
        });
      }
    } else {
        toast({
            variant: 'destructive',
            title: 'Camera Not Ready',
            description: 'The camera is not available or has not been initialized yet.',
        });
    }
  };

  const handleScanCroppedImage = async (croppedImageDataUri: string) => {
    setImageToCrop(undefined);
    setIsScanning(true);
    setShowAddQuestionForm(false);
    toast({
      title: 'Scanning Document...',
      description: 'The AI is analyzing your file. This may take a moment.',
    });
    
    const result = await getScannedQuestions({ documentDataUri: croppedImageDataUri });
    
    setIsScanning(false);
    if (result && result.questions && result.questions.length > 0) {
      const newQuestionsToAdd: Question[] = result.questions.map((q, index) => ({
        id: questions.length + 1 + index,
        question: q.question,
        options: [...q.options, '', '', ''].slice(0, 4), // Pad to 4 options
        correctAnswer: 'option-a', // Default correct answer
        status: questions.length === 0 && index === 0 ? 'not-answered' : 'not-visited',
      }));

      const allQuestions = [...questions, ...newQuestionsToAdd];
      setQuestions(allQuestions);
      if (allQuestions.length > 0) {
        navigateToQuestion(allQuestions.length - 1);
      }

      toast({
        title: 'Scan Complete!',
        description: `Successfully added ${result.questions.length} new question(s).`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Scan Failed',
        description: result?.explanation || 'Could not find any multiple-choice questions in the document.',
      });
    }
  };

  const handlePublishTest = () => {
    if (!isClient) return;
    if (!testSubject.trim() || questions.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Cannot Publish Test',
        description: 'Please provide a subject and add at least one question.',
      });
      return;
    }

    const newTest = {
      id: `test-${Date.now()}`,
      subject: testSubject,
      durationInMinutes: 180, // Hardcoded for now, will be set from instructions page
      questions: questions.map(({ id, question, options, correctAnswer, solution }) => ({
        id,
        question,
        options,
        correctAnswer,
        solution,
      })),
    };

    try {
      const existingTests = JSON.parse(localStorage.getItem('publishedTests') || '[]');
      existingTests.push(newTest);
      localStorage.setItem('publishedTests', JSON.stringify(existingTests));
      
      toast({
        title: 'Test Published!',
        description: `"${testSubject}" is now available for attempters.`,
      });
      
      router.push('/educational/test/live');

    } catch (error) {
      console.error("Failed to save test to localStorage:", error);
      toast({
        variant: 'destructive',
        title: 'Failed to Publish',
        description: 'Could not save the test to your browser storage.',
      });
    }
  };

  const handleSaveAsDraft = () => {
    if (!isClient) return;
    if (!testSubject.trim() && questions.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Cannot Save Empty Draft',
        description: 'Please add a subject or at least one question.',
      });
      return;
    }

    try {
      const existingDrafts: TestDraft[] = JSON.parse(localStorage.getItem('testDrafts') || '[]');
      
      let updatedDrafts;
      if (draftId) {
        // Update existing draft
        updatedDrafts = existingDrafts.map(d => 
          d.id === draftId 
            ? { ...d, subject: testSubject, questions } 
            : d
        );
      } else {
        // Add new draft
        const newDraftId = `draft-${Date.now()}`;
        const newDraft: TestDraft = {
          id: newDraftId,
          subject: testSubject || 'Untitled Test',
          questions,
          createdAt: new Date().toISOString(),
        };
        updatedDrafts = [...existingDrafts, newDraft];
        setDraftId(newDraftId);
      }
      
      localStorage.setItem('testDrafts', JSON.stringify(updatedDrafts));
      
      toast({
        title: 'Draft Saved!',
        description: `Your test "${testSubject || 'Untitled Test'}" has been saved as a draft.`,
      });
      
      router.push('/educational/videos?tab=test-draft');

    } catch (error) {
      console.error("Failed to save draft to localStorage:", error);
      toast({
        variant: 'destructive',
        title: 'Failed to Save Draft',
        description: 'Could not save the test draft to your browser storage.',
      });
    }
  };

  const user = users[0];

  const getStatusColor = (status: QuestionStatus) => {
    switch (status) {
      case 'answered':
        return 'bg-green-500 text-white';
      case 'not-answered':
        return 'bg-red-500 text-white';
      case 'marked':
        return 'bg-purple-500 text-white';
      case 'not-visited':
      default:
        return 'bg-muted';
    }
  };
  
  const renderMainContent = () => {
    if (isScanning) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8 bg-card rounded-lg border-2 border-dashed">
                <Loader2 className="h-16 w-16 mb-4 animate-spin"/>
                <h2 className="text-xl font-semibold mb-2">Analyzing Document...</h2>
                <p className="max-w-md">
                    The AI is scanning your file for questions. This might take a moment.
                </p>
            </div>
        );
    }
    
    const isEditing = !showAddQuestionForm && currentQuestion;

    if (showAddQuestionForm || isEditing) {
        return (
            <Card>
              <CardHeader>
                <CardTitle>{isEditing ? `Editing Question ${currentQuestion.id}` : 'Add a New Question'}</CardTitle>
                <CardDescription>
                  {isEditing ? 'Modify the question details below.' : 'Enter the question, provide four options, and select the correct answer.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="question-text">Question</Label>
                  <Textarea
                    id="question-text"
                    placeholder="Enter the question text here..."
                    rows={4}
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                  />
                </div>
                <div className="space-y-4">
                  <Label>Options</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="option-a" className="text-sm font-normal">Option A</Label>
                      <Input id="option-a" placeholder="Enter option A" value={options[0]} onChange={(e) => handleOptionChange(0, e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="option-b" className="text-sm font-normal">Option B</Label>
                      <Input id="option-b" placeholder="Enter option B" value={options[1]} onChange={(e) => handleOptionChange(1, e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="option-c" className="text-sm font-normal">Option C</Label>
                      <Input id="option-c" placeholder="Enter option C" value={options[2]} onChange={(e) => handleOptionChange(2, e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="option-d" className="text-sm font-normal">Option D</Label>
                      <Input id="option-d" placeholder="Enter option D" value={options[3]} onChange={(e) => handleOptionChange(3, e.target.value)} />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                    <Label>Correct Answer</Label>
                    <RadioGroup value={correctAnswer} onValueChange={setCorrectAnswer} className="flex flex-wrap gap-x-6 gap-y-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="option-a" id="r-option-a" />
                          <Label htmlFor="r-option-a">Option A</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="option-b" id="r-option-b" />
                          <Label htmlFor="r-option-b">Option B</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="option-c" id="r-option-c" />
                          <Label htmlFor="r-option-c">Option C</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="option-d" id="r-option-d" />
                          <Label htmlFor="r-option-d">Option D</Label>
                        </div>
                    </RadioGroup>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="solution-file">Upload Solution File</Label>
                  <Input id="solution-file" type="file" onChange={handleSolutionFileChange} />
                  {solutionFile && <p className="text-xs text-muted-foreground">Solution file selected.</p>}
                </div>
                <div className="flex justify-between items-center">
                    <div>
                        {isEditing && (
                           <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Question
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete question {currentQuestion.id}.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={handleDeleteQuestion}>
                                    Continue
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </div>
                    <div className="flex gap-2">
                        {isEditing ? (
                            <Button onClick={handleUpdateQuestion}>Update Question</Button>
                        ) : (
                        <>
                            <Button variant="outline" onClick={() => setShowAddQuestionForm(false)}>Cancel</Button>
                            <Button onClick={handleSaveQuestion}>Save Question</Button>
                        </>
                        )}
                    </div>
                 </div>
              </CardContent>
            </Card>
        );
    }
    
    return (
        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8 bg-card rounded-lg border-2 border-dashed">
            <ClipboardPlus className="h-16 w-16 mb-4"/>
            <h2 className="text-xl font-semibold mb-2">Create Your Test</h2>
            <p className="max-w-md">
                Click the <span className="font-semibold text-primary">[+ Add]</span> button and select an option to start building your question paper.
            </p>
        </div>
    );
  }

  if (!isClient) {
    return (
        <div className="flex flex-col items-center justify-center h-screen text-center text-muted-foreground p-8">
            <Loader2 className="h-12 w-12 mb-4 animate-spin"/>
            <h2 className="text-xl font-semibold">Loading Test Creator...</h2>
        </div>
    );
  }

  return (
    <>
      <Dialog open={!!imageToCrop} onOpenChange={() => setImageToCrop(undefined)}>
        <DialogContent className="max-w-4xl">
          {imageToCrop && (
            <ImageCropper 
              imageSrc={imageToCrop}
              onCropComplete={handleScanCroppedImage}
              onCancel={() => setImageToCrop(undefined)}
            />
          )}
        </DialogContent>
      </Dialog>
      <div className="flex flex-col h-screen bg-background">
        {/* Header */}
        <header className="flex items-center justify-between p-2 border-b">
          <div className="flex items-center gap-2">
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="success">
                    <Send className="mr-2 h-4 w-4" />
                    Publish Test
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2 space-y-1">
                    <Button variant="ghost" className="w-full justify-start" onClick={handlePublishTest}>
                        <Send className="mr-2 h-4 w-4" /> Publish Now
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                        <Clock className="mr-2 h-4 w-4" /> Schedule
                    </Button>
                     <Button variant="ghost" className="w-full justify-start" onClick={handleSaveAsDraft}>
                        <Save className="mr-2 h-4 w-4" /> Save as Draft
                    </Button>
                </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" /> Add
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2 space-y-2">
                <Button variant="ghost" className="w-full justify-start" onClick={handleCaptureFromCamera}>
                    <Camera className="mr-2 h-4 w-4" /> Scan with Camera
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" onClick={() => fileInputRef.current?.click()}>
                    <FileUp className="mr-2 h-4 w-4" /> Scan File
                  </Button>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                  <Button variant="ghost" className="w-full justify-start" onClick={handleAddNewClick}>
                    <Edit className="mr-2 h-4 w-4" /> Manually
                  </Button>
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex-1 px-4">
            <Input 
                placeholder="Subject of Test Series" 
                className="w-full text-center font-bold"
                value={testSubject}
                onChange={(e) => setTestSubject(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={toggleFullScreen}>
              {isFullScreen ? <Minimize /> : <Maximize />}
              <span className="ml-2">{isFullScreen ? 'Exit Screen' : 'Screen'}</span>
            </Button>
          </div>
        </header>
        
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar */}
          <aside className="w-60 border-r flex flex-col overflow-hidden">
            <div className="p-4 border-b flex justify-center">
              <Button>
                  <Send className="mr-2"/> Submit Test
              </Button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto scroll-left">
              <div className="scroll-left-content">
                <Card>
                    <CardHeader className='p-4'>
                        <CardTitle className="text-base">Question No</CardTitle>
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
                                  {question.id}
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
                <div className="mt-4 space-y-2">
                  <video ref={videoRef} className="w-full aspect-video rounded-md" autoPlay muted />
                  { hasCameraPermission === false && (
                      <Alert variant="destructive">
                                <AlertTitle>Camera Access Required</AlertTitle>
                                <AlertDescription>
                                  Please allow camera access to use this feature.
                                </AlertDescription>
                        </Alert>
                  )
                  }
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t space-y-2">
              <Button variant="outline" className="w-full justify-center" asChild>
                <Link href="/educational/instructions">
                  <BookOpen className="mr-2"/> Instructions
                </Link>
              </Button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-4 overflow-y-auto no-scrollbar">
            <div className="max-w-4xl mx-auto">
              {renderMainContent()}
            </div>
          </main>
        </div>
        
        {/* Footer */}
        <footer className="flex items-center justify-between p-2 border-t bg-card">
          <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handlePrevious}><ChevronLeft/> Previous</Button>
              <Button variant="outline" onClick={handleNext}>Next <ChevronRight/></Button>
          </div>
          <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={() => handleSaveAndNext('marked')}>Mark for Review & Next</Button>
              <Button variant="destructive" onClick={() => handleStatusChange(currentQuestionIndex, 'not-answered')}>Clear Response</Button>
              <Button className="bg-accent hover:bg-accent/90" onClick={() => handleSaveAndNext('answered')}>Save & Next</Button>
          </div>
        </footer>
      </div>
    </>
  );
}


export default function GoTestPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GoTestPageContent />
    </Suspense>
  )
}
