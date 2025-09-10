import { VideoCard } from "@/components/video/video-card";
import { videos } from "@/lib/data";

export default function LivePage() {
    const liveVideos = videos.filter(v => v.live);

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold tracking-tight font-headline">Live Now</h1>
                <p className="mt-2 text-lg text-muted-foreground">Join the conversation and watch creators stream live.</p>
            </div>
            {liveVideos.length > 0 ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {liveVideos.map((video) => (
                        <VideoCard key={video.id} video={video} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <p className="text-muted-foreground">No one is currently live. Check back later!</p>
                </div>
            )}
        </div>
    )
}
