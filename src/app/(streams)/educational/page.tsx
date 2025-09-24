
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { VideoCard } from "@/components/video/video-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, Search } from "lucide-react";
import { getVideos } from '@/lib/actions';
import type { Video } from '@/types';

function EducationalPageContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q')?.toLowerCase() || '';

  const [allVideos, setAllVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
        setLoading(true);
        const videoData = await getVideos();
        setAllVideos(videoData as unknown as Video[]);
        setLoading(false);
    }
    fetchData();
  }, []);

  
  const allEducationalVideos = allVideos.filter(v => v.category === 'Education');

  const filteredVideos = searchQuery
    ? allEducationalVideos.filter(v =>
        v.title?.toLowerCase().includes(searchQuery) ||
        v.channelName?.toLowerCase().includes(searchQuery)
      )
    : allEducationalVideos;

  if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
  }

  if (searchQuery && filteredVideos.length === 0) {
     return (
        <div className="text-center py-24">
            <Search className="h-16 w-16 mx-auto text-muted-foreground" />
            <h2 className="mt-4 text-2xl font-semibold">No Results Found in Educational Hub</h2>
            <p className="mt-2 text-muted-foreground">
                Your search for "{searchQuery}" did not match any courses.
            </p>
        </div>
     )
  }

  const featuredVideo = !searchQuery ? filteredVideos[0] : undefined;

  return (
    <div className="space-y-8">
      {searchQuery ? (
        <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight font-headline">
                {`Results for "${searchQuery}"`}
            </h1>
        </div>
      ) : (
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight font-headline">Educational Hub</h1>
          <p className="mt-2 text-lg text-muted-foreground">Learn, grow, and achieve your goals.</p>
        </div>
      )}

      {featuredVideo && (
        <section>
            <h2 className="text-3xl font-bold tracking-tight mb-6 font-headline">Featured Course</h2>
            <VideoCard videoId={featuredVideo.id as number} isFeatured />
        </section>
      )}

       {!featuredVideo && !searchQuery && (
          <Card>
              <CardHeader>
                  <CardTitle>No Courses Available</CardTitle>
              </CardHeader>
              <CardContent>
                  <p className="text-muted-foreground">There are currently no educational courses. Check back later!</p>
              </CardContent>
          </Card>
       )}
    </div>
  );
}

export default function EducationalPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        }>
            <EducationalPageContent />
        </Suspense>
    )
}
