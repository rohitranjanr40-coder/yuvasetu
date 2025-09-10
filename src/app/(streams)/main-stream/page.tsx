
'use client';

import { VideoCard } from "@/components/video/video-card";
import { AdPlaceholder } from "@/components/shared/ad-placeholder";
import { videos, shorts } from "@/lib/data";
import type { Video } from "@/types";
import { ShortVideoCard } from "@/components/video/short-video-card";
import { Flame } from "lucide-react";

export default function Home() {
  const featuredVideo = videos[0];
  const entertainmentVideos = videos.filter(v => v.category === 'Entertainment').slice(0, 4);
  const educationVideos = videos.filter(v => v.category === 'Education').slice(0, 4);
  const musicVideos = videos.filter(v => v.category === 'Music').slice(0, 4);
  const shortVideos = shorts.slice(0, 6);

  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-3xl font-bold tracking-tight mb-6 font-headline">Featured Video</h2>
        <VideoCard video={featuredVideo} isFeatured />
      </section>

      <AdPlaceholder />

      <section>
        <h2 className="text-2xl font-bold tracking-tight mb-4 font-headline">Entertainment</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {entertainmentVideos.map((video: Video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </section>
      
      <section>
         <div className="flex items-center gap-2 mb-4">
            <Flame className="h-7 w-7 text-accent" />
            <h2 className="text-2xl font-bold tracking-tight font-headline">Shorts</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {shortVideos.map((short) => (
                <ShortVideoCard key={short.id} short={short} />
            ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold tracking-tight mb-4 font-headline">Education</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {educationVideos.map((video: Video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </section>
      
      <section>
        <h2 className="text-2xl font-bold tracking-tight mb-4 font-headline">Music</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {musicVideos.map((video: Video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </section>
    </div>
  );
}
