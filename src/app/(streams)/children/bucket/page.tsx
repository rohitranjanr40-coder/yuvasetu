
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { VideoCard } from '@/components/video/video-card';
import { Loader2, Baby } from 'lucide-react';
import type { Video as VideoType } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { getVideos } from '@/lib/actions';

export default function ChildrenBucketPage() {
  const [userVideos, setUserVideos] = useState<VideoType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    const loadData = async () => {
        if (!user) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        
        try {
          const allVideos = await getVideos();
          const filteredUserVideos = allVideos.filter(v => 
            v.userId === user.id && v.category === 'Children'
          );
          setUserVideos(filteredUserVideos as VideoType[]);
        } catch (error) {
          console.error('Failed to load data from server:', error);
          toast({ variant: 'destructive', title: 'Failed to load your videos.' });
        } finally {
          setIsLoading(false);
        }
      }

    if (!authLoading) {
      loadData();
    }
  }, [user, authLoading, toast]);

  if (isLoading || authLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
        <div className="text-center">
            <Baby className="h-12 w-12 mx-auto text-primary" />
            <h1 className="text-4xl font-bold tracking-tight font-headline mt-4">Children's Bucket</h1>
            <p className="mt-2 text-lg text-muted-foreground">
            Your saved videos for kids.
            </p>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Your Uploaded Videos</CardTitle>
                <CardDescription>Fun and safe content you've uploaded for children.</CardDescription>
            </CardHeader>
            <CardContent>
                 {userVideos.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {userVideos.map((video) => (
                            <VideoCard key={video.id} videoId={video.id as number} />
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground text-center py-8">
                        You haven't uploaded any videos to the Children's category yet.
                    </p>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
