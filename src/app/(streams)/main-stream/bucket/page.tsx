
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VideoCard } from '@/components/video/video-card';
import { Loader2, Trash2, Home, Scissors, Podcast } from 'lucide-react';
import type { Video as VideoType, ClipTickDraft } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { getVideos, getClipTickDraftsByUserId, deleteClipTickDraft } from '@/lib/actions';

function MainStreamBucketContent() {
  const [userVideos, setUserVideos] = useState<VideoType[]>([]);
  const [clipDrafts, setClipDrafts] = useState<(ClipTickDraft & { id: number })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  const loadData = async () => {
      if (!user) {
          setIsLoading(false);
          return;
      }
      setIsLoading(true);
      
      try {
        const [allVideos, draftData] = await Promise.all([
          getVideos(),
          getClipTickDraftsByUserId(user.id)
        ]);

        const filteredUserVideos = allVideos.filter(v => v.userId === user.id);
        setUserVideos(filteredUserVideos as VideoType[]);
        
        setClipDrafts(draftData as (ClipTickDraft & { id: number })[]);

      } catch (error) {
        console.error('Failed to load data:', error);
        toast({ variant: 'destructive', title: 'Failed to load bucket items.'});
      } finally {
        setIsLoading(false);
      }
    }

  useEffect(() => {
    if (!authLoading) {
      loadData();
    }
  }, [user, authLoading]);
  
  const handleDeleteDraft = async (id: number) => {
    if(!user) return;
    try {
        const result = await deleteClipTickDraft(id, user.id);
        if (result.success) {
            setClipDrafts(prev => prev.filter(d => d.id !== id));
            toast({ title: 'Draft Deleted' });
        } else {
            throw new Error(result.error);
        }
    } catch(e: any) {
        toast({ variant: 'destructive', title: 'Failed to delete draft.', description: e.message });
    }
  };

  if (isLoading || authLoading) {
    return (
        <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  if (!user) {
    return (
        <div className="text-center py-16">
            <h2 className="text-2xl font-semibold">Please Log In</h2>
            <p className="text-muted-foreground mt-2">You need to be logged in to view your bucket.</p>
        </div>
    )
  }

  const liveRecordings = userVideos.filter(v => v.live);
  const uploadedVods = userVideos.filter(v => !v.live);

  return (
    <div className="space-y-8">
        <div className="text-center">
            <Home className="h-12 w-12 mx-auto text-primary" />
            <h1 className="text-4xl font-bold tracking-tight font-headline mt-4">My Uploads & Drafts</h1>
            <p className="mt-2 text-lg text-muted-foreground">
            Your published videos, live recordings, and short-form video drafts.
            </p>
        </div>
        <Tabs defaultValue="uploads" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="uploads">
                    <Home className="mr-2 h-4 w-4" />
                    My Content
                </TabsTrigger>
                <TabsTrigger value="cliptick">
                    <Scissors className="mr-2 h-4 w-4" />
                    Clip Drafts
                </TabsTrigger>
            </TabsList>
            
            <TabsContent value="uploads" className="mt-6 space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Podcast /> Live Recordings</CardTitle>
                        <CardDescription>All the live streams you have recorded on the platform.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {liveRecordings.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {liveRecordings.map((video) => (
                                    <VideoCard key={video.id} videoId={video.id as number} />
                                ))}
                            </div>
                        ) : (
                             <p className="text-muted-foreground text-center py-8">
                                You haven't recorded any live streams yet.
                            </p>
                        )}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Uploaded Videos</CardTitle>
                        <CardDescription>Standard videos you have uploaded.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {uploadedVods.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {uploadedVods.map((video) => (
                                    <VideoCard key={video.id} videoId={video.id as number} />
                                ))}
                            </div>
                        ) : (
                             <p className="text-muted-foreground text-center py-8">
                                You haven't uploaded any videos yet.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="cliptick" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>My Clip Drafts</CardTitle>
                        <CardDescription>Your unfinished short video projects.</CardDescription>
                    </CardHeader>
                    <CardContent>
                    {clipDrafts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {clipDrafts.map((draft) => (
                            <Card key={draft.id}>
                                <CardHeader>
                                    <CardTitle className="truncate">Draft from {new Date(draft.createdAt).toLocaleDateString()}</CardTitle>
                                    <CardDescription>
                                        {draft.segments.length} segment{draft.segments.length === 1 ? '' : 's'} &bull; {draft.segments.reduce((acc, s) => acc + s.duration, 0).toFixed(1)}s
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground truncate">
                                        {draft.caption || 'No caption'}
                                    </p>
                                </CardContent>
                                <div className="flex justify-end items-center p-4 pt-0 gap-2">
                                    <Button variant="destructive" size="icon" onClick={() => handleDeleteDraft(draft.id)} aria-label={`Delete draft from ${new Date(draft.createdAt).toLocaleDateString()}`}>
                                        <Trash2 className="h-4 w-4"/>
                                    </Button>
                                    <Button asChild>
                                        <Link href={`/main-stream/cliptick?draftId=${draft.id}`}>Continue Editing</Link>
                                    </Button>
                                </div>
                            </Card>
                        ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-8">
                        You haven't saved any ClipTick drafts yet.
                        </p>
                    )}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}


export default function MainStreamBucketPage() {
    return <MainStreamBucketContent />
}
