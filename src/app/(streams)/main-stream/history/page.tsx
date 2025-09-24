
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VideoCard } from '@/components/video/video-card';
import { Loader2, History, Trash2 } from 'lucide-react';
import type { Video as VideoType } from '@/types';
import { getWatchHistory, clearWatchHistory } from '@/lib/actions';
import { useAuth } from '@/hooks/use-auth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function HistoryPage() {
  const [watchedVideos, setWatchedVideos] = useState<VideoType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user: loggedInUser, loading: authLoading } = useAuth();

  const fetchHistory = async () => {
    if (!loggedInUser) {
        setIsLoading(false);
        return;
    };
    setIsLoading(true);
    try {
      const historyVideos = await getWatchHistory(loggedInUser.id);
      setWatchedVideos(historyVideos as VideoType[]);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!authLoading) {
      fetchHistory();
    }
  }, [loggedInUser, authLoading]);

  const handleClearHistory = async () => {
    if (!loggedInUser) return;
    await clearWatchHistory(loggedInUser.id);
    setWatchedVideos([]);
  };

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
            <p className="text-muted-foreground mt-2">You need to be logged in to view your watch history.</p>
        </div>
    )
  }

  return (
    <div className="space-y-8">
        <div className="text-center">
            <History className="h-12 w-12 mx-auto text-primary" />
            <h1 className="text-4xl font-bold tracking-tight font-headline mt-4">Watch History</h1>
            <p className="mt-2 text-lg text-muted-foreground">
                Videos you've recently watched.
            </p>
        </div>
        <Card>
            <CardHeader className="flex-row items-center justify-between">
                <div>
                    <CardTitle>Your History</CardTitle>
                    <CardDescription>A list of videos you've viewed.</CardDescription>
                </div>
                 {watchedVideos.length > 0 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Clear History
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete your entire watch history. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleClearHistory}>
                            Clear History
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                )}
            </CardHeader>
            <CardContent>
                 {watchedVideos.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {watchedVideos.map((video) => (
                            <VideoCard key={video.id} videoId={video.id as number} />
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground text-center py-8">
                        Your watch history is empty. Start watching videos to build it up!
                    </p>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
