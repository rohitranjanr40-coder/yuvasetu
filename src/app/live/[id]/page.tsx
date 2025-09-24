
'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import { LiveChat } from '@/components/video/live-chat';
import type { Video, User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Share2, Rss, Loader2, AlertTriangle, Camera, RefreshCcw } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/use-auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { getVideoById } from '@/lib/actions';
import { FollowButton } from '@/app/profile/[id]/follow-button';

export default function LiveStreamPage() {
  const params = useParams();
  const { users } = useAuth();
  const { toast } = useToast();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [liveVideo, setLiveVideo] = useState<Video | null>(null);
  const [host, setHost] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [cameraFacingMode, setCameraFacingMode] = useState<'user' | 'environment'>('environment');
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);

  const videoId = parseInt(params.id as string, 10);

  useEffect(() => {
    async function fetchLiveVideo() {
        setLoading(true);
        if (videoId) {
            try {
                const foundVideo = await getVideoById(videoId);
                if (foundVideo && foundVideo.live) {
                    setLiveVideo(foundVideo as Video);
                    const foundHost = users.find(u => u.id === foundVideo.userId);
                    setHost(foundHost || null);
                } else {
                    setLiveVideo(null);
                }
            } catch (error) {
                console.error("Failed to load live stream data from DB", error);
                setLiveVideo(null);
            }
        }
        setLoading(false);
    }
    
    if(users.length > 0) {
        fetchLiveVideo();
    }
  }, [videoId, users]);
  
  const stopCameraStream = useCallback(() => {
    if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    const getCameraPermission = async () => {
      if (typeof window === 'undefined' || !navigator.mediaDevices) {
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Device Not Supported',
          description: 'Live streaming is not supported on this device or browser.',
        });
        return;
      }
      
      stopCameraStream();

      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter(device => device.kind === 'videoinput');
        setVideoDevices(videoInputs);

        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: cameraFacingMode }, 
            audio: true 
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
          description: 'Please enable camera and audio permissions in your browser settings to go live.',
        });
      }
    };

    getCameraPermission();
    
    return () => {
      stopCameraStream();
    };
  }, [toast, cameraFacingMode, stopCameraStream]);
  
  const switchCamera = () => {
    setCameraFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const aiSettings = liveVideo?.aiSettings as any || {};

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-foreground">
        <Loader2 className="h-10 w-10 animate-spin" />
        <p className="ml-4 text-lg">Loading Live Stream...</p>
      </div>
    );
  }

  if (!liveVideo) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-3xl font-bold">Live Stream Not Found</h1>
        <p className="text-muted-foreground mt-2">This live stream may have ended or does not exist.</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col lg:flex-row h-screen max-h-screen bg-background text-foreground overflow-hidden">
        <main className="flex-1 flex flex-col overflow-y-auto no-scrollbar">
            <div className="flex-shrink-0 aspect-video bg-black flex items-center justify-center relative group">
                 <video 
                    ref={videoRef} 
                    className={cn(
                        "w-full h-full object-contain",
                        cameraFacingMode === 'user' && '-scale-x-100',
                        aiSettings.enableAutoZoom && 'animate-zoom-in',
                        aiSettings.enableSoundOverlays && 'animate-pulse-vfx',
                        aiSettings.enableColorGrading && 'sepia'
                    )} 
                    autoPlay 
                    muted 
                    playsInline 
                 />

                {videoDevices.length > 1 && (
                    <Button 
                        onClick={switchCamera}
                        variant="secondary"
                        size="icon"
                        className="absolute top-4 left-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <RefreshCcw className="h-5 w-5"/>
                        <span className="sr-only">Switch Camera</span>
                    </Button>
                )}

            </div>

            {hasCameraPermission === false && (
                <div className="p-4">
                    <Alert variant="destructive">
                        <Camera className="h-4 w-4" />
                        <AlertTitle>Camera Access Required</AlertTitle>
                        <AlertDescription>
                            Please allow camera and audio access in your browser settings to start the live stream.
                        </AlertDescription>
                    </Alert>
                </div>
            )}

            <div className="p-4 md:p-6 space-y-4">
                <h1 className="text-2xl font-bold font-headline">{liveVideo.title}</h1>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {host && (
                        <div className="flex items-center gap-4">
                            <Avatar className="w-14 h-14">
                                <AvatarImage src={host.avatarUrl || ''} alt={host.name} data-ai-hint="channel avatar"/>
                                <AvatarFallback>{host.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold text-lg">{host.name}</p>
                                <p className="text-sm text-muted-foreground">{host.joiners?.toLocaleString()} Joiners</p>
                            </div>
                            <FollowButton profileUser={host} />
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="gap-2">
                            <Share2 />
                            <span>Share</span>
                        </Button>
                    </div>
                </div>

                <Separator />
                
                <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">About this stream</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {liveVideo.description || "No description provided for this live stream."}
                    </p>
                </div>
            </div>
        </main>
        
        <aside className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l flex flex-col flex-shrink-0">
           <LiveChat videoId={liveVideo.id} />
        </aside>
    </div>
  );
}
