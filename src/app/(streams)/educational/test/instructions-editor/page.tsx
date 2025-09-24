

'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2, Save, Plus, Trash2 } from "lucide-react";
import Link from 'next/link';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { TestDraft, TestInstructions } from '@/types';
import { getTestDraftById, saveTestDraft } from '@/lib/actions';
import { useAuth } from '@/hooks/use-auth';


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
        "You can navigate between questions by clicking on the question number in the Question Palette."
    ],
    declaration: "I have read and understood all the instructions. I agree that in case of any dispute, the conducting body will be final. I understand that my test will be monitored and any malpractice will lead to disqualification."
};


function InstructionsEditorPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const draftIdString = searchParams.get('draftId');
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [draft, setDraft] = useState<TestDraft | null>(null);
  const [instructions, setInstructions] = useState<TestInstructions>({} as TestInstructions);

  const numericDraftId = draftIdString ? parseInt(draftIdString.replace('test-', ''), 10) : null;
  
  useEffect(() => {
    async function loadDraft() {
        if (!user || !numericDraftId) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const foundDraft = await getTestDraftById(numericDraftId, user.id);
            if (foundDraft) {
                setDraft(foundDraft);
                 if ('instructions' in foundDraft && foundDraft.instructions !== null && foundDraft.instructions !== undefined) {
                    setInstructions(foundDraft.instructions);
                } else {
                    setInstructions(defaultInstructions);
                }
            } else {
                toast({ variant: 'destructive', title: 'Draft not found' });
            }
        } catch (error) {
            console.error("Failed to load draft from DB:", error);
            toast({ variant: 'destructive', title: 'Failed to load draft' });
        } finally {
            setIsLoading(false);
        }
    }
    
    if (user) {
        loadDraft();
    }
  }, [numericDraftId, user, toast]);

  const handleInstructionChange = (field: keyof TestInstructions, value: any) => {
    setInstructions(prev => ({...prev, [field]: value }));
  }
  
  const handleGeneralInstructionChange = (index: number, value: string) => {
    const newGeneralInstructions = [...(instructions.generalInstructions || [])];
    newGeneralInstructions[index] = value;
    handleInstructionChange('generalInstructions', newGeneralInstructions);
  }

  const addGeneralInstruction = () => {
      const newGeneralInstructions = [...(instructions.generalInstructions || []), ""];
      handleInstructionChange('generalInstructions', newGeneralInstructions);
  }

  const removeGeneralInstruction = (index: number) => {
      const newGeneralInstructions = (instructions.generalInstructions || []).filter((_, i) => i !== index);
      handleInstructionChange('generalInstructions', newGeneralInstructions);
  }


  const handleSave = async () => {
    if (!user || !numericDraftId || !draft) return;

    try {
        const updatedDraftData: Omit<TestDraft, 'id'> = {
            ...draft,
            instructions: instructions
        };

        const result = await saveTestDraft(user.id, updatedDraftData, numericDraftId);

        if (result.success) {
            toast({
                title: "Instructions Saved",
                description: "The test instructions have been updated successfully."
            });
            router.push(`/educational/test?draftId=test-${numericDraftId}`);
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error("Failed to save instructions to database:", error);
        toast({
            variant: "destructive",
            title: "Save Failed",
            description: "Could not save the instructions.",
        });
    }
  };
  
  if (isLoading) {
      return (
        <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )
  }

  if (!draft) {
    return (
        <div className="text-center py-16">
            <h2 className="text-2xl font-semibold">Test Draft Not Found</h2>
            <p className="text-muted-foreground mt-2">Could not find the draft with the provided ID.</p>
            <Button asChild className="mt-4">
                <Link href="/educational/test">Go to Test Creator</Link>
            </Button>
        </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 my-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight font-headline">Edit Instructions: {draft.subject}</h1>
        <p className="mt-2 text-lg text-muted-foreground">Modify the rules and guidelines for your test.</p>
      </div>

      <Card>
        <CardHeader>
             <div>
              <CardTitle>Test Duration (in minutes)</CardTitle>
              <CardDescription>Set the total time students have to complete the test.</CardDescription>
            </div>
        </CardHeader>
        <CardContent>
            <Input 
                id="duration" 
                type="number" 
                value={instructions.durationInMinutes || ''}
                onChange={(e) => handleInstructionChange('durationInMinutes', Number(e.target.value))}
                className="w-48"
            />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <div>
              <CardTitle>Marking Scheme</CardTitle>
              <CardDescription>Define how points are awarded and deducted.</CardDescription>
            </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="correct-marks">Marks for Correct Answer</Label>
            <Input 
                id="correct-marks" 
                type="number" 
                value={instructions.marksPerQuestion || ''}
                onChange={(e) => handleInstructionChange('marksPerQuestion', Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="negative-marks">Negative Marks for Incorrect Answer</Label>
            <Input 
                id="negative-marks" 
                type="number" 
                value={instructions.negativeMarks || ''}
                onChange={(e) => handleInstructionChange('negativeMarks', Number(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>General Instructions</CardTitle>
            <CardDescription>Provide a list of rules and guidelines for the test.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
             <div className="space-y-3">
                {(instructions.generalInstructions || []).map((instruction, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <Input 
                            value={instruction}
                            onChange={(e) => handleGeneralInstructionChange(index, e.target.value)}
                            placeholder={`Instruction #${index + 1}`}
                        />
                        <Button variant="ghost" size="icon" onClick={() => removeGeneralInstruction(index)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                ))}
                <Button variant="outline" size="sm" onClick={addGeneralInstruction}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Instruction
                </Button>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-start gap-4">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-1"/>
                <div className="flex-1 space-y-2">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-300">Permitted Items:</h4>
                    <Textarea 
                        value={instructions.permittedItems || ''} 
                        onChange={(e) => handleInstructionChange('permittedItems', e.target.value)}
                        className="bg-white dark:bg-blue-900/30 text-blue-900 dark:text-blue-200"
                    />
                </div>
            </div>
             <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-4">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-1"/>
                 <div className="flex-1 space-y-2">
                    <h4 className="font-semibold text-red-800 dark:text-red-300">Prohibited Items:</h4>
                    <Textarea 
                        value={instructions.prohibitedItems || ''} 
                        onChange={(e) => handleInstructionChange('prohibitedItems', e.target.value)}
                        className="bg-white dark:bg-red-900/30 text-red-900 dark:text-red-200"
                    />
                </div>
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <div>
              <CardTitle>Declaration Statement</CardTitle>
              <CardDescription>The statement students must agree to before starting the test.</CardDescription>
            </div>
        </CardHeader>
        <CardContent>
            <Textarea 
                value={instructions.declaration || ''} 
                onChange={(e) => handleInstructionChange('declaration', e.target.value)}
                className="bg-white dark:bg-card h-24"
            />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" asChild>
            <Link href={`/educational/test?draftId=test-${numericDraftId}`}>Cancel</Link>
        </Button>
        <Button size="lg" onClick={handleSave}>
            <Save className="mr-2 h-5 w-5" />
            Save Instructions
        </Button>
      </div>
    </div>
  );
}

export default function InstructionsEditorPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        }>
            <InstructionsEditorPageContent />
        </Suspense>
    )
}
