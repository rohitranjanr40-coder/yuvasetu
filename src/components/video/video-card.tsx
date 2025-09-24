
'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";
import type { Video as VideoType } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getVideoById, getUserById } from '@/lib/actions';
import { Skeleton } from '../ui/skeleton';

interface VideoCardProps {
  videoId: number;
  isFeatured?: boolean;
}

export function VideoCard({ videoId, isFeatured = false }: VideoCardProps) {
  const [video, setVideo] = useState<VideoType | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVideo() {
      setLoading(true);
      const videoData = await getVideoById(videoId);
      if (videoData) {
        setVideo(videoData as VideoType);
        if (videoData.userId) {
          const userData = await getUserById(videoData.userId);
          setUserAvatar(userData?.avatarUrl);
        }
      }
      setLoading(false);
    }
    fetchVideo();
  }, [videoId]);

  if (loading || !video) {
    return <VideoCardSkeleton isFeatured={isFeatured} />;
  }
  
  return (
    <Link href={`/watch/${video.id}`} className="group block">
      <Card className={cn("overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1", isFeatured ? "flex flex-col md:flex-row" : "flex flex-col")}>
        <div className={cn("relative", isFeatured ? "md:w-1/2" : "")}>
          <Image
            src={video.thumbnailUrl || `https://placehold.co/${isFeatured ? '800x450' : '400x225'}.png`}
            alt={video.title}
            width={isFeatured ? 800 : 400}
            height={isFeatured ? 450 : 225}
            className="w-full h-auto object-cover aspect-video"
            data-ai-hint="video thumbnail"
            priority={isFeatured}
          />
          {video.live && <Badge className="absolute top-2 right-2 bg-red-600 text-white">LIVE</Badge>}
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {video.duration}
          </div>
        </div>

        <div className={cn("flex flex-col", isFeatured ? "md:w-1/2" : "")}>
            <CardHeader className={cn(isFeatured ? "p-6" : "p-4")}>
              <h3 className={cn("font-semibold leading-snug transition-colors", isFeatured ? "text-2xl font-headline" : "text-base truncate group-hover:text-primary")}>
                {video.title}
              </h3>
            </CardHeader>
            <CardContent className={cn("flex-grow", isFeatured ? "px-6" : "p-4 pt-0")}>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={userAvatar} alt={video.channelName} data-ai-hint="channel avatar"/>
                  <AvatarFallback>{video.channelName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{video.channelName}</p>
                  <p className="text-xs text-muted-foreground">
                    {video.views?.toLocaleString()} views &bull; {video.createdAt ? new Date(video.createdAt).toLocaleDateString() : 'someday'}
                  </p>
                </div>
              </div>
            </CardContent>
          </div>
      </Card>
    </Link>
  );
}


function VideoCardSkeleton({ isFeatured }: { isFeatured?: boolean }) {
    if (isFeatured) {
        return (
            <Card className="flex flex-col md:flex-row">
                 <Skeleton className="h-48 md:h-auto md:w-1/2 aspect-video"/>
                 <div className="md:w-1/2 p-6 space-y-4">
                     <Skeleton className="h-8 w-3/4" />
                     <div className="flex items-center gap-3">
                         <Skeleton className="h-10 w-10 rounded-full" />
                         <div className="space-y-2">
                             <Skeleton className="h-4 w-24" />
                             <Skeleton className="h-3 w-32" />
                         </div>
                     </div>
                 </div>
            </Card>
        )
    }

    return (
        <Card className="flex flex-col space-y-3">
            <Skeleton className="h-[150px] w-full rounded-b-none" />
            <div className="p-4 pt-0 flex items-start gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                </div>
            </div>
        </Card>
    )
}
