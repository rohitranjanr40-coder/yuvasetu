
'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import type { Video } from "@/types";
import { useAuth } from "@/hooks/use-auth";
import { Separator } from "../ui/separator";
import { Switch } from "../ui/switch";

interface StreamSchedulerProps {
  defaultCategory?: 'Education' | 'Entertainment' | 'News' | 'Music' | string;
}

export function StreamScheduler({ defaultCategory = 'Entertainment' }: StreamSchedulerProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const { user: loggedInUser } = useAuth();
  
  const [enableAiSwitching, setEnableAiSwitching] = useState(false);
  const [enableAutoZoom, setEnableAutoZoom] = useState(true);
  const [enableSoundOverlays, setEnableSoundOverlays] = useState(false);


  const handleCreateStream = () => {
    if (!loggedInUser) {
        toast({
            variant: 'destructive',
            title: "Not Logged In",
            description: "Please log in to create a live stream.",
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

    const newLiveStream: Video = {
        id: Date.now(), // Using timestamp for a unique ID
        title: title,
        description: description,
        thumbnailUrl: `https://picsum.photos/seed/live${Date.now()}/600/400`,
        channelName: loggedInUser.name,
        views: 1, 
        duration: '00:00',
        category: defaultCategory.charAt(0).toUpperCase() + defaultCategory.slice(1),
        live: true,
        createdAt: new Date().toISOString(),
        userId: loggedInUser.id,
        videoUrl: '/videos/placeholder.mp4' // Placeholder
    };

    try {
        const existingVideosData = localStorage.getItem('userUploadedVideos') || '[]';
        const existingVideos: Video[] = JSON.parse(existingVideosData);
        const updatedVideos = [newLiveStream, ...existingVideos];
        localStorage.setItem('userUploadedVideos', JSON.stringify(updatedVideos));

        toast({
          title: "Starting Live Stream...",
          description: "You will be redirected to your live session shortly.",
        });
        
        router.push(`/live/${newLiveStream.id}`);

    } catch (error) {
        console.error("Failed to save live stream to localStorage", error);
        toast({
            variant: "destructive",
            title: "Failed to Start Stream",
            description: "Could not create the live stream session.",
        });
    }
  };

  return (
    <div className="space-y-6">
        <CardHeader className="p-0">
            <CardTitle>Create a New Live Stream</CardTitle>
            <CardDescription>Fill in the details to start a new live session for your audience.</CardDescription>
        </CardHeader>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="stream-title">Stream Title</Label>
          <Input id="stream-title" placeholder="e.g., My Awesome Live Stream" value={title} onChange={(e) => setTitle(e.target.value)}/>
        </div>
        <div className="space-y-2">
          <Label htmlFor="stream-description">Description</Label>
          <Textarea id="stream-description" placeholder="Briefly describe what the stream will be about." value={description} onChange={(e) => setDescription(e.target.value)} />
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
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={handleCreateStream} disabled={!loggedInUser}>Go Live Now</Button>
      </div>
    </div>
  );
}
