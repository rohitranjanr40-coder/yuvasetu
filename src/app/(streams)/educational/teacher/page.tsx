
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideoCard } from "@/components/video/video-card";
import { Separator } from "@/components/ui/separator";
import { NotesEditor } from "@/components/educational/notes-editor";
import { getVideos } from "@/lib/actions";
import type { Video } from "@/types";
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function EducatorHubPage() {
  const [userVideos, setUserVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchTeacherVideos() {
        if (!user) {
            setLoading(false);
            return;
        };
        setLoading(true);
        const allVideos = await getVideos() as Video[];
        // Filter videos for the current user and educational category
        const currentUserEduVideos = allVideos.filter(v => v.userId === user.id && v.category === 'Education');
        setUserVideos(currentUserEduVideos);
        setLoading(false);
    }
    fetchTeacherVideos();
  }, [user]);

  const liveEduVideos = userVideos.filter(v => v.live);
  const recordedLiveStreams = userVideos.filter(v => !v.live && v.duration !== '00:00'); // Simple way to differentiate for now
  const uploadedVodCourses = userVideos.filter(v => !v.live && v.duration === '00:00'); // Simple way to differentiate for now

  if (loading) {
    return (
        <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }
  
  if (!user) {
      return (
           <Card>
                <CardHeader>
                    <CardTitle>Please Log In</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">You need to be logged in to view the Educator Hub.</p>
                </CardContent>
            </Card>
      )
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight font-headline">Educator Hub</h1>
        <p className="mt-2 text-lg text-muted-foreground">Manage your content and engage with your students.</p>
      </div>

      <Tabs defaultValue="live" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="live">Live</TabsTrigger>
          <TabsTrigger value="courses">Courses (VODs)</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="live" className="mt-6">
            <div className="space-y-6">
                <h2 className="text-2xl font-bold tracking-tight font-headline">Live Now</h2>
                {liveEduVideos.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {liveEduVideos.map((video) => (
                        <VideoCard key={video.id} videoId={video.id as number} />
                    ))}
                    </div>
                ) : (
                    <Card>
                    <CardHeader>
                        <CardTitle>Nothing Live</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">You are not currently live.</p>
                    </CardContent>
                    </Card>
                )}
                <Separator />
                <h2 className="text-2xl font-bold tracking-tight font-headline">Recorded Live Streams</h2>
                 {recordedLiveStreams.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recordedLiveStreams.map((video) => (
                        <VideoCard key={video.id} videoId={video.id as number} />
                    ))}
                    </div>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>No Recordings Yet</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Recordings of past live streams will appear here.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </TabsContent>

        <TabsContent value="courses" className="mt-6">
           <section className="space-y-8">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight mb-4 font-headline">Your Uploaded Courses</h2>
                    {uploadedVodCourses.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {uploadedVodCourses.map((video) => (
                        <VideoCard key={video.id} videoId={video.id as number} />
                        ))}
                    </div>
                    ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>No Courses Uploaded</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">You haven't uploaded any standard video courses yet. Use the upload page to get started!</p>
                        </CardContent>
                    </Card>
                    )}
                </div>
            </section>
        </TabsContent>

        <TabsContent value="notes" className="mt-6">
          <Card>
            <CardContent className="p-6">
                <NotesEditor />
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
