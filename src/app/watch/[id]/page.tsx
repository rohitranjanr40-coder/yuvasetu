
import { VideoPlayer } from "@/components/video/video-player";
import { videos, users, comments } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Share2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ContentSuggestion } from "@/components/ai/content-suggestion";
import { AdPlaceholder } from "@/components/shared/ad-placeholder";

export async function generateStaticParams() {
  // We are stripping "vid-" from the id, because the page param is just the number
  return videos.map((video) => ({
    id: video.id.replace('vid-', ''),
  }));
}

export default function WatchPage({ params }: { params: { id: string } }) {
  const video = videos.find((v) => v.id === `vid-${params.id}`) || videos[0];
  const user = users.find(u => u.name === video.channelName) || users[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
      <div className="lg:col-span-2 xl:col-span-3 space-y-6">
        <VideoPlayer thumbnailUrl={video.thumbnailUrl} title={video.title} />
        
        <div className="bg-card border rounded-lg p-4 md:p-6">
          <h1 className="text-xl md:text-2xl font-bold font-headline leading-tight">{video.title}</h1>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="user avatar" />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.subscribers.toLocaleString()} subscribers</p>
              </div>
              <Button variant="outline">Follow</Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" className="gap-2">
                <ThumbsUp />
                <span>{Math.floor(video.views / 20)}</span>
              </Button>
              <Button variant="ghost" className="gap-2">
                <ThumbsDown />
              </Button>
              <Button variant="ghost" className="gap-2">
                <Share2 />
                <span>Share</span>
              </Button>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="text-sm text-foreground/80">
            <p className="font-semibold">{video.views.toLocaleString()} views &bull; {video.uploadedAt}</p>
            <p className="mt-2">
              This is a sample description for the video. Here creators can add more details, links, and information about their content.
            </p>
          </div>
        </div>
        
        <div className="bg-card border rounded-lg p-4 md:p-6">
          <h2 className="text-lg font-bold font-headline mb-4">{comments.length} Comments</h2>
          <div className="flex items-start gap-4">
             <Avatar>
                <AvatarImage src="https://placehold.co/40x40.png" alt="Your avatar" data-ai-hint="user avatar" />
                <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="w-full space-y-2">
                <Textarea placeholder="Add a comment..." />
                <div className="flex justify-end">
                    <Button>Comment</Button>
                </div>
            </div>
          </div>
          <Separator className="my-6" />
          <div className="space-y-6">
            {comments.map(comment => (
              <div key={comment.id} className="flex items-start gap-4">
                <Avatar>
                    <AvatarImage src={comment.user.avatarUrl} alt={comment.user.name} data-ai-hint="user avatar" />
                    <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <div className="flex items-baseline gap-2">
                        <p className="font-semibold text-sm">{comment.user.name}</p>
                        <p className="text-xs text-muted-foreground">{comment.timestamp}</p>
                    </div>
                    <p>{comment.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <aside className="lg:col-span-1 xl:col-span-1 space-y-6">
        <AdPlaceholder />
        <ContentSuggestion currentVideoId={video.id} />
      </aside>
    </div>
  );
}
