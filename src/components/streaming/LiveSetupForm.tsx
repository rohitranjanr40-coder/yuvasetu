
'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { saveVideo } from "@/lib/actions";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

interface LiveSetupFormProps {
  defaultCategory?: 'Education' | 'Entertainment' | 'News' | 'Music' | 'Farmer' | 'Children' | string;
}

export function LiveSetupForm({ defaultCategory = 'Entertainment' }: LiveSetupFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const { user: loggedInUser, loading: authLoading } = useAuth();
  
  const [enableAiSwitching, setEnableAiSwitching] = useState(false);
  const [enableAutoZoom, setEnableAutoZoom] = useState(true);
  const [enableSoundOverlays, setEnableSoundOverlays] = useState(false);
  const [enableVoicePositioning, setEnableVoicePositioning] = useState(false);
  const [enableColorGrading, setEnableColorGrading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);


  const handleCreateClass = async () => {
    if (!loggedInUser || !loggedInUser.id) {
        toast({
            variant: 'destructive',
            title: "User Not Ready",
            description: "Please wait a moment for your profile to load completely.",
        });
        return;
    }
    if (!title) {
        toast({
            variant: 'destructive',
            title: "Incomplete Information",
            description: "Please fill out the title for the stream.",
        });
        return;
    }
    
    setIsSubmitting(true);
    
    const aiSettings = {
        enableAiSwitching,
        enableAutoZoom,
        enableSoundOverlays,
        enableVoicePositioning,
        enableColorGrading
    };

    const videoData = {
        title,
        description,
        category: defaultCategory,
        userId: loggedInUser.id,
        live: true,
        aiSettings: aiSettings,
    };

    try {
        const result = await saveVideo(videoData);
        
        if (result.success && result.videoId) {
            toast({
              title: "Starting Live Stream...",
              description: "You will be redirected to your live classroom shortly.",
            });
            router.push(`/live/${result.videoId}`);
        } else {
            toast({
              variant: "destructive",
              title: "Failed to Start Stream",
              description: result.error || "An unknown error occurred.",
            });
        }

    } catch (error: any) {
        console.error("Failed to save live stream", error);
        toast({
            variant: "destructive",
            title: "Failed to Start Stream",
            description: error.message || "Could not create the live stream session.",
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  const isButtonDisabled = authLoading || !loggedInUser || !loggedInUser.id || isSubmitting;

  return (
    <Card>
        <CardContent className="p-6">
            <div className="space-y-6">
                <CardHeader className="p-0">
                    <CardTitle>Create a New Live Stream</CardTitle>
                    <CardDescription>Fill in the details to start a new live session.</CardDescription>
                </CardHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="class-title">Stream Title</Label>
                  <Input id="class-title" placeholder="e.g., My Awesome Live Stream" value={title} onChange={(e) => setTitle(e.target.value)}/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="class-description">Description</Label>
                  <Textarea id="class-description" placeholder="Briefly describe what the stream will be about." value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
              </div>

              <Separator />

              <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium">AI Assistant</h3>
                    <p className="text-sm text-muted-foreground">Enhance your stream with AI-powered features.</p>
                </div>
                <div className="space-y-4">
                     <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="ai-switching" className="text-base">Multi-Camera AI Switching</Label>
                            <p className="text-sm text-muted-foreground">
                                Automatically switch between camera angles for dynamic content.
                            </p>
                        </div>
                        <Switch
                            id="ai-switching"
                            checked={enableAiSwitching}
                            onCheckedChange={setEnableAiSwitching}
                        />
                    </div>
                    <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="auto-zoom" className="text-base">Auto Zoom & Framing</Label>
                            <p className="text-sm text-muted-foreground">
                                Keep your subject perfectly framed and in focus, automatically.
                            </p>
                        </div>
                        <Switch
                            id="auto-zoom"
                            checked={enableAutoZoom}
                            onCheckedChange={setEnableAutoZoom}
                        />
                    </div>
                    <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="sound-overlays" className="text-base">Sound Reactive Overlays</Label>
                             <p className="text-sm text-muted-foreground">
                                Trigger visual effects on screen based on your audio.
                            </p>
                        </div>
                        <Switch
                            id="sound-overlays"
                            checked={enableSoundOverlays}
                            onCheckedChange={setEnableSoundOverlays}
                        />
                    </div>
                    <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="voice-positioning" className="text-base">Voice Positioning</Label>
                             <p className="text-sm text-muted-foreground">
                                Create an immersive experience with spatial audio for viewers.
                            </p>
                        </div>
                        <Switch
                            id="voice-positioning"
                            checked={enableVoicePositioning}
                            onCheckedChange={setEnableVoicePositioning}
                        />
                    </div>
                    <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="color-grading" className="text-base">Color Grading Adjustment</Label>
                             <p className="text-sm text-muted-foreground">
                                Subtly change colors and lighting based on the viewer's mood.
                            </p>
                        </div>
                        <Switch
                            id="color-grading"
                            checked={enableColorGrading}
                            onCheckedChange={setEnableColorGrading}
                        />
                    </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleCreateClass} disabled={isButtonDisabled}>
                  {(authLoading || isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Go Live Now
                </Button>
              </div>
            </div>
        </CardContent>
    </Card>
  );
}
