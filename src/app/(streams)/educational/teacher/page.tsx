
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideoCard } from "@/components/video/video-card";
import { videos } from "@/lib/data";
import { Separator } from "@/components/ui/separator";
import { ClassScheduler } from "@/components/educational/class-scheduler";
import { NotesEditor } from "@/components/educational/notes-editor";

export default function TeacherPortalPage() {
  const liveEduVideos = videos.filter(v => v.category === 'Education' && v.live);
  const uploadedEduVideos = videos.filter(v => v.category === 'Education' && !v.live);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight font-headline">Teacher Portal</h1>
        <p className="mt-2 text-lg text-muted-foreground">Manage your content and engage with your students.</p>
      </div>

      <Tabs defaultValue="live" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="live">Live</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="live" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
                <h2 className="text-2xl font-bold tracking-tight font-headline">Live Now</h2>
                {liveEduVideos.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {liveEduVideos.map((video) => (
                        <VideoCard key={video.id} video={video} />
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
                 {uploadedEduVideos.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {uploadedEduVideos.map((video) => (
                        <VideoCard key={video.id} video={video} />
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
            <div className="md:col-span-1">
                 <Card>
                    <CardContent className="p-6">
                        <ClassScheduler />
                    </CardContent>
                </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="courses" className="mt-6">
           <section className="space-y-8">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight mb-4 font-headline">Your Uploaded Courses</h2>
                    {uploadedEduVideos.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {uploadedEduVideos.map((video) => (
                        <VideoCard key={video.id} video={video} />
                        ))}
                    </div>
                    ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>No Courses Uploaded</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">You haven't uploaded any courses yet. Go to the upload page to get started!</p>
                        </CardContent>
                    </Card>
                    )}
                </div>
                 <div>
                    <h2 className="text-2xl font-bold tracking-tight mb-4 font-headline">Recorded Live Streams</h2>
                    {uploadedEduVideos.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {uploadedEduVideos.map((video) => (
                            <VideoCard key={video.id} video={video} />
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
