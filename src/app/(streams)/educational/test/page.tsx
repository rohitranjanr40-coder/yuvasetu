

'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Maximize,
  Minimize,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Send,
  Camera,
  Edit,
  FileUp,
  Loader2,
  Trash2,
  Save,
  RefreshCcw,
  ClipboardPlus,
  Crop,
  PlusCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { scanQuestions } from '@/ai/flows/scan-question-flow';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
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
import type { Question, TestDraft, TestInstructions } from '@/types';
import { useAuth } from '@/hooks/use-auth';
import { publishTest, getTestDraftById, saveTestDraft } from '@/lib/actions';

type QuestionStatus = 'answered' | 'not-answered' | 'marked' | 'not-visited';


const defaultInstructions: TestInstructions = {
    durationInMinutes: 180,
    marksPerQuestion: 4,
    negativeMarks: 1,
    permittedItems: "You are only allowed to bring a transparent water bottle and a simple pen/pencil. No other items are permitted inside the examination hall.",
    prohibitedItems: "Mobile phones, pagers, laptops, calculators, smart watches, and any other electronic communication devices are strictly prohibited.",
    generalInstructions: [
        "The clock will be set at the server. The countdown timer at the top right corner of screen will display the remaining time available for you to complete the examination.",
        "The Question Palette displayed on the right side of screen will show the status of each question.",
        "You are not allowed to use any electronic devices like mobile phone, calculator etc. during the exam.",
        "Only one question will be displayed on the screen at a time.",
        "You can navigate between questions byclicking on the question number in the Question Palette."
    ],
    declaration: "I have read and understood all the instructions. I agree that in case of any dispute, the conducting body will be final. I understand that my test will be monitored and any malpractice will lead to disqualification."
};


function CameraDialog({ open, onOpenChange, onCapture, onCancel }: { open: boolean, onOpenChange: (open: boolean) => void, onCapture: (dataUri: string) => void, onCancel: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [cameraFacingMode, setCameraFacingMode] = useState<'user' | 'environment'>('environment');
  const [aspectRatio, setAspectRatio] = useState<'portrait' | 'landscape'>('portrait');
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const { toast } = useToast();
  
  const stopCameraStream = useCallback(() => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  const getCameraPermission = useCallback(async () => {
    if (typeof window !== 'undefined' && navigator.mediaDevices) {
      stopCameraStream(); // Stop any existing stream
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter(device => device.kind === 'videoinput');
        setVideoDevices(videoInputs);

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: cameraFacingMode }
        });
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
          description: 'Please enable camera permissions in your browser settings.',
        });
        onOpenChange(false);
      }
    }
  }, [cameraFacingMode, toast, onOpenChange, stopCameraStream]);

  useEffect(() => {
    if (open) {
      getCameraPermission();
    }
    
    return () => {
      stopCameraStream();
    };
  }, [open, getCameraPermission, stopCameraStream]);

  const handleCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUri = canvas.toDataURL('image/jpeg');
        onCapture(dataUri);
      }
    }
  };

  const switchCamera = () => {
    setCameraFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onCancel(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Scan with Camera</DialogTitle>
          <DialogDescription>
            Position the document in the frame and click capture.
          </DialogDescription>
        </DialogHeader>
        <div className="my-4">
          <video 
            ref={videoRef} 
            className={cn(
                "w-full rounded-md bg-black object-cover",
                aspectRatio === 'portrait' ? 'aspect-[9/16]' : 'aspect-video'
            )} 
            autoPlay 
            muted 
            playsInline 
          />
          {hasCameraPermission === false && (
            <Alert variant="destructive" className="mt-2">
              <AlertTitle>Camera Access Required</AlertTitle>
              <AlertDescription>
                Please allow camera access to use this feature.
              </AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter className="flex-col sm:flex-row sm:justify-between">
            <div className="flex gap-2">
              {videoDevices.length > 1 && (
                  <Button variant="outline" size="icon" onClick={switchCamera} aria-label="Switch Camera">
                      <RefreshCcw className="h-5 w-5" />
                  </Button>
              )}
               <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setAspectRatio(prev => prev === 'portrait' ? 'landscape' : 'portrait')} 
                    aria-label={`Switch to ${aspectRatio === 'portrait' ? 'landscape' : 'portrait'} mode`}
                >
                    <Crop className="h-5 w-5" />
                </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={onCancel}>Cancel</Button>
              <Button onClick={handleCapture} disabled={!hasCameraPermission}>
                  <Camera className="mr-2 h-4 w-4" />
                  Capture Photo
              </Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


function GoTestPageContent() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showAddQuestionForm, setShowAddQuestionForm] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | undefined>(undefined);
  const [testSubject, setTestSubject] = useState('');
  const [draft, setDraft] = useState<TestDraft | null>(null);
  const [isCameraDialogOpen, setIsCameraDialogOpen] = useState(false);
  const { user: loggedInUser } = useAuth();
  const [isSaving, setIsSaving] = useState(false);


  // Form input states
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('option-a');
  const [solutionFile, setSolutionFile] = useState<string | undefined>(undefined);
  
  const currentQuestion = questions[currentQuestionIndex];
  const draftId = searchParams.get('draftId');
  const numericDraftId = draftId ? parseInt(draftId.replace('test-', ''), 10) : null;
  

  const saveDraft = useCallback(async (id: number | null, subject: string, questionsToSave: Question[], instructions: TestInstructions) => {
    if (!loggedInUser) return null;

    setIsSaving(true);
    try {
        const draftData: Omit<TestDraft, 'id'> = {
            subject: subject || 'Untitled Test',
            questions: questionsToSave,
            createdAt: draft?.createdAt || new Date().toISOString(),
            instructions: instructions,
        };

        const result = await saveTestDraft(loggedInUser.id, draftData, id ?? undefined);
        if (result.success && result.draft) {
             const newDraftId = `test-${result.draft.id}`;
             setDraft({ ...result.draft.draftData as TestDraft, id: newDraftId, createdAt: result.draft.createdAt.toISOString() });
             return newDraftId;
        } else {
            throw new Error(result.error || 'Failed to save draft');
        }
    } catch (error) {
        console.error("Failed to save draft to DB:", error);
        toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not save your draft to the database.'});
        return null;
    } finally {
        setIsSaving(false);
    }
  }, [loggedInUser, draft, toast]);


  useEffect(() => {
    const loadDraftFromDb = async () => {
        if (!numericDraftId || !loggedInUser) {
            setTestSubject('');
            setQuestions([]);
            setDraft(null);
            setShowAddQuestionForm(false);
            return;
        }

        try {
            const draftToLoad = await getTestDraftById(numericDraftId, loggedInUser.id);
            if (draftToLoad) {
                setTestSubject(draftToLoad.subject);
                setQuestions(draftToLoad.questions);
                setDraft(draftToLoad);
                if (draftToLoad.questions.length > 0) {
                    setCurrentQuestionIndex(0);
                    setShowAddQuestionForm(false);
                } else {
                    setShowAddQuestionForm(true); // If draft is empty, show add form
                }
            } else {
                toast({ variant: 'destructive', title: 'Draft Not Found' });
                router.push('/educational/test');
            }
        } catch (error) {
            console.error('Failed to load draft from DB:', error);
            toast({ variant: 'destructive', title: 'Failed to Load Draft' });
        }
    };
    
    if (loggedInUser) {
        loadDraftFromDb();
    }
  }, [draftId, loggedInUser, toast, router]);

  useEffect(() => {
    if (currentQuestion) {
      setQuestionText(currentQuestion.questionText);
      setOptions(currentQuestion.options);
      setCorrectAnswer(currentQuestion.correctAnswer);
      setSolutionFile(currentQuestion.solution);
      setShowAddQuestionForm(false); // Hide add form when viewing/editing
    } else if (questions.length === 0 && draftId) {
      handleAddNewClick(); 
    } else if (!draftId) {
        setShowAddQuestionForm(false); // No draft loaded, show placeholder
    }
  }, [currentQuestion, questions.length, draftId]);

  const handleFullScreenChange = useCallback(() => {
    if (typeof document !== 'undefined') {
        setIsFullScreen(!!document.fullscreenElement);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, [handleFullScreenChange]);
  
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
    if (!draftId) {
        handleCreateNewTest();
        return;
    }
    setShowAddQuestionForm(true);
    setQuestionText('');
    setOptions(['', '', '', '']);
    setCorrectAnswer('option-a');
    setSolutionFile(undefined);
  }

  const navigateToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index);
      setShowAddQuestionForm(false);
    }
  }
  
  const handleNext = () => {
    if (questions.length === 0) return;
    const nextIndex = (currentQuestionIndex + 1);
    if(nextIndex < questions.length){
        navigateToQuestion(nextIndex);
    }
  };

  const handlePrevious = () => {
    if (questions.length === 0) return;
    const prevIndex = (currentQuestionIndex - 1);
     if(prevIndex >= 0){
        navigateToQuestion(prevIndex);
    }
  };
  
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
  
  const handleSaveQuestion = async (newQuestion: Question) => {
    if (!numericDraftId || !draft) return;
    const newQuestions = [...questions, newQuestion];
    setQuestions(newQuestions);
    const newDraftId = await saveDraft(numericDraftId, testSubject, newQuestions, draft.instructions);
    
    setQuestionText('');
    setOptions(['', '', '', '']);
    setCorrectAnswer('option-a');
    setSolutionFile(undefined);
    setShowAddQuestionForm(false);
    
    if(newDraftId && newDraftId !== draftId) {
        router.push(`/educational/test?draftId=${newDraftId}`);
    }
    navigateToQuestion(newQuestions.length - 1);
    toast({
        title: 'Question Saved!',
        description: `Question ${newQuestion.id} has been added to the test.`,
    });
  }

  const onSaveQuestion = () => {
      if (!questionText.trim() || options.some(opt => !opt.trim())) {
      toast({
        variant: 'destructive',
        title: 'Incomplete Information',
        description: 'Please fill out the question and all four options.',
      });
      return;
    }

    const newQuestion: Question = {
      id: (questions[questions.length - 1]?.id || 0) + 1,
      questionText: questionText,
      options: options,
      correctAnswer: correctAnswer,
      solution: solutionFile,
      testId: 0, // Placeholder
    };
    
    handleSaveQuestion(newQuestion);
  }
  
  const handleUpdateQuestion = async () => {
    if (!questionText.trim() || options.some(opt => !opt.trim()) || !numericDraftId || !draft) {
      toast({
        variant: 'destructive',
        title: 'Incomplete Information',
        description: 'Please fill out the question and all four options.',
      });
      return;
    }

    const updatedQuestion = {
      ...questions[currentQuestionIndex],
      questionText: questionText,
      options: options,
      correctAnswer: correctAnswer,
      solution: solutionFile,
    };
    
    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIndex] = updatedQuestion;
    setQuestions(updatedQuestions);
    await saveDraft(numericDraftId, testSubject, updatedQuestions, draft.instructions);

    toast({
      title: 'Question Updated!',
      description: `Question ${currentQuestion.id} has been successfully updated.`,
    });
  }

  const handleDeleteQuestion = async () => {
    if (!numericDraftId || !draft) return;

    const questionIdToDelete = currentQuestion.id;
    const updatedQuestions = questions
      .filter((_, index) => index !== currentQuestionIndex);

    setQuestions(updatedQuestions);
    await saveDraft(numericDraftId, testSubject, updatedQuestions, draft.instructions);

    toast({
      title: 'Question Deleted',
      description: `Question ${questionIdToDelete} has been removed from the test.`,
    });

    if (updatedQuestions.length === 0) {
      handleAddNewClick();
    } else {
      const newIndex = Math.min(currentQuestionIndex, updatedQuestions.length - 1);
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

  const handleCaptureFromCamera = (dataUri: string) => {
    setIsCameraDialogOpen(false);
    setImageToCrop(dataUri);
  };


  const handleScanCroppedImage = async (croppedImageDataUri: string) => {
    if (!numericDraftId || !draft) return;

    setImageToCrop(undefined);
    setIsScanning(true);
    setShowAddQuestionForm(false);
    toast({
      title: 'Scanning Document...',
      description: 'The AI is analyzing your file. This may take a moment.',
    });
    
    try {
        const result = await scanQuestions({ documentDataUri: croppedImageDataUri });
        
        if (result && result.questions && result.questions.length > 0) {
        const newQuestionsToAdd: Question[] = result.questions.map((q, index) => {
            const paddedOptions = (q.options || []).slice(0, 4);
            while (paddedOptions.length < 4) {
            paddedOptions.push('');
            }
            return {
            id: (questions[questions.length - 1]?.id || 0) + 1 + index,
            questionText: q.question,
            options: paddedOptions,
            correctAnswer: 'option-a', // Default correct answer
            testId: 0, // Placeholder
            };
        });

        const allQuestions = [...questions, ...newQuestionsToAdd];
        setQuestions(allQuestions);
        const newDraftId = await saveDraft(numericDraftId, testSubject, allQuestions, draft.instructions);
        
        if(newDraftId && newDraftId !== draftId) {
            router.push(`/educational/test?draftId=${newDraftId}`);
        }
        
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
    } catch (error) {
        console.error("Scanning error:", error);
        toast({
            variant: 'destructive',
            title: 'Scan Error',
            description: 'An unexpected error occurred while scanning the document. Please try again.',
        });
    } finally {
       setIsScanning(false);
    }
  };

  const handlePublishTest = async () => {
    if (!loggedInUser || !draft) {
        toast({ variant: 'destructive', title: 'Cannot publish', description: 'No draft loaded or not logged in.' });
        return;
    }
    
    if (!testSubject.trim() || questions.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Cannot Publish Test',
        description: 'Please provide a subject and add at least one question.',
      });
      return;
    }

    setIsSaving(true);
    try {
        const draftToPublish: TestDraft = { ...draft, subject: testSubject, questions };
        const result = await publishTest(draftToPublish, loggedInUser.id);
        
        if (result.success) {
            toast({
                title: 'Test Published!',
                description: `"${testSubject}" is now available for students.`,
            });
            router.push('/educational/test/live');
        } else {
            throw new Error(result.error);
        }

    } catch (error) {
        console.error("Failed to publish test:", error);
        toast({
            variant: 'destructive',
            title: 'Failed to Publish',
            description: 'Could not save the test to the database.',
        });
    } finally {
        setIsSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!numericDraftId || !draft) return;
    await saveDraft(numericDraftId, testSubject, questions, draft.instructions);
    toast({
      title: 'Draft Saved!',
      description: `Your test "${testSubject || 'Untitled Test'}" has been saved.`,
    });
  };

  const handleCreateNewTest = async () => {
    if (!loggedInUser) return;
    const newDraftData = {
        subject: "Untitled Test",
        questions: [],
        createdAt: new Date().toISOString(),
        instructions: defaultInstructions
    };

    const result = await saveTestDraft(loggedInUser.id, newDraftData);
    if(result.success && result.draft?.id) {
        router.push(`/educational/test?draftId=test-${result.draft.id}`);
        toast({
            title: "New Test Created",
            description: "You can start adding questions to your new draft."
        });
    }
  };


  const getStatusColor = (status: QuestionStatus) => {
    switch (status) {
      case 'answered':
        return 'bg-green-500 text-white hover:bg-green-600';
      case 'not-answered':
        return 'bg-red-500 text-white hover:bg-red-600';
      case 'marked':
        return 'bg-purple-500 text-white hover:bg-purple-600';
      case 'not-visited':
      default:
        return 'bg-muted hover:bg-muted/80';
    }
  };

  const getStatusText = (status: QuestionStatus) => {
    switch(status) {
        case 'answered': return 'Answered';
        case 'not-answered': return 'Not Answered';
        case 'marked': return 'Marked for Review';
        case 'not-visited': return 'Not Visited';
    }
  }
  
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
    
    if (!draftId) {
        return (
             <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8 bg-card rounded-lg border-2 border-dashed">
                <ClipboardPlus className="h-16 w-16 mb-4"/>
                <h2 className="text-xl font-semibold mb-2">Welcome to the Test Creator</h2>
                <p className="max-w-md mb-6">
                    Create a new test or load a draft from the "Test Drafts" tab in the "All Educational Content" section.
                </p>
                <Button onClick={handleCreateNewTest}>
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Create a New Test
                </Button>
            </div>
        )
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
                  <Label htmlFor="solution-file">Upload Solution File (Optional)</Label>
                  <Input id="solution-file" type="file" onChange={handleSolutionFileChange} />
                  {solutionFile && <p className="text-xs text-muted-foreground mt-1">Solution file selected.</p>}
                </div>
                <div className="flex justify-between items-center pt-4">
                    <div>
                        {isEditing && (
                           <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete question {currentQuestion.id}.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={handleDeleteQuestion}>
                                    Delete Question
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </div>
                    <div className="flex gap-2">
                        {isEditing ? (
                            <Button onClick={handleUpdateQuestion} disabled={isSaving}>{isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Update Question</Button>
                        ) : (
                        <>
                            <Button variant="outline" onClick={() => setShowAddQuestionForm(false)}>Cancel</Button>
                            <Button onClick={onSaveQuestion} disabled={isSaving}>{isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Save Question</Button>
                        </>
                        )}
                    </div>
                 </div>
              </CardContent>
            </Card>
        );
    }
    
    // Fallback for when a draft is loaded but has 0 questions
    return (
        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8 bg-card rounded-lg border-2 border-dashed">
            <ClipboardPlus className="h-16 w-16 mb-4"/>
            <h2 className="text-xl font-semibold mb-2">Your test is empty!</h2>
            <p className="max-w-md mb-6">
                Click one of the buttons above to start building your question paper. You can add questions manually or scan them from a file or your camera.
            </p>
        </div>
    );
  }

  return (
    <>
      <CameraDialog 
        open={isCameraDialogOpen}
        onOpenChange={setIsCameraDialogOpen}
        onCapture={handleCaptureFromCamera}
        onCancel={() => setIsCameraDialogOpen(false)}
      />
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
      <div className="flex flex-col h-[calc(100vh-120px)] bg-background">
        {/* Header */}
        <header className="flex items-center justify-between p-2 border-b">
          <div className="flex items-center gap-2">
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="success" disabled={!draftId}>
                    <Send className="mr-2 h-4 w-4" />
                    Publish
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-2 space-y-1">
                    <Button variant="ghost" className="w-full justify-start" onClick={handlePublishTest} disabled={isSaving}>
                        <Send className="mr-2 h-4 w-4" /> Publish Now
                    </Button>
                     <Button variant="ghost" className="w-full justify-start" onClick={handleSaveDraft} disabled={isSaving}>
                        <Save className="mr-2 h-4 w-4" /> Save as Draft
                    </Button>
                </PopoverContent>
            </Popover>
            <span className="text-sm text-muted-foreground">|</span>
             <Button variant="outline" size="sm" onClick={() => setIsCameraDialogOpen(true)} disabled={!draftId}>
                <Camera className="mr-2 h-4 w-4" /> Scan with Camera
            </Button>
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={!draftId}>
                <FileUp className="mr-2 h-4 w-4" /> Scan File
            </Button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            <Button variant="outline" size="sm" onClick={handleAddNewClick}>
                <Edit className="mr-2 h-4 w-4" />
                {draftId ? 'Add' : 'New'}
            </Button>
          </div>
          <div className="flex-1 px-4">
            <Input 
                placeholder="Subject of Test Series" 
                className="w-full text-center font-bold"
                value={testSubject}
                onChange={(e) => setTestSubject(e.target.value)}
                onBlur={handleSaveDraft}
                disabled={!draftId || isSaving}
            />
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={toggleFullScreen} aria-label={isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}>
              {isFullScreen ? <Minimize /> : <Maximize />}
            </Button>
          </div>
        </header>
        
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar */}
          <aside className="w-60 border-r flex flex-col overflow-hidden">
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-4">
                <Card>
                    <CardHeader className='p-3'>
                        <CardTitle className="text-base text-center">Question Palette</CardTitle>
                    </CardHeader>
                    <CardContent className='p-3'>
                        <div className="grid grid-cols-5 gap-2 text-center">
                            {questions.map((question, index) => (
                              <Button
                                  key={question.id}
                                  variant={currentQuestionIndex === index ? "default" : "outline"}
                                  className={"h-8 w-8 p-0"}
                                  onClick={() => navigateToQuestion(index)}
                                  aria-label={`Go to question ${question.id}`}
                              >
                                  {index + 1}
                              </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

              </div>
            </div>
            
            <div className="p-4 border-t space-y-2">
              <Button variant="outline" className="w-full justify-center" asChild disabled={!draftId}>
                <Link href={`/educational/test/instructions-editor?draftId=${draftId}`} target="_blank" rel="noopener noreferrer">
                  <BookOpen className="mr-2"/> Instructions
                </Link>
              </Button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-4 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              {renderMainContent()}
            </div>
          </main>
        </div>
        
        {/* Footer */}
        <footer className="flex items-center justify-between p-2 border-t bg-card">
          <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0 || questions.length <= 1}><ChevronLeft/> Previous</Button>
              <Button variant="outline" onClick={handleNext} disabled={currentQuestionIndex === questions.length - 1 || questions.length <= 1}>Next <ChevronRight/></Button>
          </div>
        </footer>
      </div>
    </>
  );
}


export default function GoTestPage() {
  return (
    <Suspense fallback={
        <div className="flex flex-col items-center justify-center h-screen text-center text-muted-foreground p-8">
            <Loader2 className="h-12 w-12 mb-4 animate-spin"/>
            <h2 className="text-xl font-semibold">Loading Test Creator...</h2>
        </div>
    }>
      <GoTestPageContent />
    </Suspense>
  )
}
