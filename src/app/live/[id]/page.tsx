
import { LiveChat } from "@/components/video/live-chat";
import { VideoPlayer } from "@/components/video/video-player";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { videos, users } from "@/lib/data";
import { Heart, Users } from "lucide-react";

export async function generateStaticParams() {
  const liveVideos = videos.filter(v => v.live);
  // We are stripping "vid-" from the id, because the page param is just the number
  return liveVideos.map((video) => ({
    id: video.id.replace('vid-', ''),
  }));
}


export default function LiveStreamPage({ params }: { params: { id: string } }) {
  const video = videos.find((v) => v.id === `vid-${params.id}`) || videos.find(v => v.live);
  const user = users.find(u => u.name === video?.channelName) || users[0];

  if (!video) {
    return <div>Live stream not found.</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div className="lg:col-span-2 xl:col-span-3">
        <div className="space-y-4">
          <VideoPlayer thumbnailUrl={video.thumbnailUrl} title={video.title} />
          <div className="p-4 rounded-lg bg-card border">
            <h1 className="text-2xl font-bold font-headline">{video.title}</h1>
            <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.avatarUrl} data-ai-hint="user avatar"/>
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.subscribers.toLocaleString()} subscribers</p>
                </div>
                <Button variant="destructive">Subscribe</Button>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="outline" className="gap-2">
                  <Heart className="h-5 w-5" />
                  <span>Like</span>
                </Button>
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-5 w-5" />
                    <span>{Math.floor(video.views / 10).toLocaleString()} viewers</span>
                </div>
              </div>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
                <p>Welcome to the live stream! Don't forget to like and subscribe!</p>
            </div>
          </div>
        </div>
      </div>
      <div className="lg:col-span-1 xl:col-span-1">
        <LiveChat />
      </div>
    </div>
  );
}
