
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { VideoCard } from '@/components/video/video-card';
import { Loader2 } from 'lucide-react';
import type { Video as VideoType } from '@/types';
import { useAuth } from '@/hooks/use-auth';
import { getVideos, getTickedVideoIds } from '@/lib/actions';
import { ShortVideoCard } from '@/components/video/short-video-card';
import Link from 'next/link';
import { TickVibeIcon } from '@/components/icons/tick-vibe-icon';

export default function TickVibePage() {
  const [tickedVideos, setTickedVideos] = useState<VideoType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user: loggedInUser, loading: authLoading } = useAuth();

  useEffect(() => {
    async function fetchTickedVideos() {
      if (!loggedInUser) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);

      try {
        const tickedVideoIds = await getTickedVideoIds(loggedInUser.id);
        const allVideos = await getVideos() as VideoType[];
        const userTickedVideos = allVideos.filter(v => tickedVideoIds.includes(v.id));
        setTickedVideos(userTickedVideos);
      } catch (error) {
        console.error('Failed to load ticked videos:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    if (!authLoading) {
      fetchTickedVideos();
    }
  }, [loggedInUser, authLoading]);


  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!loggedInUser) {
    return (
         <div className="text-center py-16">
            <h2 className="text-2xl font-semibold">Please Log In</h2>
            <p className="text-muted-foreground mt-2">You need to be logged in to view your TickVibes.</p>
        </div>
    )
  }
  
  const tickedShorts = tickedVideos.filter(v => v.category === 'Short');
  const tickedLongForm = tickedVideos.filter(v => v.category !== 'Short');
  const hasTickedItems = tickedVideos.length > 0;

  return (
    <div className="space-y-8">
        <div className="text-center">
            <TickVibeIcon className="h-12 w-12 mx-auto text-primary" />
            <h1 className="text-4xl font-bold tracking-tight font-headline mt-4">My TickVibes</h1>
            <p className="mt-2 text-lg text-muted-foreground">
                Your personal collection of videos that you've vibed with.
            </p>
        </div>
        
        {!hasTickedItems ? (
             <Card>
                <CardHeader>
                    <CardTitle>Your Vibe Collection is Empty</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-center py-8">
                        Click the 'Tick' button on videos you like to add them to your collection!
                    </p>
                </CardContent>
            </Card>
        ) : (
            <div className="space-y-8">
                {tickedShorts.length > 0 && (
                     <Card>
                        <CardHeader>
                            <CardTitle>Ticked Shorts</CardTitle>
                            <CardDescription>Short videos you've vibed with.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                                {tickedShorts.map((video) => (
                                    <Link key={video.id} href={`/main-stream/cliptick/player/${video.id}`}>
                                        <ShortVideoCard videoId={video.id as number} />
                                    </Link>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {tickedLongForm.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Ticked Videos</CardTitle>
                            <CardDescription>Long-form videos you've vibed with.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {tickedLongForm.map((video) => (
                                    <VideoCard key={video.id} videoId={video.id as number} />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        )}
    </div>
  );
}
