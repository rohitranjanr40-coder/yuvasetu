
'use client';

import { VideoPlayer } from "@/components/video/video-player";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Share2, Loader2, ListPlus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ContentSuggestion } from "@/components/ai/content-suggestion";
import { AdPlaceholder } from "@/components/shared/ad-placeholder";
import { getVideoById, getUserById, addToWatchHistory, getPlaylistsByUserId, addVideoToPlaylist } from '@/lib/actions';
import type { Video as VideoType, User as UserType, Playlist } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { TickButton } from "./tick-button";
import { CommentSection } from "./comment-section";
import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { FollowButton } from "@/app/profile/[id]/follow-button";

function AddToPlaylistPopover({ videoId }: { videoId: number }) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [loading, setLoading] = useState(false);

    const handleFetchPlaylists = async () => {
        if (!user) return;
        setLoading(true);
        const userPlaylists = await getPlaylistsByUserId(user.id);
        setPlaylists(userPlaylists as Playlist[]);
        setLoading(false);
    }

    const handleAddVideo = async (playlistId: number) => {
        const result = await addVideoToPlaylist(playlistId, videoId);
        if (result.success) {
            toast({ title: "Added to playlist!" });
        } else {
            toast({ variant: 'destructive', title: "Could not add to playlist", description: result.error });
        }
    }

    return (
        <Popover onOpenChange={(open) => open && handleFetchPlaylists()}>
            <PopoverTrigger asChild>
                <Button variant="ghost" className="gap-2">
                    <ListPlus />
                    <span>Add to Playlist</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0">
                <div className="p-2 border-b">
                    <h4 className="font-medium text-sm">Save to...</h4>
                </div>
                {loading ? (
                    <div className="p-4"><Loader2 className="animate-spin" /></div>
                ) : (
                    <ScrollArea className="h-[150px]">
                        <div className="p-2 space-y-1">
                            {playlists.length > 0 ? playlists.map(p => (
                                <div key={p.id} onClick={() => handleAddVideo(p.id)} className="p-2 text-sm rounded-md hover:bg-accent cursor-pointer">
                                    {p.name}
                                </div>
                            )) : (
                                <p className="text-xs text-muted-foreground p-2">You have no playlists.</p>
                            )}
                        </div>
                    </ScrollArea>
                )}
            </PopoverContent>
        </Popover>
    )
}

function WatchPageContent() {
  const params = useParams();
  const { user: loggedInUser } = useAuth();
  const videoId = parseInt(params.id as string, 10);
  
  const [videoData, setVideoData] = useState<VideoType | null>(null);
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (isNaN(videoId)) {
      setLoading(false);
      return;
    }
    
    async function fetchData() {
        setLoading(true);
        const video = await getVideoById(videoId);
        if (video) {
            setVideoData(video as VideoType);
            if(video.userId) {
                const userData = await getUserById(video.userId);
                setUser(userData as UserType);
            }

            // Add to history via server action if user is logged in
            if (loggedInUser && loggedInUser.id) {
                await addToWatchHistory(loggedInUser.id, videoId);
            }

        }
        setLoading(false);
    }
    fetchData();
  }, [videoId, loggedInUser]);


  if (loading) {
      return <WatchPageSkeleton />;
  }
  
  if (!videoData) {
      return <div className="text-center py-10">Video not found.</div>
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
      <div className="lg:col-span-2 xl:col-span-3 space-y-6">
        <VideoPlayer 
            videoUrl={videoData.videoUrl || "/videos/placeholder.mp4"} 
            title={videoData.title} 
        />
        
        <div className="bg-card border rounded-lg p-4 md:p-6">
          <h1 className="text-xl md:text-2xl font-bold font-headline leading-tight">{videoData.title}</h1>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-4">
            {user && (
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={user.avatarUrl || ''} alt={user.name} data-ai-hint="user avatar" />
                  <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.joiners?.toLocaleString()} Joiners</p>
                </div>
                <FollowButton profileUser={user} />
              </div>
            )}
            <div className="flex items-center gap-2">
              <TickButton 
                videoId={videoData.id} 
                initialTickCount={Math.floor((videoData.views || 0) / 20)}
              />
              <Button variant="ghost" className="gap-2">
                <Share2 />
                <span>Share</span>
              </Button>
               {loggedInUser && <AddToPlaylistPopover videoId={videoId} />}
            </div>
          </div>
          <Separator className="my-4" />
          <div className="text-sm text-foreground/80">
            <p className="font-semibold">{videoData.views?.toLocaleString()} views &bull; {videoData.createdAt ? new Date(videoData.createdAt).toLocaleDateString() : 'someday'}</p>
            <p className="mt-2">
              {videoData.description || "This is a sample description for the video. Here creators can add more details, links, and information about their content."}
            </p>
          </div>
        </div>
        
        <CommentSection videoId={videoId} />
      </div>
      <aside className="lg:col-span-1 xl:col-span-1 space-y-6">
        <AdPlaceholder />
        <ContentSuggestion currentVideoId={String(videoId)} />
      </aside>
    </div>
  );
}


export default function WatchPage() {
  return (
    <Suspense fallback={<WatchPageSkeleton />}>
        <WatchPageContent />
    </Suspense>
  )
}


function WatchPageSkeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            <div className="lg:col-span-2 xl:col-span-3 space-y-6">
                <Skeleton className="aspect-video w-full rounded-lg" />
                <div className="bg-card border rounded-lg p-4 md:p-6">
                    <Skeleton className="h-8 w-3/4 mb-4" />
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-4">
                        <div className="flex items-center gap-3">
                            <Skeleton className="w-12 h-12 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-20" />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-10 w-24 rounded-md" />
                            <Skeleton className="h-10 w-24 rounded-md" />
                        </div>
                    </div>
                    <Separator className="my-4" />
                    <div className="space-y-2">
                         <Skeleton className="h-4 w-48" />
                         <Skeleton className="h-4 w-full" />
                         <Skeleton className="h-4 w-full" />
                    </div>
                </div>
                <div className="bg-card border rounded-lg p-4 md:p-6">
                    <Skeleton className="h-6 w-32 mb-6" />
                     <div className="flex items-start gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="w-full space-y-2">
                            <Skeleton className="h-20 w-full" />
                            <div className="flex justify-end">
                                <Skeleton className="h-10 w-24" />
                            </div>
                        </div>
                     </div>
                </div>
            </div>
            <aside className="lg:col-span-1 xl:col-span-1 space-y-6">
                 <Skeleton className="h-48 w-full" />
                 <div className="space-y-4">
                     <Skeleton className="h-6 w-40 mb-4" />
                     {Array.from({length: 5}).map((_, i) => (
                        <div key={i} className="flex items-center gap-4">
                           <Skeleton className="h-20 w-32 rounded-lg" />
                            <div className="space-y-2">
                               <Skeleton className="h-4 w-[150px]" />
                               <Skeleton className="h-4 w-[100px]" />
                            </div>
                        </div>
                     ))}
                 </div>
            </aside>
        </div>
    )
}
