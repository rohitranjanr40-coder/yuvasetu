
import { getVideos } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VideoCard } from "@/components/video/video-card";
import { Search } from "lucide-react";
import type { Video } from "@/types";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

async function ChildrenPageContent({ searchParams }: { searchParams?: { q?: string } }) {
  const searchQuery = searchParams?.q?.toLowerCase() || '';
  
  const allVideos = await getVideos() as Video[];
  const childrenVideos = allVideos.filter(v => v.category === 'Children');
  
  const filteredVideos = searchQuery 
    ? childrenVideos.filter(v => 
        v.title.toLowerCase().includes(searchQuery) ||
        v.channelName.toLowerCase().includes(searchQuery)
      )
    : childrenVideos;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight font-headline">
          {searchQuery ? `Results for "${searchQuery}"` : 'For Children'}
        </h1>
        {!searchQuery && <p className="mt-2 text-lg text-muted-foreground">Fun and safe content for kids.</p>}
      </div>

       {filteredVideos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredVideos.map(video => (
              <VideoCard key={video.id} videoId={video.id as number} />
            ))}
          </div>
       ) : searchQuery ? (
          <div className="text-center py-24">
            <Search className="h-16 w-16 mx-auto text-muted-foreground" />
            <h2 className="mt-4 text-2xl font-semibold">No Results Found for Children</h2>
            <p className="mt-2 text-muted-foreground">
                Your search for "{searchQuery}" did not match any videos.
            </p>
          </div>
       ) : (
        <Card>
            <CardHeader>
                <CardTitle>Coming Soon</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">This section is under construction. Check back later for fun content for children!</p>
            </CardContent>
        </Card>
       )}
    </div>
  );
}


export default function ChildrenPage({ searchParams }: { searchParams?: { q?: string } }) {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        }>
            <ChildrenPageContent searchParams={searchParams} />
        </Suspense>
    )
}
