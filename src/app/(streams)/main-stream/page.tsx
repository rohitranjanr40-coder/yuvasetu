
import { Suspense } from 'react';
import { VideoCard } from "@/components/video/video-card";
import { AdPlaceholder } from "@/components/shared/ad-placeholder";
import type { Video } from "@/types";
import { ShortVideoCard } from "@/components/video/short-video-card";
import { Loader2, Search } from "lucide-react";
import { ViralIcon } from '@/components/icons/viral-icon';
import Link from 'next/link';
import { getVideos } from '@/lib/actions';

async function HomePageContent({ searchParams }: { searchParams?: { q?: string } }) {
    const searchQuery = searchParams?.q?.toLowerCase() || '';

    const allVideos = await getVideos() as unknown as Video[];
    
    let videos = allVideos.filter(v => v.category !== 'Short');
    const shorts = allVideos.filter(v => v.category === 'Short');

    if (searchQuery) {
        videos = videos.filter(v => 
            v.title.toLowerCase().includes(searchQuery) ||
            (v.channelName && v.channelName.toLowerCase().includes(searchQuery))
        );
    }
    
    if (searchQuery && videos.length === 0) {
        return (
            <div className="text-center py-24">
                <Search className="h-16 w-16 mx-auto text-muted-foreground" />
                <h2 className="mt-4 text-2xl font-semibold">No Results Found</h2>
                <p className="mt-2 text-muted-foreground">
                    Your search for "{searchQuery}" did not match any videos.
                </p>
            </div>
        )
    }

    const featuredVideo = videos[0];
    const entertainmentVideos = videos.filter(v => v.category === 'Entertainment').slice(0, 4);
    const educationVideos = videos.filter(v => v.category === 'Education').slice(0, 4);
    const musicVideos = videos.filter(v => v.category === 'Music').slice(0, 4);


    return (
        <div className="space-y-12">
        {searchQuery ? (
            <h1 className="text-3xl font-bold tracking-tight font-headline">Search results for "{searchQuery}"</h1>
        ) : (
            <section>
            <h2 className="text-3xl font-bold tracking-tight mb-6 font-headline">Featured Video</h2>
            {featuredVideo ? <VideoCard videoId={featuredVideo.id as number} isFeatured /> : null}
            </section>
        )}

        {videos.length > 0 && searchQuery && (
            <section>
                <h2 className="text-2xl font-bold tracking-tight mb-4 font-headline">Videos</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {videos.map((video: Video) => (
                    <VideoCard key={video.id} videoId={video.id as number} />
                ))}
                </div>
            </section>
        )}


        {!searchQuery && (
            <>
                <section>
                    <h2 className="text-2xl font-bold tracking-tight mb-4 font-headline">Entertainment</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {entertainmentVideos.map((video: Video) => (
                        <VideoCard key={video.id} videoId={video.id as number} />
                    ))}
                    </div>
                </section>
                
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <ViralIcon className="h-7 w-7 text-primary"/>
                        <h2 className="text-2xl font-bold tracking-tight font-headline">ViraL ClipTick</h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        {shorts.slice(0, 12).map((video) => (
                            <Link key={video.id} href={`/main-stream/cliptick/player/${video.id}`}>
                                <ShortVideoCard videoId={video.id as number} />
                            </Link>
                        ))}
                    </div>
                </section>

                <AdPlaceholder />

                <section>
                    <h2 className="text-2xl font-bold tracking-tight mb-4 font-headline">Education</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {educationVideos.map((video: Video) => (
                        <VideoCard key={video.id} videoId={video.id as number} />
                    ))}
                    </div>
                </section>
                
                <section>
                    <h2 className="text-2xl font-bold tracking-tight mb-4 font-headline">Music</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {musicVideos.map((video: Video) => (
                        <VideoCard key={video.id} videoId={video.id as number} />
                    ))}
                    </div>
                </section>
            </>
        )}
        </div>
    );
}

export default function Home({ searchParams }: { searchParams?: { q?: string } }) {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        }>
            <HomePageContent searchParams={searchParams} />
        </Suspense>
    )
}
