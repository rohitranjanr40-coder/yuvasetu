
'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, ArrowRight, Edit, Timer } from "lucide-react";
import Link from 'next/link';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

function InstructionsPageContent() {
  const searchParams = useSearchParams();
  const testId = searchParams.get('testId');

  const [agreed, setAgreed] = useState(false);
  
  const [isEditingPermitted, setIsEditingPermitted] = useState(false);
  const [permittedText, setPermittedText] = useState("You are only allowed to bring a transparent water bottle and a simple pen/pencil. No other items are permitted inside the examination hall.");
  
  const [isEditingProhibited, setIsEditingProhibited] = useState(false);
  const [prohibitedText, setProhibitedText] = useState("Mobile phones, pagers, laptops, calculators, smart watches, and any other electronic communication devices are strictly prohibited.");
  
  const [isEditingMarks, setIsEditingMarks] = useState(false);
  const [correctMarks, setCorrectMarks] = useState("4");
  const [negativeMarks, setNegativeMarks] = useState("1");

  const [isEditingDuration, setIsEditingDuration] = useState(false);
  const [duration, setDuration] = useState("180");

  const [isEditingGeneral, setIsEditingGeneral] = useState(false);
  const [generalInstructions, setGeneralInstructions] = useState([
    "The clock will be set at the server. The countdown timer at the top right corner of screen will display the remaining time available for you to complete the examination.",
    "The Question Palette displayed on the right side of screen will show the status of each question.",
    "You are not allowed to use any electronic devices like mobile phone, calculator etc. during the exam.",
    "Only one question will be displayed on the screen at a time.",
    "You can navigate between questions by clicking on the question number in the Question Palette."
  ]);

  const [isEditingDeclaration, setIsEditingDeclaration] = useState(false);
  const [declarationText, setDeclarationText] = useState("I have read and understood all the instructions. I agree that in case of any dispute, the decision of the conducting body will be final. I understand that my test will be monitored and any malpractice will lead to disqualification.");

  return (
    <div className="max-w-4xl mx-auto space-y-8 my-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight font-headline">Test Instructions</h1>
        <p className="mt-2 text-lg text-muted-foreground">Please read the following instructions carefully before starting the test.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
             <div>
              <CardTitle>Test Duration</CardTitle>
              <CardDescription>Configure the duration for this test.</CardDescription>
            </div>
             {isEditingDuration ? (
                <Button size="sm" onClick={() => setIsEditingDuration(false)}>Save</Button>
            ) : (
                <Button size="sm" variant="ghost" onClick={() => setIsEditingDuration(true)}><Edit className="h-4 w-4 mr-2" />Edit</Button>
            )}
        </CardHeader>
        <CardContent className="space-y-2">
            <Label htmlFor="duration">Duration (in minutes)</Label>
             <div className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-muted-foreground" />
                <Input 
                    id="duration" 
                    type="number" 
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    readOnly={!isEditingDuration}
                    className={cn("w-48", !isEditingDuration && "border-none bg-transparent p-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 h-auto text-base")}
                />
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Marking Scheme</CardTitle>
              <CardDescription>Configure the rules for this test.</CardDescription>
            </div>
            {isEditingMarks ? (
                <Button size="sm" onClick={() => setIsEditingMarks(false)}>Save</Button>
            ) : (
                <Button size="sm" variant="ghost" onClick={() => setIsEditingMarks(true)}><Edit className="h-4 w-4 mr-2" />Edit</Button>
            )}
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="correct-marks">Marks for Correct Answer</Label>
            <Input 
                id="correct-marks" 
                type="number" 
                value={correctMarks}
                onChange={(e) => setCorrectMarks(e.target.value)}
                readOnly={!isEditingMarks}
                className={cn(!isEditingMarks && "border-none bg-transparent p-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 h-auto text-base")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="negative-marks">Negative Marks for Incorrect Answer</Label>
            <Input 
                id="negative-marks" 
                type="number" 
                value={negativeMarks}
                onChange={(e) => setNegativeMarks(e.target.value)}
                readOnly={!isEditingMarks}
                className={cn(!isEditingMarks && "border-none bg-transparent p-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 h-auto text-base")}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>General Instructions</CardTitle>
           {isEditingGeneral ? (
                <Button size="sm" onClick={() => setIsEditingGeneral(false)}>Save</Button>
            ) : (
                <Button size="sm" variant="ghost" onClick={() => setIsEditingGeneral(true)}><Edit className="h-4 w-4 mr-2" />Edit</Button>
            )}
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
            {isEditingGeneral ? (
                 <Textarea 
                    value={generalInstructions.join('\n')}
                    onChange={(e) => setGeneralInstructions(e.target.value.split('\n'))}
                    className="h-48"
                />
            ) : (
                <ul className="list-disc list-inside space-y-2">
                    {generalInstructions.map((inst, index) => (
                        <li key={index}>{inst}</li>
                    ))}
                </ul>
            )}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-4">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-1"/>
                <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-blue-800">Permitted Items:</h4>
                        {isEditingPermitted ? (
                            <Button size="sm" onClick={() => setIsEditingPermitted(false)}>Save</Button>
                        ) : (
                            <Button size="sm" variant="ghost" onClick={() => setIsEditingPermitted(true)}><Edit className="h-4 w-4 mr-2" />Edit</Button>
                        )}
                    </div>
                    {isEditingPermitted ? (
                        <Textarea 
                            value={permittedText} 
                            onChange={(e) => setPermittedText(e.target.value)}
                            className="bg-white text-blue-900"
                        />
                    ) : (
                        <p className="text-blue-700">{permittedText}</p>
                    )}
                </div>
            </div>
             <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-4">
                <AlertCircle className="h-5 w-5 text-red-600 mt-1"/>
                 <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold text-red-800">Prohibited Items:</h4>
                       {isEditingProhibited ? (
                            <Button size="sm" onClick={() => setIsEditingProhibited(false)}>Save</Button>
                        ) : (
                            <Button size="sm" variant="ghost" onClick={() => setIsEditingProhibited(true)}><Edit className="h-4 w-4 mr-2" />Edit</Button>
                        )}
                    </div>
                    {isEditingProhibited ? (
                        <Textarea 
                            value={prohibitedText} 
                            onChange={(e) => setProhibitedText(e.target.value)}
                            className="bg-white text-red-900"
                        />
                    ) : (
                        <p className="text-red-700">{prohibitedText}</p>
                    )}
                </div>
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Language & Declaration</CardTitle>
            {isEditingDeclaration ? (
                <Button size="sm" onClick={() => setIsEditingDeclaration(false)}>Save</Button>
            ) : (
                <Button size="sm" variant="ghost" onClick={() => setIsEditingDeclaration(true)}><Edit className="h-4 w-4 mr-2" />Edit</Button>
            )}
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
            
            <div className="space-y-4 p-4 border rounded-md bg-muted/50">
                {isEditingDeclaration ? (
                    <Textarea 
                        value={declarationText} 
                        onChange={(e) => setDeclarationText(e.target.value)}
                        className="bg-white h-24"
                    />
                ) : (
                     <div className="flex items-start space-x-3">
                        <Checkbox id="declaration" checked={agreed} onCheckedChange={(checked) => setAgreed(checked as boolean)} />
                        <Label htmlFor="declaration" className="font-normal text-sm">
                           {declarationText}
                        </Label>
                    </div>
                )}
                 {!isEditingDeclaration && (
                    <div className="flex items-start space-x-3 mt-4">
                        <Checkbox id="declaration-check" checked={agreed} onCheckedChange={(checked) => setAgreed(checked as boolean)} />
                        <Label htmlFor="declaration-check" className="font-normal text-sm">
                           I have read and understood all the instructions.
                        </Label>
                    </div>
                )}
            </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button size="lg" disabled={!agreed || !testId} asChild>
          <Link href={`/educational/test/session/${testId}`}>
            Proceed to Test <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </div>

    </div>
  );
}

export default function InstructionsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <InstructionsPageContent />
        </Suspense>
    )
}
