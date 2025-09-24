
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { VideoCard } from '@/components/video/video-card';
import { Loader2, Podcast } from 'lucide-react';
import type { Video as VideoType } from '@/types';
import { getVideos } from '@/lib/actions';

export default function ChildrenLivePage() {
  const [liveVideos, setLiveVideos] = useState<VideoType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLiveVideos() {
      setIsLoading(true);
      try {
        const allVideos = await getVideos();
        const activeLiveVideos = allVideos.filter(v => v.live && v.category === 'Children');
        setLiveVideos(activeLiveVideos as VideoType[]);
      } catch (error) {
        console.error('Failed to load live videos:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLiveVideos();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
        <div className="text-center">
            <Podcast className="h-12 w-12 mx-auto text-primary" />
            <h1 className="text-4xl font-bold tracking-tight font-headline mt-4">Live Now: Children</h1>
            <p className="mt-2 text-lg text-muted-foreground">
                See what's broadcasting right now for kids.
            </p>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Active Live Streams</CardTitle>
                <CardDescription>Live content specifically for children.</CardDescription>
            </CardHeader>
            <CardContent>
                 {liveVideos.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {liveVideos.map((video) => (
                            <VideoCard key={video.id} videoId={video.id as number} />
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground text-center py-8">
                        There are no active live streams for children at the moment.
                    </p>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
