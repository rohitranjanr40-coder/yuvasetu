
'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useParams, useRouter, notFound, useSearchParams } from 'next/navigation';
import type { Video as Short, User } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Play, Volume2, VolumeX, MessageSquare, Send, Music, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ReelCommentsDrawer } from '@/components/video/reel-comments-drawer';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { TickIcon } from '@/components/icons/tick-icon';
import { getVideos, getUsers, getTickedVideoIds, toggleTick } from '@/lib/actions';


interface ReelPlayerProps {
    short: Short & { user: User };
    isActive: boolean;
}

function ReelPlayer({ short, isActive }: ReelPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isTicked, setIsTicked] = useState(false);
    const { user: loggedInUser, loading: authLoading } = useAuth();
    const [isLoadingTick, setIsLoadingTick] = useState(true);

    useEffect(() => {
        async function checkInitialStatus() {
            if (!loggedInUser || authLoading) {
                setIsLoadingTick(false);
                return;
            }
            setIsLoadingTick(true);
            const tickedIds = await getTickedVideoIds(loggedInUser.id);
            setIsTicked(tickedIds.includes(short.id));
            setIsLoadingTick(false);
        }
        checkInitialStatus();
    }, [loggedInUser, authLoading, short.id]);


    const handleTickToggle = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent video pause/play
        if (!loggedInUser || isLoadingTick) return;
        
        setIsLoadingTick(true);
        const result = await toggleTick(loggedInUser.id, short.id);
        if (result.success) {
            setIsTicked(result.ticked);
        }
        setIsLoadingTick(false);
    };


    useEffect(() => {
        if (isActive) {
            videoRef.current?.play().catch(console.error);
            setIsPlaying(true);
        } else {
            videoRef.current?.pause();
            setIsPlaying(false);
        }
    }, [isActive]);

    const handlePlayPause = () => {
        if (videoRef.current?.paused) {
            videoRef.current?.play().catch(console.error);
            setIsPlaying(true);
        } else {
            videoRef.current?.pause();
            setIsPlaying(false);
        }
    };
    
    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const pct = (videoRef.current.currentTime / videoRef.current.duration) * 100;
            setProgress(pct);
        }
    };

    return (
        <div className="relative h-full w-full bg-black rounded-lg snap-start" onClick={handlePlayPause}>
            <video
                ref={videoRef}
                src={short.videoUrl || `/videos/placeholder.mp4`}
                className="w-full h-full object-contain"
                loop
                muted={isMuted}
                playsInline
                onTimeUpdate={handleTimeUpdate}
                aria-label={`Video by ${short.channelName}: ${short.title}`}
            />
            
            <div className="absolute inset-0 pointer-events-none">
                {/* --- Play/Pause Indicator --- */}
                <AnimatePresence>
                    {!isPlaying && (
                        <motion.div
                            initial={{ opacity: 0, scale: 1.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.5 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            <Play className="w-20 h-20 text-white/50" fill="white" />
                        </motion.div>
                    )}
                </AnimatePresence>
                
                {/* --- Bottom Gradient & Info --- */}
                <div className="absolute bottom-0 left-0 right-0 p-4 pt-24 bg-gradient-to-t from-black/60 to-transparent">
                     <div className="flex items-end gap-3">
                         <div className="flex-1 space-y-2">
                             <div className="flex items-center gap-2">
                                <Link href={`/profile/${short.user.id}`} className="pointer-events-auto">
                                    <h3 className="font-bold text-white text-lg drop-shadow-md">@{short.user.name.toLowerCase().replace(/ /g, '')}</h3>
                                </Link>
                                <Button size="sm" variant="outline" className={cn("h-7 px-3 pointer-events-auto", loggedInUser?.id === short.user.id && 'hidden')}>
                                    Follow
                                </Button>
                             </div>
                             <p className="text-white text-sm line-clamp-2 drop-shadow-sm">{short.title}</p>
                             <div className="flex items-center gap-2 text-white text-sm pointer-events-auto">
                                 <Music className="w-4 h-4" />
                                 <p className="truncate">Original Audio - {short.channelName}</p>
                             </div>
                         </div>
                     </div>
                </div>

                {/* --- Right Side Controls --- */}
                 <div className="absolute right-2 bottom-28 flex flex-col items-center gap-4 pointer-events-auto">
                    <Link href={`/profile/${short.user.id}`}>
                        <Avatar className="w-12 h-12 border-2 border-white">
                            <AvatarImage src={short.user.avatarUrl || ''} />
                            <AvatarFallback>{short.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                    </Link>
                    <div className="flex flex-col items-center gap-1 cursor-pointer group">
                        <Button variant="ghost" size="icon" className="w-12 h-12 rounded-full text-white bg-black/30 backdrop-blur-sm group-hover:bg-white/20 transition-colors" onClick={handleTickToggle} disabled={isLoadingTick}>
                           <TickIcon isTicked={isTicked} />
                        </Button>
                        <span className="text-sm font-semibold text-white drop-shadow-md">{((short.views || 0) * 0.1).toLocaleString('en-US', {notation: 'compact'})}</span>
                    </div>
                     <ReelCommentsDrawer commentCount={Math.round((short.views || 0) * 0.01)} />
                      <div className="flex flex-col items-center gap-1 cursor-pointer group">
                        <Button variant="ghost" size="icon" className="w-12 h-12 rounded-full text-white bg-black/30 backdrop-blur-sm group-hover:bg-white/20 transition-colors">
                           <Send className="w-7 h-7" />
                        </Button>
                        <span className="text-sm font-semibold text-white drop-shadow-md">Share</span>
                    </div>
                </div>

                 {/* --- Top Controls --- */}
                 <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center pointer-events-auto">
                     <Button variant="ghost" size="icon" asChild className="rounded-full">
                         <Link href="/main-stream">
                            <ArrowLeft className="text-white w-6 h-6"/>
                         </Link>
                     </Button>
                      <Button variant="ghost" size="icon" onClick={() => setIsMuted(!isMuted)} className="rounded-full">
                        {isMuted ? <VolumeX className="text-white w-6 h-6"/> : <Volume2 className="text-white w-6 h-6"/>}
                     </Button>
                 </div>
                
                 {/* --- Progress Bar --- */}
                 <Progress value={progress} className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 [&>div]:bg-white" />
            </div>
        </div>
    );
}


function ClipTickPlayerClient() {
    const params = useParams();
    const router = useRouter();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    
    const [shorts, setShorts] = useState<(Short & { user: User })[]>([]);
    const [currentShortIndex, setCurrentShortIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            const allVideos = (await getVideos()).filter(v => v.category === 'Short');
            const allUsers = await getUsers();
            
            const shortsWithUsers = allVideos.map(s => {
                const user = allUsers.find(u => u.id === s.userId) || allUsers[0];
                return { ...s, user: user as User };
            });
            
            const requestedId = parseInt(params.id as string, 10);
            const startIndex = shortsWithUsers.findIndex(s => s.id === requestedId);

            if (startIndex === -1) {
                if (shortsWithUsers.length > 0) {
                     router.replace(`/main-stream/cliptick/player/${shortsWithUsers[0].id}`);
                } else {
                    setIsLoading(false);
                }
                return;
            }
            
            const reorderedShorts = [
                ...shortsWithUsers.slice(startIndex),
                ...shortsWithUsers.slice(0, startIndex)
            ];
            
            setShorts(reorderedShorts as (Short & { user: User })[]);
            setIsLoading(false);
        }
        fetchData();
    }, [params.id, router]);
    
    const handleScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollTop, clientHeight } = scrollContainerRef.current;
            const newIndex = Math.round(scrollTop / clientHeight);
            if (newIndex !== currentShortIndex) {
                 setCurrentShortIndex(newIndex);
                 const newShortId = shorts[newIndex]?.id;
                 if (newShortId) {
                    window.history.replaceState(null, '', `/main-stream/cliptick/player/${newShortId}`);
                 }
            }
        }
    };
    
    if (isLoading) {
        return (
            <div className="h-screen w-screen bg-black flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
        );
    }
    
    if (shorts.length === 0) {
        return (
             <div className="h-screen w-screen bg-black flex flex-col items-center justify-center">
                <p className='text-white'>No shorts found.</p>
                 <Button asChild className='mt-4'><Link href="/main-stream">Go Home</Link></Button>
            </div>
        )
    }

    return (
        <div
            ref={scrollContainerRef}
            className="h-screen w-screen bg-black overflow-y-auto snap-y snap-mandatory no-scrollbar"
            onScroll={handleScroll}
        >
            {shorts.map((short, index) => (
                <ReelPlayer
                    key={short.id}
                    short={short}
                    isActive={index === currentShortIndex}
                />
            ))}
        </div>
    );
}

export default function ClipTickPlayerPage() {
    return (
        <Suspense fallback={
            <div className="h-screen w-screen bg-black flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
        }>
            <ClipTickPlayerClient />
        </Suspense>
    )
}
