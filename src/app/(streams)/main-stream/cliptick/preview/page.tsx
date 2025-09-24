

'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { ClipTickDraft, Short } from '@/types';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Globe, Loader2, Lock, Save, Users } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { contentSuggestionFlow } from '@/ai/flows/content-suggestion';
import { Lightbulb } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { saveVideo } from '@/lib/actions';
import type { UploadBody, UploadData } from '@vercel/blob/client';


type PrivacySetting = 'public' | 'followers' | 'private';

interface AISuggestion {
    title: string;
    outline: string;
}

function ClipTickPreviewAndPublishPageContent() {
    const router = useRouter();
    const { toast } = useToast();
    const { user } = useAuth();
    const videoRef = useRef<HTMLVideoElement>(null);
    
    const [draft, setDraft] = useState<ClipTickDraft | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // Publish states
    const [frames, setFrames] = useState<string[]>([]);
    const [coverFrameIndex, setCoverFrameIndex] = useState(0);
    const [caption, setCaption] = useState('');
    const [privacy, setPrivacy] = useState<PrivacySetting>('public');
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingFrames, setIsLoadingFrames] = useState(true);
    const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);


    const extractFrames = async (videoSrc: string, numFrames: number = 8): Promise<string[]> => {
      return new Promise((resolve) => {
        const video = document.createElement('video');
        video.src = videoSrc;
        video.crossOrigin = "anonymous";
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const extracted: string[] = [];

        video.onloadedmetadata = () => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const duration = video.duration;
          let framesExtracted = 0;

          const seekAndCapture = () => {
            if (framesExtracted >= numFrames || !context) {
              resolve(extracted);
              return;
            }
            
            const time = (duration / (numFrames + 1)) * (framesExtracted + 1);
            video.currentTime = time;
          };

          video.onseeked = () => {
            if (!context) return;
            context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            extracted.push(canvas.toDataURL('image/jpeg'));
            framesExtracted++;
            seekAndCapture();
          };

          seekAndCapture();
        };

        video.onerror = () => {
            console.error("Error loading video for frame extraction.");
            resolve([]); // Resolve with empty array on error
        };
      });
    };

    useEffect(() => {
        try {
            const draftData = localStorage.getItem('cliptick_current_draft');
            if (draftData && draftData.trim() !== '') {
                const parsedDraft: ClipTickDraft = JSON.parse(draftData);
                setDraft(parsedDraft);
                setCaption(parsedDraft.caption || '');
                setPrivacy(parsedDraft.privacy || 'public');

                if (parsedDraft.segments.length > 0) {
                    const videoBlobs = parsedDraft.segments.map(s => fetch(s.dataUri).then(r => r.blob()));
                    Promise.all(videoBlobs).then(blobs => {
                        const videoBlob = new Blob(blobs, { type: 'video/webm' });
                        const videoUrl = URL.createObjectURL(videoBlob);
                        
                        if (videoRef.current) {
                            videoRef.current.src = videoUrl;
                        }
                        
                        setIsLoadingFrames(true);
                        extractFrames(videoUrl).then(extractedFrames => {
                            setFrames(extractedFrames);
                            setIsLoadingFrames(false);
                            URL.revokeObjectURL(videoUrl);
                        });
                    });
                } else {
                     setIsLoadingFrames(false);
                }
                 setIsLoading(false);

            } else {
                toast({ variant: 'destructive', title: 'No project found.' });
                router.push('/main-stream/cliptick');
            }
        } catch (e) {
            console.error("Could not load draft for preview", e);
            toast({ variant: 'destructive', title: 'Failed to load project data.' });
            router.push('/main-stream/cliptick');
        }
    }, [router, toast]);
    
    useEffect(() => {
        if (!draft) return;
        
        const fetchSuggestions = async () => {
            setIsLoadingSuggestions(true);
            try {
                const result = await contentSuggestionFlow({ topic: "Short-form vertical video, trending topics, viral clips", length: 3 });
                setAiSuggestions(result.suggestions);
            } catch(e) {
                // Do nothing
            } finally {
                setIsLoadingSuggestions(false);
            }
        }
        fetchSuggestions();
    }, [draft])

    const handleSaveDraft = () => {
        if (!draft) return;
        setIsSaving(true);
        try {
            const savedDrafts: ClipTickDraft[] = JSON.parse(localStorage.getItem('cliptick_drafts') || '[]');
            
            const updatedDraft: ClipTickDraft = { 
                ...draft, 
                caption, 
                privacy,
                createdAt: draft.createdAt || new Date().toISOString(),
                segments: draft.segments
            };

            const draftIndex = savedDrafts.findIndex(d => d.id === updatedDraft.id);

            if (draftIndex > -1) {
                savedDrafts[draftIndex] = updatedDraft;
            } else {
                savedDrafts.push(updatedDraft);
            }
            localStorage.setItem('cliptick_drafts', JSON.stringify(savedDrafts));
            toast({ title: 'Draft Saved!', description: 'You can continue editing later from the Drafts section.'});
             router.push('/main-stream');
        } catch (e) {
            toast({ variant: 'destructive', title: 'Failed to save draft.'});
        } finally {
            setIsSaving(false);
        }
    };

    const combineAndUploadSegments = async (draftToUpload: ClipTickDraft) => {
        toast({ title: 'Preparing video...', description: 'Combining clips for upload.'});

        const blobs = await Promise.all(draftToUpload.segments.map(seg => fetch(seg.dataUri).then(r => r.blob())));
        const combinedBlob = new Blob(blobs, { type: 'video/webm' });

        const finalVideoFile = new File([combinedBlob], `cliptick-${Date.now()}.webm`, { type: 'video/webm' });

        toast({ title: 'Uploading video...', description: 'This may take a moment.'});
        
        const response = await fetch(`/api/upload?filename=${finalVideoFile.name}`, {
            method: 'POST',
            body: finalVideoFile,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Upload failed');
        }
        const newBlob = (await response.json()) as UploadData;
        return newBlob;
    }


    const handlePublish = async () => {
        if (!user || !draft || draft.segments.length === 0) {
            toast({ variant: 'destructive', title: 'Cannot publish', description: 'Please log in and make sure your project has video clips.' });
            return;
        }

        setIsSaving(true);
        
        try {
            // Step 1: Upload the combined video file
            const newBlob = await combineAndUploadSegments(draft);
            
            const totalDurationSeconds = draft.segments.reduce((acc, s) => acc + s.duration, 0);
            const minutes = Math.floor(totalDurationSeconds / 60).toString().padStart(2, '0');
            const seconds = Math.floor(totalDurationSeconds % 60).toString().padStart(2, '0');
            const formattedDuration = `${minutes}:${seconds}`;

            // Step 2: Prepare video metadata
            const videoData = {
                title: caption || 'New ClipTick Video',
                description: caption,
                category: 'Short',
                videoUrl: newBlob.url,
                thumbnailUrl: frames[coverFrameIndex] || 'https://placehold.co/300x500.png',
                userId: user.id,
                channelName: user.name,
                duration: formattedDuration,
            };

            // Step 3: Save video metadata to the database
            const saveResult = await saveVideo(videoData);
            if (!saveResult.success) {
                throw new Error(saveResult.error || 'Failed to save video details to database.');
            }

            // Step 4: Clean up local storage
            const savedDrafts: ClipTickDraft[] = JSON.parse(localStorage.getItem('cliptick_drafts') || '[]');
            const updatedDrafts = savedDrafts.filter(d => d.id !== draft.id);
            localStorage.setItem('cliptick_drafts', JSON.stringify(updatedDrafts));
            localStorage.removeItem('cliptick_current_draft');
            
            toast({ title: 'Published!', description: 'Your ClipTick is now live.' });
            router.push('/main-stream');

        } catch (e: any) {
            console.error("Failed to publish or clean up drafts.", e);
            toast({ variant: 'destructive', title: 'An error occurred during publishing.', description: e.message });
            setIsSaving(false);
        }
    };

    const privacyOptions = [
        { id: 'public', label: 'Public', icon: Globe },
        { id: 'followers', label: 'Followers', icon: Users },
        { id: 'private', label: 'Private', icon: Lock },
    ];
    
    if (isLoading) {
        return <div className="w-full h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin h-8 w-8"/></div>;
    }

    const coverPreview = frames[coverFrameIndex] || 'https://placehold.co/180x320/000000/FFFFFF?text=?';

    return (
        <div className="w-full h-screen bg-background text-foreground flex flex-col md:flex-row">
            {/* Preview Section */}
            <div className="md:w-1/3 bg-black flex items-center justify-center p-4 relative">
                <Button variant="ghost" size="icon" className="absolute top-4 left-4 z-10 text-white" onClick={() => router.back()} aria-label="Go back to editor">
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <div className="w-full max-w-[300px] aspect-[9/16] bg-stone-900 rounded-xl overflow-hidden shadow-2xl">
                   {draft && draft.segments.length > 0 && (
                        <video 
                            ref={videoRef}
                            className="w-full h-full object-cover"
                            poster={frames[coverFrameIndex]}
                            controls
                            loop
                            autoPlay
                            muted
                        />
                   )}
                </div>
            </div>
            
            {/* Publish Form Section */}
            <div className="flex-1 flex flex-col">
                 <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8">
                    <h1 className="text-2xl font-bold">Publish your ClipTick</h1>
                    
                    <div>
                        <h2 id="cover-heading" className="text-lg font-semibold mb-2">Select Cover</h2>
                        <div className="relative h-48 md:h-64 w-full bg-black rounded-lg overflow-hidden">
                            <img src={coverPreview} alt="Cover preview" className="w-full h-full object-contain"/>
                        </div>
                        <div role="radiogroup" aria-labelledby="cover-heading" className="mt-2 grid grid-cols-4 md:grid-cols-8 gap-2">
                            {isLoadingFrames ? (
                                Array.from({ length: 8 }).map((_, index) => (
                                    <Skeleton key={index} className="aspect-[9/16] rounded-md" />
                                ))
                            ) : frames.length > 0 ? (
                                frames.map((frame, index) => (
                                    <motion.div
                                        key={index}
                                        role="radio"
                                        aria-checked={coverFrameIndex === index}
                                        tabIndex={0}
                                        className={cn("aspect-[9/16] rounded-md bg-black overflow-hidden cursor-pointer border-2", coverFrameIndex === index ? "border-primary" : "border-transparent")}
                                        onClick={() => setCoverFrameIndex(index)}
                                        onKeyDown={(e) => e.key === 'Enter' || e.key === ' ' ? setCoverFrameIndex(index) : null}
                                        whileTap={{ scale: 0.95 }}
                                        aria-label={`Select frame ${index + 1} as cover`}
                                    >
                                        <img src={frame} alt={`Frame ${index + 1}`} className="w-full h-full object-cover"/>
                                    </motion.div>
                                ))
                            ) : (
                                <p className="col-span-full text-sm text-muted-foreground text-center py-4">Could not extract frames from video.</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold mb-2" id="caption-label">Caption</h2>
                         <div className="relative">
                            <Textarea 
                                placeholder="Describe your video... #hashtags @mentions"
                                rows={4}
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                aria-labelledby="caption-label"
                                className="pr-10"
                            />
                            <div className="absolute top-2 right-2">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="AI Caption Suggestions">
                                            <Lightbulb className="h-4 w-4 text-amber-400"/>
                                        </Button>
                                    </PopoverTrigger>
                                     <PopoverContent className="w-80">
                                        <div className="space-y-4">
                                            <h4 className="font-medium leading-none">AI Suggestions</h4>
                                            {isLoadingSuggestions ? <Loader2 className="animate-spin" /> :
                                                aiSuggestions.map((s,i) => (
                                                    <div key={i} className="text-sm p-2 rounded-md bg-muted hover:bg-muted/80 cursor-pointer" onClick={() => setCaption(s.title)}>
                                                        <p>{s.title}</p>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold mb-2" id="privacy-label">Who can watch this video</h2>
                        <div className="flex flex-col sm:flex-row gap-2" role="radiogroup" aria-labelledby="privacy-label">
                            {privacyOptions.map(option => (
                                 <Button 
                                    key={option.id}
                                    variant={privacy === option.id ? 'default' : 'outline'}
                                    className="flex-1 justify-center"
                                    onClick={() => setPrivacy(option.id as PrivacySetting)}
                                    role="radio"
                                    aria-checked={privacy === option.id}
                                 >
                                     <option.icon className="mr-2 h-4 w-4" />
                                     {option.label}
                                 </Button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t sticky bottom-0 bg-background z-10 grid grid-cols-2 gap-4">
                     <Button variant="secondary" size="lg" onClick={handleSaveDraft} disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />}
                        Save Draft
                    </Button>
                    <Button size="lg" className="bg-purple-600 hover:bg-purple-700" onClick={handlePublish} disabled={isSaving}>
                         {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                         Publish
                    </Button>
                </div>
            </div>
        </div>
    );
}


export default function ClipTickPreviewPage() {
    return (
        <Suspense fallback={<div className="w-full h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin h-8 w-8"/></div>}>
            <ClipTickPreviewAndPublishPageContent />
        </Suspense>
    )
}

