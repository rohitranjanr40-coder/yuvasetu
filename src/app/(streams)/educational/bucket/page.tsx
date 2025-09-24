
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VideoCard } from '@/components/video/video-card';
import { Loader2, GraduationCap, FileText } from 'lucide-react';
import type { Video as VideoType } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { TestDraftsTab } from '@/components/educational/test-drafts-tab';
import { useAuth } from '@/hooks/use-auth';
import { getVideos } from '@/lib/actions';

export default function EducationalBucketPage() {
  const [userEduVideos, setUserEduVideos] = useState<VideoType[]>([]);
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
          const filteredUserEduVideos = allVideos.filter(v => 
            v.userId === user.id && v.category === 'Education'
          );
          setUserEduVideos(filteredUserEduVideos as VideoType[]);
        } catch (error) {
          console.error('Failed to load data:', error);
          toast({ variant: 'destructive', title: 'Failed to load bucket items.' });
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
            <GraduationCap className="h-12 w-12 mx-auto text-primary" />
            <h1 className="text-4xl font-bold tracking-tight font-headline mt-4">Educational Bucket</h1>
            <p className="mt-2 text-lg text-muted-foreground">
            Your saved courses, materials, and test drafts.
            </p>
        </div>
        <Tabs defaultValue="videos" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="videos">
                    <GraduationCap className="mr-2 h-4 w-4" />
                    My Content
                </TabsTrigger>
                <TabsTrigger value="test-drafts">
                    <FileText className="mr-2 h-4 w-4" />
                    Test Drafts
                </TabsTrigger>
            </TabsList>
            <TabsContent value="videos" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>My Uploaded Courses</CardTitle>
                        <CardDescription>Educational content you've uploaded.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {userEduVideos.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {userEduVideos.map((video) => (
                                    <VideoCard key={video.id} videoId={video.id as number} />
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-center py-8">
                                You haven't uploaded any educational videos yet.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
             <TabsContent value="test-drafts" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Test Drafts</CardTitle>
                        <CardDescription>Your unfinished tests.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <TestDraftsTab />
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}
