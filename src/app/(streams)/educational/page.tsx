
'use client';

import { VideoCard } from "@/components/video/video-card";
import { videos } from "@/lib/data";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function EducationalPage() {
  const educationalVideos = videos.filter(v => v.category === 'Education');
  const featuredVideo = educationalVideos[0];
  const otherVideos = educationalVideos.slice(1, 5);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight font-headline">Educational Hub</h1>
        <p className="mt-2 text-lg text-muted-foreground">Learn, teach, and grow with our community.</p>
      </div>

      {featuredVideo && (
        <section>
            <h2 className="text-3xl font-bold tracking-tight mb-6 font-headline">Featured Course</h2>
            <VideoCard video={featuredVideo} isFeatured />
        </section>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <section>
            <h2 className="text-2xl font-bold tracking-tight mb-4 font-headline">Available Courses</h2>
            {otherVideos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {otherVideos.map((video) => (
                    <VideoCard key={video.id} video={video} />
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
             <Button variant="outline" className="w-full mt-4" asChild>
                <Link href="/educational/videos">View All Courses</Link>
            </Button>
          </section>

          <section>
            <h2 className="text-2xl font-bold tracking-tight mb-4 font-headline">Popular Tests</h2>
             <Card>
                <CardHeader>
                    <CardTitle>Coming Soon</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Popular test series will be featured here.</p>
                </CardContent>
            </Card>
          </section>
        </div>
        
        <div className="md:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>For Educators</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground text-sm">Create and share your knowledge with the community.</p>
                    <Button variant="secondary" className="w-full" asChild>
                         <Link href="/educational/test">Create a Test</Link>
                    </Button>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Top Educators</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Top educators will be featured here.</p>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
