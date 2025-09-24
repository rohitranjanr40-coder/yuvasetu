
import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VideoCard } from "@/components/video/video-card";
import { getVideos } from '@/lib/actions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import type { Video } from '@/types';
import { TestDraftsTab } from '@/components/educational/test-drafts-tab';
import { Loader2 } from 'lucide-react';
import { ReadonlyURLSearchParams } from 'next/navigation';

async function VideosPageContent({ searchParams }: { searchParams: ReadonlyURLSearchParams }) {
  const initialTab = searchParams.get('tab') || 'live';
  
  const allVideos = await getVideos() as Video[];

  const liveEduVideos = allVideos.filter(v => v.category === 'Education' && v.live);
  const uploadedEduVideos = allVideos.filter(v => v.category === 'Education' && !v.live);
  
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight font-headline">All Educational Content</h1>
        <p className="mt-2 text-lg text-muted-foreground">Browse all available courses, lessons, and materials.</p>
      </div>
      <Tabs defaultValue={initialTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="live">Live Videos</TabsTrigger>
          <TabsTrigger value="uploaded">Uploaded Videos</TabsTrigger>
          <TabsTrigger value="playlists">Playlists</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
        </TabsList>
        <TabsContent value="live" className="mt-6">
          <section className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-4 font-headline">Live Now</h2>
              {liveEduVideos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                      <p className="text-muted-foreground">There are no live educational sessions at the moment. Please check back later!</p>
                  </CardContent>
                </Card>
              )}
            </div>
            
            <Separator />

            <div>
               <h2 className="text-2xl font-bold tracking-tight mb-4 font-headline">Recorded Live Streams</h2>
               {uploadedEduVideos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {uploadedEduVideos.map((video) => (
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

          </section>
        </TabsContent>
        <TabsContent value="uploaded" className="mt-6">
          <section>
            {uploadedEduVideos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {uploadedEduVideos.map((video) => (
                  <VideoCard key={video.id} videoId={video.id as number} />
                ))}
              </div>
            ) : (
              <Card>
                <CardHeader>
                    <CardTitle>Coming Soon</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">No courses available yet. Please check back later!</p>
                </CardContent>
              </Card>
            )}
          </section>
        </TabsContent>
        <TabsContent value="playlists" className="mt-6">
          <section>
            <Card>
              <CardHeader>
                  <CardTitle>Coming Soon</CardTitle>
              </CardHeader>
              <CardContent>
                  <p className="text-muted-foreground">Playlists are coming soon. Check back later to find curated collections of your favorite topics!</p>
              </CardContent>
            </Card>
          </section>
        </TabsContent>
        <TabsContent value="posts" className="mt-6">
          <section>
            <Card>
              <CardHeader>
                  <CardTitle>Coming Soon</CardTitle>
              </CardHeader>
              <CardContent>
                  <p className="text-muted-foreground">Posts from educators will appear here. Check back later for articles, updates, and more!</p>
              </CardContent>
            </Card>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}


export default function EduVideosPage({ searchParams }: { searchParams: ReadonlyURLSearchParams }) {
  return (
    <Suspense fallback={
        <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    }>
      <VideosPageContent searchParams={searchParams} />
    </Suspense>
  )
}
