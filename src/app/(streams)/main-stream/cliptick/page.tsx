

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { Camera, RefreshCcw, Zap, Timer, Music, Scissors, X, Check, Undo, Redo, CircleCheck, CircleX, Volume2, Save, GalleryHorizontalEnd, Pause, BrainCircuit, FolderClock, Sparkles, Video, Play, Loader2, Palette, Ghost, Trash2, Mic, Upload, Info, Maximize, Minimize } from 'lucide-react';
import { AnimatePresence, motion, Reorder, useDragControls } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import type { ClipTickDraft, ClipTickSegment } from '@/types';
import { useEditorStore } from '@/stores/cliptick-store';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog"
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/hooks/use-auth';
import { deleteClipTickDraft, getClipTickDraftsByUserId, saveClipTickDraft } from '@/lib/actions';


// --- Helper Components ---

const CameraButton = ({ isRecording, children }: { isRecording: boolean, children?: React.ReactNode }) => (
  <button className="relative w-20 h-20 rounded-full border-4 border-white/50 flex items-center justify-center transition-all duration-300 transform active:scale-90 focus:outline-none bg-transparent">
    <div className={cn("w-[75%] h-[75%] rounded-full bg-white transition-all duration-300", isRecording ? 'scale-50 rounded-md' : 'scale-100')}></div>
     <div className="absolute inset-0 flex items-center justify-center">
        {children}
    </div>
  </button>
);


const SideRailButton = ({ children, label, ...props }: { children: React.ReactNode, label: string } & React.ComponentProps<typeof Button>) => (
  <div className="flex flex-col items-center gap-1">
    <Button variant="ghost" size="icon" className="w-12 h-12 rounded-full bg-black/30 text-white backdrop-blur-sm" {...props} aria-label={label}>
      {children}
    </Button>
    <span className="text-xs text-white font-semibold tracking-tighter" aria-hidden="true">{label}</span>
  </div>
);

const TransitionButton = () => (
    <div className="h-14 w-6 flex items-center justify-center flex-shrink-0">
        <button className="w-5 h-5 bg-white/20 rounded-sm text-white flex items-center justify-center hover:bg-purple-500 transition-colors">
            <div className="w-2 h-2 border-t-2 border-r-2 transform rotate-45 border-white"></div>
        </button>
    </div>
)

const SegmentThumbnail = ({ segment, onRemove, onTrim }: { segment: ClipTickSegment, onRemove: (id: number) => void, onTrim: (seg: ClipTickSegment) => void }) => {
    const dragControls = useDragControls();
    return (
    <Reorder.Item
        value={segment}
        id={`segment-${segment.id}`}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative h-14 w-10 bg-black/50 rounded-md overflow-hidden border-2 border-white/50 flex-shrink-0 group cursor-grab active:cursor-grabbing"
        dragListener={false}
        dragControls={dragControls}
    >
        <div className='absolute inset-0' onPointerDown={(e) => dragControls.start(e)} />
        {segment.dataUri ? (
           <video src={segment.dataUri} className="w-full h-full object-cover pointer-events-none" muted aria-label={`Video segment, ${segment.duration.toFixed(1)} seconds long`} />
        ) : (
            <div className="absolute inset-0 flex items-center justify-center">
                <Video className="w-6 h-6 text-white/50"/>
            </div>
        )}
        <div className="absolute bottom-1 right-1 text-white text-[10px] font-mono bg-black/50 px-1 rounded-sm pointer-events-none" aria-hidden="true">
            {segment.duration.toFixed(1)}s
        </div>
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
             <button onClick={() => onTrim(segment)} className="text-white p-0.5" aria-label={`Trim segment ${segment.id}`}>
                <Scissors className="w-4 h-4"/>
            </button>
            <button onClick={() => onRemove(segment.id)} className="text-red-400 p-0.5" aria-label={`Remove segment ${segment.id}`}>
                <X className="w-4 h-4"/>
            </button>
        </div>
    </Reorder.Item>
    )
};

const SPEED_OPTIONS = [
  { label: '0.3x', value: 0.3 },
  { label: '0.5x', value: 0.5 },
  { label: '1x', value: 1 },
  { label: '2x', value: 2 },
  { label: '3x', value: 3 },
];

const FILTERS = [
    { id: 'none', name: 'Normal', class: '' },
    { id: 'vintage', name: 'Vintage', class: 'sepia-[.6] contrast-[.8] brightness-[1.1] saturate-[1.2]' },
    { id: 'grayscale', name: 'Mono', class: 'grayscale' },
    { id: 'cold', name: 'Cold', class: 'contrast-125 hue-rotate-[-15deg]' },
    { id: 'warm', name: 'Warm', class: 'sepia-[.3] saturate-150' },
    { id: 'invert', name: 'Invert', class: 'invert' },
];

const VFX_FILTERS = [
  { id: 'none', name: 'None', class: '' },
  { id: 'zoom-in', name: 'Zoom In', class: 'animate-zoom-in' },
  { id: 'pulse', name: 'Pulse', class: 'animate-pulse-vfx' },
  { id: 'shake', name: 'Shake', class: 'animate-shake' },
  { id: 'blink', name: 'Blink', class: 'animate-blink' },
  { id: 'static', name: 'Static', class: 'animate-static-noise' },
  { id: 'old-film', name: 'Old Film', class: 'animate-old-film' },
  { id: 'rgb-split', name: 'RGB Split', class: 'animate-rgb-split' },
];

// --- Main Page Component ---

export default function ClipTickPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const trimVideoRef = useRef<HTMLVideoElement>(null);
  const voiceoverPreviewVideoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const musicFileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Zustand state
  const { segments, setSegments, undo, redo, addSegment, removeSegment, reorderSegments, past, future, updateSegmentsWithoutHistory, resetHistory } = useEditorStore();
  
  const [isClient, setIsClient] = useState(false);
  const [draftId, setDraftId] = useState<number | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const durationRef = useRef(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // Audio state
  const [showMusicDialog, setShowMusicDialog] = useState(false);
  const [songList, setSongList] = useState<any[]>([]);
  const [isSearchingSongs, setIsSearchingSongs] = useState(false);
  const [selectedSong, setSelectedSong] = useState<any | null>(null);
  const [songSearch, setSongSearch] = useState("");
  const [songRegion, setSongRegion] = useState([0, 60]);
  const [musicVolume, setMusicVolume] = useState(1);
  const [clipVolume, setClipVolume] = useState(1);
  const [previewingSongId, setPreviewingSongId] = useState<string | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement>(null);

  // Voiceover State
  const [showVoiceoverPanel, setShowVoiceoverPanel] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceoverBlob, setVoiceoverBlob] = useState<Blob | null>(null);
  const [voiceoverPlaybackTime, setVoiceoverPlaybackTime] = useState(0);
  const voiceMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const voiceRecordedChunksRef = useRef<Blob[]>([]);
  const voiceoverVideoTimerRef = useRef<number | null>(null);


  // Drafts state
  const [showDraftsDialog, setShowDraftsDialog] = useState(false);
  const [drafts, setDrafts] = useState<(ClipTickDraft & { id: number })[]>([]);
  const [showSessionRestoreDialog, setShowSessionRestoreDialog] = useState(false);

  // Trim state
  const [trimmingSegment, setTrimmingSegment] = useState<ClipTickSegment | null>(null);
  const [trimRange, setTrimRange] = useState([0, 0]);

  // Camera Features State
  const [countdown, setCountdown] = useState(0);
  const [cameraFacingMode, setCameraFacingMode] = useState<'user' | 'environment'>('environment');
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  
  // Panel states
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [showVFXPanel, setShowVFXPanel] = useState(false);
  const [activeFilter, setActiveFilter] = useState('none');
  const [activeVFX, setActiveVFX] = useState('none');

  // Align tool state
  const [isAlignToolActive, setIsAlignToolActive] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');

  const MAX_DURATION = 60; 

  // Refs for recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const stopCameraStream = useCallback(() => {
    if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
    }
  }, []);
  
  // Effect for camera initialization
  useEffect(() => {
    if (!isClient) return;
    let isMounted = true;
    const getCameraPermission = async () => {
      stopCameraStream(); // Stop any previous stream
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter(d => d.kind === 'videoinput');
        if (!isMounted) return;
        setVideoDevices(videoInputs);

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: cameraFacingMode },
          audio: true
        });

        if (!isMounted) {
            stream.getTracks().forEach(track => track.stop());
            return;
        };

        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.playbackRate = playbackRate;
        }

        mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'video/webm' });
        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
          }
        };
        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const finalDuration = durationRef.current / playbackRate;
          if (finalDuration > 0.5) {
            addSegment({ id: Date.now(), duration: finalDuration, dataUri: url });
          }
          durationRef.current = 0;
          recordedChunksRef.current = [];
          // Automatically turn off align tool after recording
          setIsAlignToolActive(false);
        };
      } catch (error) {
        console.error('Error accessing camera:', error);
        if (isMounted) {
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings to use ClipTick.',
          });
        }
      }
    };

    getCameraPermission();

    return () => {
        isMounted = false;
        stopCameraStream();
    }
  }, [cameraFacingMode, playbackRate, addSegment, stopCameraStream, toast, isClient]);

  const loadDraft = useCallback(async (id: number) => {
    if (!user) return;
    const allDrafts = await getClipTickDraftsByUserId(user.id);
    const draftToLoad = allDrafts.find((d: any) => d.id === id);
    
    if (draftToLoad) {
        setDraftId(draftToLoad.id);
        updateSegmentsWithoutHistory(draftToLoad.segments);
        resetHistory();
        setSelectedSong(draftToLoad.selectedSong);
        setSongRegion(draftToLoad.songRegion || [0, 60]);
        setMusicVolume(draftToLoad.musicVolume ?? 1);
        setClipVolume(draftToLoad.clipVolume ?? 1);
        toast({ title: 'Draft Loaded', description: `Continuing project from ${new Date(draftToLoad.createdAt).toLocaleDateString()}`});
    } else {
        toast({ variant: 'destructive', title: 'Draft not found' });
    }
  }, [user, resetHistory, toast, updateSegmentsWithoutHistory]);

  // Effect for initial load, drafts, and session restore
  useEffect(() => {
    if (!isClient) return;

    const draftIdParam = searchParams.get('draftId');
    if (draftIdParam) {
      const numericDraftId = parseInt(draftIdParam, 10);
      if (!isNaN(numericDraftId)) {
        loadDraft(numericDraftId);
        router.replace('/main-stream/cliptick', undefined);
      }
    }
    
    // Cleanup timers on component unmount
    return () => {
      if(autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
      if(countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (previewAudioRef.current) {
          previewAudioRef.current.pause();
      }
    };
  }, [isClient, loadDraft, router, searchParams]);

  // Update total duration when segments change
  useEffect(() => {
    const newTotal = segments.reduce((acc, seg) => acc + seg.duration, 0);
    setTotalDuration(newTotal);

  }, [segments]);
  
  const handleFullScreenChange = useCallback(() => {
    if (typeof document !== 'undefined') {
        setIsFullScreen(!!document.fullscreenElement);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, [handleFullScreenChange]);
  

  // --- Handlers ---

  const startRecording = () => {
    if (!hasCameraPermission || totalDuration >= MAX_DURATION || !mediaRecorderRef.current || mediaRecorderRef.current.state === 'recording') {
        return;
    }
    
    recordedChunksRef.current = [];
    durationRef.current = 0;
    mediaRecorderRef.current.start();
    setIsRecording(true);

    recordingTimerRef.current = setInterval(() => {
        durationRef.current += 0.1;
        const newTotalDuration = totalDuration + (durationRef.current / playbackRate);
        if (newTotalDuration >= MAX_DURATION) {
            stopRecording();
        }
    }, 100);
  };

  const stopRecording = () => {
    if (!isRecording || !mediaRecorderRef.current) return;

    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
    
    if (mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
    }
    
    setIsRecording(false);
  };

  const startCountdown = (duration: number) => {
    setCountdown(duration);
    countdownIntervalRef.current = setInterval(() => {
        setCountdown(prev => {
            if (prev <= 1) {
                if(countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
                startRecording();
                return 0;
            }
            return prev - 1;
        });
    }, 1000);
  }
  
  const handleNext = async () => {
    if (!isClient || !user) return;

    const draftToSave: ClipTickDraft = {
        id: draftId ? String(draftId) : `draft-${Date.now()}`,
        createdAt: new Date().toISOString(),
        segments,
        selectedSong,
        songRegion,
        musicVolume,
        clipVolume,
        caption: "", 
        privacy: "public",
    };

    const { success, draft } = await saveClipTickDraft(user.id, draftToSave);

    if (success && draft) {
        localStorage.setItem('cliptick_current_draft', JSON.stringify({ ...draft.draftData, id: draft.id }));
        router.push('/main-stream/cliptick/preview');
    } else {
        toast({ variant: 'destructive', title: 'Could not save draft before proceeding.' });
    }
  };

  const loadDrafts = async () => {
    if (!isClient || !user) return;
    const savedDrafts = await getClipTickDraftsByUserId(user.id);
    setDrafts(savedDrafts as (ClipTickDraft & { id: number })[]);
  };

  const deleteDraft = async (id: number) => {
    if (!isClient || !user) return;
    const result = await deleteClipTickDraft(id, user.id);
    if(result.success) {
        loadDrafts();
        toast({ title: 'Draft Deleted' });
    } else {
        toast({ variant: 'destructive', title: 'Failed to delete draft', description: result.error });
    }
  };
  
  const handleSaveDraft = async () => {
    if (!isClient || !user) return;
    
    const draftToSave: ClipTickDraft = {
        id: draftId ? String(draftId) : `draft-${Date.now()}`,
        createdAt: new Date().toISOString(),
        segments,
        selectedSong,
        songRegion,
        musicVolume,
        clipVolume,
        caption: "",
        privacy: "public",
        voiceoverDataUri: voiceoverBlob ? URL.createObjectURL(voiceoverBlob) : undefined,
    };
    
    const result = await saveClipTickDraft(user.id, draftToSave);
    if(result.success && result.draft) {
      setDraftId(result.draft.id);
      loadDrafts();
      toast({ title: "Project Saved as Draft" });
    } else {
      toast({ variant: "destructive", title: "Failed to save draft", description: result.error });
    }
  };
  
  const handleOpenTrim = (segment: ClipTickSegment) => {
    setTrimmingSegment(segment);
    setTrimRange([0, segment.duration]);
    if (trimVideoRef.current) {
      trimVideoRef.current.currentTime = 0;
    }
  };

  const handleSliderChange = (value: number[]) => {
      setTrimRange(value);
      if (trimVideoRef.current) {
        trimVideoRef.current.currentTime = value[0];
      }
  };

  const handleSaveTrim = () => {
    if (!trimmingSegment) return;

    const newDuration = trimRange[1] - trimRange[0];

    const newSegments = segments.map(s => 
      s.id === trimmingSegment.id 
      ? { ...s, duration: newDuration } // This is a simplification. Real trim would need video processing.
      : s
    );
    setSegments(newSegments);
    setTrimmingSegment(null);
    toast({ title: "Segment Trimmed!" });
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
        const videoEl = document.createElement('video');
        videoEl.src = URL.createObjectURL(file);
        videoEl.onloadedmetadata = () => {
            if (totalDuration + videoEl.duration > MAX_DURATION) {
                toast({ variant: 'destructive', title: 'Video too long', description: 'This video exceeds the maximum total duration.' });
                return;
            }
            addSegment({ id: Date.now(), duration: videoEl.duration, dataUri: videoEl.src });
            toast({ title: 'Video Added!' });
        };
    } else {
        toast({ variant: 'destructive', title: 'Invalid File', description: 'Please select a valid video file.' });
    }
  }

  const switchCamera = () => {
    setCameraFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const toggleFlash = async () => {
    if (!videoRef.current?.srcObject) return;

    const stream = videoRef.current.srcObject as MediaStream;
    const track = stream.getVideoTracks()[0];
    const capabilities = track.getCapabilities();

    if (!('torch' in capabilities)) {
        toast({
            variant: "destructive",
            title: "Flash Not Available",
            description: "Your device does not support flash control.",
        });
        return;
    }

    try {
        await track.applyConstraints({
            advanced: [{ torch: !isFlashOn }],
        });
        setIsFlashOn(!isFlashOn);
    } catch (error) {
        console.error("Failed to toggle flash:", error);
        toast({
            variant: "destructive",
            title: "Flash Error",
            description: "Could not toggle the flash.",
        });
    }
  };

    const handleSearchSongs = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!songSearch) {
          setSongList([]);
          return;
        }

        setIsSearchingSongs(true);
        try {
            const appName = process.env.NEXT_PUBLIC_AUDIUS_APP_NAME || "YuvaSetu";
            const response = await fetch(`https://discoveryprovider.audius.co/v1/tracks/search?query=${encodeURIComponent(songSearch)}&app_name=${appName}`);
            if (!response.ok) {
                throw new Error('Audius API request failed');
            }
            const result = await response.json();

            // Filter for tracks that are downloadable and have a Creative Commons license
            const safeTracks = result.data.filter((track: any) => {
                const license = track.license || "";
                // Allowing CC-BY, CC-BY-SA, CC0, and Public Domain.
                // Not allowing NC (Non-Commercial) or ND (No-Derivatives).
                return track.is_downloadable && (
                    license.includes("by") || license.includes("publicdomain") || license.includes("cc0")
                );
            });
            
            const transformedSongs = safeTracks.map((track: any) => ({
                id: track.id,
                title: track.title,
                artist: track.user.name,
                duration: track.duration,
                license: track.license,
                url: `https://discoveryprovider.audius.co/v1/tracks/${track.id}/stream?app_name=${appName}`,
            }));
            
            setSongList(transformedSongs);

        } catch (error) {
            console.error("Failed to search Audius songs:", error);
            toast({ variant: 'destructive', title: 'Could not fetch songs', description: 'Please try again later.'});
            setSongList([]);
        } finally {
            setIsSearchingSongs(false);
        }
    };


  const handlePreviewSong = (song: any) => {
    const audio = previewAudioRef.current;
    if (!audio) return;
    
    if (previewingSongId === song.id && !audio.paused) {
      audio.pause();
      setPreviewingSongId(null);
    } else {
      audio.src = song.url;
      audio.currentTime = 0;
      audio.play().catch(e => console.error("Audio play failed:", e));
      setPreviewingSongId(song.id);
      audio.onended = () => setPreviewingSongId(null);
    }
  };
  
  const handleAlignClick = () => {
    setIsAlignToolActive(prev => !prev);
  };
    
    // Helper to get duration of a video from its data URI
    const getVideoDuration = (dataUri: string): Promise<number> => {
        return new Promise(resolve => {
            const video = document.createElement('video');
            video.onloadedmetadata = () => {
                resolve(video.duration);
            };
            video.src = dataUri;
        });
    }
    
    const handleMusicFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !file.type.startsWith('audio/')) {
            toast({ variant: 'destructive', title: 'Invalid File Type', description: 'Please select an audio file.' });
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUri = e.target?.result as string;
            const audio = new Audio(dataUri);
            audio.onloadedmetadata = () => {
                const newSong = {
                    id: `local-${Date.now()}`,
                    title: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
                    artist: "Local File",
                    url: dataUri,
                    duration: audio.duration,
                    license: "local",
                };
                setSelectedSong(newSong);
                setSongRegion([0, Math.min(MAX_DURATION, audio.duration)]);
                setShowMusicDialog(false);
                toast({ title: 'Song Uploaded!', description: newSong.title });
            };
        };
        reader.readAsDataURL(file);
    };
    
    const handleToggleVoiceover = () => {
        setShowVoiceoverPanel(!showVoiceoverPanel);
        setShowFiltersPanel(false);
        setShowVFXPanel(false);
    }
  
    const startVoiceRecording = async () => {
        if (isRecordingVoice) return;

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        voiceMediaRecorderRef.current = new MediaRecorder(stream);
        voiceRecordedChunksRef.current = [];

        voiceMediaRecorderRef.current.ondataavailable = (event) => {
            if (event.data.size > 0) {
                voiceRecordedChunksRef.current.push(event.data);
            }
        };

        voiceMediaRecorderRef.current.onstop = () => {
            const blob = new Blob(voiceRecordedChunksRef.current, { type: 'audio/webm' });
            setVoiceoverBlob(blob);
            setIsRecordingVoice(false);
            if (voiceoverVideoTimerRef.current) {
                cancelAnimationFrame(voiceoverVideoTimerRef.current);
            }
            if (voiceoverPreviewVideoRef.current) {
                voiceoverPreviewVideoRef.current.pause();
            }
        };

        setIsRecordingVoice(true);
        voiceMediaRecorderRef.current.start();
        if (voiceoverPreviewVideoRef.current) {
            voiceoverPreviewVideoRef.current.currentTime = 0;
            voiceoverPreviewVideoRef.current.play();

            const updateTimeline = () => {
                if (voiceoverPreviewVideoRef.current) {
                    const currentTime = voiceoverPreviewVideoRef.current.currentTime;
                    setVoiceoverPlaybackTime(currentTime);
                     if (!voiceoverPreviewVideoRef.current.paused) {
                        voiceoverVideoTimerRef.current = requestAnimationFrame(updateTimeline);
                    }
                }
            };
            updateTimeline();
        }
    };
    
    const stopVoiceRecording = () => {
        if (isRecordingVoice && voiceMediaRecorderRef.current) {
            voiceMediaRecorderRef.current.stop();
        }
    };

    const toggleFullScreen = () => {
        const element = editorRef.current;
        if (!element) return;

        if (!document.fullscreenElement) {
            element.requestFullscreen().catch(err => {
                alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };


  // --- Render ---

  if (!isClient || hasCameraPermission === null) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black text-white">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="ml-2">Requesting camera permission...</p>
      </div>
    );
  }

  if (hasCameraPermission === false) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black p-4">
        <Alert variant="destructive">
          <Camera className="h-4 w-4" />
          <AlertTitle>Camera Access Required</AlertTitle>
          <AlertDescription>
            ClipTick needs camera access to function. Please enable it in your browser settings and refresh the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const progressPercentage = (totalDuration / MAX_DURATION) * 100;
  const currentSegmentProgress = (durationRef.current / playbackRate / MAX_DURATION) * 100;
  const activeFilterStyle = FILTERS.find(f => f.id === activeFilter)?.class || '';
  const activeVFXStyle = VFX_FILTERS.find(f => f.id === activeVFX)?.class || '';
  const lastSegmentUri = segments.length > 0 ? segments[segments.length - 1].dataUri : null;


  return (
    <motion.div 
      ref={editorRef}
      className="w-full h-screen bg-black text-white overflow-hidden relative select-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <svg className="absolute w-0 h-0">
          <defs>
              <filter id="glass-filter" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur"/>
                    <feOffset in="blur" dx="2" dy="2" result="offsetBlur"/>
                    <feSpecularLighting in="blur" surfaceScale="5" specularConstant=".75" specularExponent="20" lightingColor="white" result="specularOut">
                        <fePointLight x="-5000" y="-10000" z="20000"/>
                    </feSpecularLighting>
                    <feComposite in="specularOut" in2="SourceAlpha" operator="in" result="specularComp"/>
                    <feComposite in="SourceGraphic" in2="specularComp" operator="out" result="out"/>
                </filter>
              <linearGradient id="glass-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: 'white', stopOpacity: 0.5 }} />
                  <stop offset="100%" style={{ stopColor: 'white', stopOpacity: 0.1 }} />
              </linearGradient>
          </defs>
      </svg>
      <audio ref={previewAudioRef} hidden />
      <input type="file" ref={musicFileInputRef} onChange={handleMusicFileUpload} accept="audio/*" className="hidden" />
        
        {isProcessing && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
                <p className="text-lg font-semibold">{processingStatus}</p>
            </div>
        )}


       <AnimatePresence>
       {trimmingSegment && (
            <motion.div
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 className="absolute inset-0 bg-black/80 backdrop-blur-md z-30 flex flex-col items-center justify-center p-4"
            >
                <DialogTitle className="text-2xl font-bold mb-2">Trim Segment</DialogTitle>
                <DialogDescription className="mb-6">Adjust the start and end of your clip.</DialogDescription>
                <div className="w-full max-w-md space-y-4">
                    <video ref={trimVideoRef} src={trimmingSegment.dataUri} className="w-full rounded-lg" muted loop autoPlay/>
                     <div className="bg-white/10 p-4 rounded-lg">
                        <Slider
                            value={trimRange}
                            onValueChange={handleSliderChange}
                            max={trimmingSegment.duration}
                            step={0.1}
                            className="w-full"
                            aria-label="Trim video segment"
                        />
                         <div className='flex justify-between text-xs font-mono text-white/70 mt-2'>
                            <span>{trimRange[0].toFixed(1)}s</span>
                            <span>{trimRange[1].toFixed(1)}s</span>
                        </div>
                    </div>
                </div>
                <div className="absolute bottom-6 flex gap-4">
                     <Button variant="destructive" onClick={() => setTrimmingSegment(null)}>
                        <CircleX className="mr-2"/>
                        Cancel
                    </Button>
                    <Button variant="secondary" className="bg-green-600 hover:bg-green-700" onClick={handleSaveTrim}>
                        <CircleCheck className="mr-2"/>
                        Apply Trim
                    </Button>
                </div>
            </motion.div>
        )}
       </AnimatePresence>
      
      <div className={cn('w-full h-full relative')}>
        <video
          ref={videoRef}
          className={cn(
            "w-full h-full object-cover transition-all duration-300",
            cameraFacingMode === 'user' && '-scale-x-100',
            activeFilterStyle,
            activeVFXStyle
          )}
          autoPlay
          muted
          playsInline
        />
        {isAlignToolActive && lastSegmentUri && (
             <video
                src={lastSegmentUri}
                className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none"
                muted
                loop
                autoPlay
             />
        )}
      </div>
      
      {/* Watermark Logo */}
      <div className="absolute top-20 right-4 pointer-events-none z-10" aria-hidden="true">
        <svg width="120" height="40" viewBox="0 0 120 40">
          <text 
              x="50%" 
              y="50%" 
              dy=".35em" 
              textAnchor="middle"
              fontSize="24"
              fontWeight="bold"
              fill="url(#glass-gradient)"
              filter="url(#glass-filter)"
          >
              ClipTick
          </text>
        </svg>
      </div>

      {/* Countdown Timer Overlay */}
      {countdown > 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-40">
            <motion.div
                key={countdown}
                initial={{ scale: 2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="text-white font-bold text-8xl"
            >
                {countdown}
            </motion.div>
        </div>
      )}


      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent z-10">
        <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="text-white" aria-label="Close ClipTick editor" onClick={() => router.push('/main-stream')}><X className="w-6 h-6"/></Button>
            <Button variant="ghost" size="icon" className="text-white" onClick={undo} disabled={past.length === 0} aria-label="Undo"><Undo className="w-6 h-6"/></Button>
            <Button variant="ghost" size="icon" className="text-white" onClick={redo} disabled={future.length === 0} aria-label="Redo"><Redo className="w-6 h-6"/></Button>
        </div>
        
        <div className="flex gap-2 items-center">
            <Button variant="ghost" size="icon" className="text-white" onClick={toggleFullScreen} aria-label={isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}>
                {isFullScreen ? <Minimize className="w-6 h-6"/> : <Maximize className="w-6 h-6"/>}
            </Button>
            <Button variant="ghost" size="icon" className="text-white" onClick={handleNext} disabled={segments.length === 0} aria-label="Next step: Preview video">
                <Check className="w-6 h-6"/>
            </Button>
        </div>
      </div>
      
       {/* Left Side Rail */}
       <div className="absolute top-1/4 left-4 grid grid-cols-1 gap-4 z-10">
        <SideRailButton label="Filters" onClick={() => {setShowFiltersPanel(!showFiltersPanel); setShowVFXPanel(false); setShowVoiceoverPanel(false);}} className={cn(showFiltersPanel && 'bg-purple-500')}><Palette /></SideRailButton>
        <SideRailButton label="VFX" onClick={() => {setShowVFXPanel(!showVFXPanel); setShowFiltersPanel(false); setShowVoiceoverPanel(false);}} className={cn(showVFXPanel && 'bg-purple-500')}><Sparkles /></SideRailButton>
        <SideRailButton label="Align" onClick={handleAlignClick} className={cn(isAlignToolActive && 'bg-purple-500')}><Ghost/></SideRailButton>
        <SideRailButton label="Voiceover" onClick={handleToggleVoiceover} className={cn(showVoiceoverPanel && 'bg-purple-500')}><Mic /></SideRailButton>
        <SideRailButton label="AI Cam" onClick={() => {}}><BrainCircuit /></SideRailButton>
      </div>

       {/* Right Side Rail */}
      <div className="absolute top-1/4 right-4 grid grid-cols-1 gap-4 z-10">
        {videoDevices.length > 1 && (
            <SideRailButton label="Flip" onClick={switchCamera}><RefreshCcw /></SideRailButton>
        )}
        <SideRailButton label="Flash" onClick={toggleFlash} className={cn(isFlashOn && 'bg-purple-500')}><Zap /></SideRailButton>
        <Popover>
            <PopoverTrigger asChild>
                <div className="flex flex-col items-center gap-1">
                    <Button variant="ghost" size="icon" className="w-12 h-12 rounded-full bg-black/30 text-white backdrop-blur-sm" aria-label="Speed Control">
                        <Timer />
                    </Button>
                    <span className="text-xs text-white font-semibold tracking-tighter" aria-hidden="true">{playbackRate}x</span>
                </div>
            </PopoverTrigger>
            <PopoverContent side="left" className="w-auto p-1 rounded-full">
                <div className="flex items-center gap-1">
                {SPEED_OPTIONS.map(opt => (
                    <Button
                        key={opt.value}
                        variant="ghost"
                        size="icon"
                        className={cn("rounded-full w-10 h-10", playbackRate === opt.value && "bg-primary text-primary-foreground")}
                        onClick={() => setPlaybackRate(opt.value)}
                    >
                        {opt.label}
                    </Button>
                ))}
                </div>
            </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
              <SideRailButton label="Timer"><Timer /></SideRailButton>
          </PopoverTrigger>
           <PopoverContent side="left" className="w-auto p-1 rounded-full">
                <div className="flex items-center gap-1">
                  {[3, 10].map(sec => (
                      <Button
                          key={sec}
                          variant="ghost"
                          className="rounded-full w-12"
                          onClick={() => startCountdown(sec)}
                      >
                          {sec}s
                      </Button>
                  ))}
                </div>
            </PopoverContent>
        </Popover>
      </div>
      
      
       {/* Music Dialog (Audio Galaxy) */}
      <AnimatePresence>
        {showMusicDialog && (
            <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="absolute inset-x-0 bottom-0 bg-black/80 backdrop-blur-lg rounded-t-2xl p-4 z-20 h-2/3 flex flex-col"
                role="dialog"
                aria-modal="true"
                aria-labelledby="audio-galaxy-title"
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 id="audio-galaxy-title" className="text-lg font-bold">Audio Galaxy</h2>
                    <Button variant="ghost" size="icon" onClick={() => setShowMusicDialog(false)} aria-label="Close music selection"><X /></Button>
                </div>
                <div className="flex gap-2 mb-4">
                    <form onSubmit={handleSearchSongs} className="relative flex-1">
                        <input type="search" placeholder="Search songs, artists, or genres..." className="w-full bg-white/10 rounded-full pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" value={songSearch} onChange={(e) => setSongSearch(e.target.value)} aria-label="Search for a song" />
                    </form>
                    <Button variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20" onClick={() => musicFileInputRef.current?.click()}>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload
                    </Button>
                </div>
                {selectedSong && (
                    <div className='mb-4 p-4 rounded-lg bg-purple-500/20 border border-purple-500 space-y-4'>
                        <div>
                            <h3 className="font-semibold text-lg">{selectedSong.title}</h3>
                            <p className="text-sm text-purple-300">{selectedSong.artist}</p>
                        </div>
                        <div className='space-y-2'>
                             <div className="h-12 w-full bg-white/10 rounded-md relative flex items-center" aria-hidden="true">
                                 {/* Fake waveform */}
                                 <svg width="100%" height="100%" className="absolute inset-0">
                                     <path d="M0 24 L20 28 L40 20 L60 30 L80 18 L100 25 L120 22 L140 32 L160 20 L180 28 L200 24 L220 20 L240 29 L260 21 L280 27 L300 24" stroke="#A78BFA" strokeWidth="2" fill="none"/>
                                 </svg>
                             </div>
                            <Slider
                                value={songRegion}
                                onValueChange={setSongRegion}
                                max={selectedSong.duration}
                                step={1}
                                className="w-full"
                                aria-label="Select song region"
                            />
                            <div className='flex justify-between text-xs font-mono text-white/70' aria-hidden="true">
                                <span>{new Date(songRegion[0] * 1000).toISOString().substr(14, 5)}</span>
                                <span>{new Date(songRegion[1] * 1000).toISOString().substr(14, 5)}</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <Music className="h-4 w-4" />
                                    <label htmlFor="music-volume">Music Volume</label>
                                </div>
                                <Slider id="music-volume" defaultValue={[musicVolume]} max={1} step={0.05} onValueChange={([v]) => setMusicVolume(v)} />
                            </div>
                            <div className="space-y-2">
                                 <div className="flex items-center gap-2 text-sm">
                                    <Volume2 className="h-4 w-4" />
                                    <label htmlFor="clip-volume">Clip Volume</label>
                                </div>
                                <Slider id="clip-volume" defaultValue={[clipVolume]} max={1} step={0.05} onValueChange={([v]) => setClipVolume(v)} />
                            </div>
                        </div>
                    </div>
                )}
                 <div className="flex-1 overflow-y-auto no-scrollbar">
                    <TooltipProvider>
                    {isSearchingSongs ? (
                         <div className="flex items-center justify-center h-full">
                            <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
                        </div>
                    ) : songList.length > 0 ? (
                        songList.map(song => (
                            <div key={song.id} className={cn("flex items-center gap-4 p-2 rounded-lg hover:bg-white/10 cursor-pointer", selectedSong?.id === song.id && "bg-purple-500/30")} onClick={() => { setSelectedSong(song); setSongRegion([0, Math.min(MAX_DURATION, song.duration)]) }} role="button" tabIndex={0} aria-label={`Select song: ${song.title} by ${song.artist}`}>
                                <div className="w-12 h-12 bg-white/20 rounded-md flex items-center justify-center overflow-hidden" aria-hidden="true">
                                    <Music className="w-6 h-6 text-white/80"/>
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold truncate">{song.title}</p>
                                    <p className="text-xs text-white/70 truncate">{song.artist}</p>
                                </div>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Info className="h-4 w-4 text-white/50" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>License: {song.license || 'N/A'}. Safe to use.</p>
                                    </TooltipContent>
                                </Tooltip>
                                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handlePreviewSong(song); }} aria-label={`Play preview of ${song.title}`}>
                                    {previewingSongId === song.id ? <Pause /> : <Play />}
                                </Button>
                            </div>
                        ))
                    ) : (
                         <div className="flex items-center justify-center h-full text-center text-white/50">
                            <p>No commercially-safe songs found. Try a different search.</p>
                        </div>
                    )}
                    </TooltipProvider>
                 </div>
            </motion.div>
        )}
      </AnimatePresence>

       {/* Drafts Dialog */}
        <Dialog open={showDraftsDialog} onOpenChange={setShowDraftsDialog}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>My Drafts</DialogTitle>
                    <DialogDescription>Select a draft to continue editing, or delete it.</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-2 max-h-96 overflow-y-auto">
                    {drafts.length > 0 ? drafts.map(draft => (
                        <div key={draft.id} className="flex justify-between items-center p-2 rounded-lg hover:bg-muted">
                            <div>
                                <p className="font-semibold">Draft from {new Date(draft.createdAt).toLocaleString()}</p>
                                <p className="text-sm text-muted-foreground">{draft.segments.length} segments, {draft.segments.reduce((acc, s) => acc + s.duration, 0).toFixed(1)}s</p>
                            </div>
                            <div className='flex gap-2'>
                                <Button size="sm" onClick={() => { loadDraft(draft.id); setShowDraftsDialog(false); }} aria-label={`Load draft from ${new Date(draft.createdAt).toLocaleString()}`}>Load</Button>
                                <Button size="sm" variant="destructive" onClick={() => deleteDraft(draft.id)} aria-label={`Delete draft from ${new Date(draft.createdAt).toLocaleString()}`}><Trash2 className="h-4 w-4"/></Button>
                            </div>
                        </div>
                    )) : (
                        <p className="text-center text-muted-foreground py-8">No drafts saved yet. Click the "Save Draft" button to save your work.</p>
                    )}
                </div>
                 <DialogFooter>
                    <Button onClick={handleSaveDraft}>Save Current Project as New Draft</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>


      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pb-6 flex flex-col items-center gap-4 z-10">
        
        <AnimatePresence>
        {segments.length > 0 && !showVoiceoverPanel && (
            <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                className="w-full h-20 bg-black/30 backdrop-blur-sm rounded-lg p-2 flex items-center gap-2 overflow-x-auto no-scrollbar"
                aria-label="Recorded segments timeline"
            >
                <Reorder.Group axis="x" values={segments} onReorder={setSegments} className="flex items-center gap-2">
                    <AnimatePresence>
                        {segments.map((seg, index) => (
                           <motion.div key={seg.id} layout className="flex items-center">
                             <SegmentThumbnail segment={seg} onRemove={removeSegment} onTrim={handleOpenTrim} />
                             {index < segments.length - 1 && <TransitionButton />}
                           </motion.div>
                        ))}
                    </AnimatePresence>
                </Reorder.Group>
            </motion.div>
        )}
        </AnimatePresence>

        {/* Roller Panel & Voiceover Panel */}
        <AnimatePresence>
            {(showFiltersPanel || showVFXPanel) && (
                 <motion.div
                    key={showFiltersPanel ? "filters-panel" : "vfx-panel"}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="w-full h-10 flex justify-center items-center relative overflow-hidden"
                >
                     <div 
                        className="flex gap-x-8 items-center overflow-x-auto pb-2 no-scrollbar"
                    >
                        {(showFiltersPanel ? FILTERS : VFX_FILTERS).map((item) => (
                            <button 
                                key={item.id} 
                                className="flex-shrink-0"
                                onClick={() => showFiltersPanel ? setActiveFilter(item.id) : setActiveVFX(item.id)}
                            >
                                <span className={cn(
                                    "text-sm font-semibold transition-all duration-200 text-white/50",
                                    (showFiltersPanel && activeFilter === item.id) && "text-white scale-125",
                                    (showVFXPanel && activeVFX === item.id) && "text-white scale-125",
                                )}>
                                    {item.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </motion.div>
            )}
             {showVoiceoverPanel && (
                 <motion.div
                    key="voiceover-panel"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="w-full h-32 bg-black/30 backdrop-blur-sm rounded-lg p-2 flex flex-col items-center justify-center gap-2"
                >
                    <h3 className="text-sm font-semibold">Voiceover</h3>
                    <div className="w-full h-10 bg-gray-600/50 rounded-lg relative overflow-hidden">
                        {segments.map((segment, index) => {
                            const left = (segments.slice(0, index).reduce((acc, s) => acc + s.duration, 0) / totalDuration) * 100;
                            const width = (segment.duration / totalDuration) * 100;
                            return <div key={segment.id} className="absolute h-full bg-purple-500/30" style={{ left: `${left}%`, width: `${width}%` }}></div>
                        })}
                        {voiceoverBlob && (
                            <div className="absolute h-full bg-red-500/50" style={{ width: `100%` }}></div>
                        )}
                         <div className="absolute top-0 h-full w-1 bg-white" style={{ left: `${(voiceoverPlaybackTime / totalDuration) * 100}%` }}></div>
                    </div>
                     <Button 
                        onClick={isRecordingVoice ? stopVoiceRecording : startVoiceRecording}
                        variant={isRecordingVoice ? 'destructive' : 'secondary'}
                        className="mt-2"
                    >
                        {isRecordingVoice ? <><Pause className="mr-2"/> Stop</> : <><Mic className="mr-2"/> Record Voice</>}
                    </Button>
                </motion.div>
             )}
        </AnimatePresence>

        <div className="w-full flex items-center justify-around">
             <div className="w-24 flex justify-start">
                 <Button variant="ghost" className="text-white flex-col h-auto gap-1" onClick={() => setShowMusicDialog(true)} aria-label="Add a song">
                     <Music />
                     <span className="text-xs truncate max-w-[60px]" aria-hidden="true">{selectedSong?.title || "Add Song"}</span>
                 </Button>
             </div>

            <div className="relative flex items-center justify-center">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
                    <circle cx="50" cy="50" r="45" stroke="rgba(255,255,255,0.2)" strokeWidth="4" fill="none" />
                    <motion.circle
                        cx="50"
                        cy="50"
                        r="45"
                        stroke="#8B5CF6" // purple-500
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={2 * Math.PI * 45}
                        strokeDashoffset={2 * Math.PI * 45 * (1 - progressPercentage / 100)}
                        transition={{ duration: 0.1, ease: "linear" }}
                    />
                    <motion.circle
                        cx="50"
                        cy="50"
                        r="45"
                        stroke="#A78BFA" // purple-400
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={2 * Math.PI * 45}
                        strokeDashoffset={2 * Math.PI * 45 * (1 - (progressPercentage + currentSegmentProgress))}
                        className={cn({ "animate-pulse": isRecording })}
                        transition={{ duration: 0.1, ease: "linear" }}
                    />
                </svg>
                <div 
                    className="absolute"
                    onMouseDown={startRecording}
                    onMouseUp={stopRecording}
                    onTouchStart={(e) => { e.preventDefault(); startRecording(); }}
                    onTouchEnd={(e) => { e.preventDefault(); stopRecording(); }}
                    role="button"
                    aria-label={isRecording ? "Stop recording" : "Hold to record video"}
                >
                    <CameraButton isRecording={isRecording} />
                </div>
            </div>
            
            <div className="w-24 flex items-center justify-end gap-2">
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="video/*" className="hidden" />
                 <Button variant="ghost" className="text-white flex-col h-auto gap-1" onClick={() => fileInputRef.current?.click()} aria-label="Upload from gallery">
                     <GalleryHorizontalEnd />
                     <span className="text-xs" aria-hidden="true">Upload</span>
                 </Button>
                <div className="flex flex-col gap-1">
                  <Button variant="ghost" className="text-white flex-col h-auto gap-1" onClick={() => { loadDrafts(); setShowDraftsDialog(true); }} aria-label="Open saved drafts">
                       <FolderClock />
                       <span className="text-xs" aria-hidden="true">Drafts</span>
                   </Button>
                </div>
            </div>
        </div>
      </div>

       {/* Hidden video element for voiceover preview */}
      {showVoiceoverPanel && (
        <video
            ref={voiceoverPreviewVideoRef}
            src={segments.length > 0 ? segments[0].dataUri : undefined}
            onLoadedMetadata={() => {
                // This is a simplification. A real implementation would need a more robust
                // way to chain the videos together to play through the whole timeline.
                if (voiceoverPreviewVideoRef.current) {
                    voiceoverPreviewVideoRef.current.muted = true;
                }
            }}
            className="absolute -top-full"
            playsInline
        />
      )}
    </motion.div>
  );
}
