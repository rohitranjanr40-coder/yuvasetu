
'use client';

import Image from "next/image";
import Link from "next/link";
import type { Video } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface VideoCardProps {
  video: Video;
  isFeatured?: boolean;
}

export function VideoCard({ video, isFeatured = false }: VideoCardProps) {
  return (
    <Link href={`/watch/${video.id.replace('vid-', '')}`} className="group block">
      <Card className={cn("overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1", isFeatured ? "flex flex-col md:flex-row" : "flex flex-col")}>
        <div className={cn("relative", isFeatured ? "md:w-1/2" : "")}>
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            width={isFeatured ? 800 : 400}
            height={isFeatured ? 450 : 225}
            className="w-full h-auto object-cover aspect-video"
            data-ai-hint="video thumbnail"
          />
          {video.live && <Badge className="absolute top-2 right-2 bg-red-600 text-white">LIVE</Badge>}
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {video.duration}
          </div>
        </div>

        <div className={cn("flex flex-col", isFeatured ? "md:w-1/2" : "")}>
            <CardHeader className={cn(isFeatured ? "p-6" : "p-4")}>
              <h3 className={cn("font-semibold leading-snug group-hover:text-primary transition-colors", isFeatured ? "text-2xl font-headline" : "text-base truncate")}>
                {video.title}
              </h3>
            </CardHeader>
            <CardContent className={cn("flex-grow", isFeatured ? "px-6" : "p-4 pt-0")}>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={video.channelAvatarUrl} alt={video.channelName} data-ai-hint="channel avatar"/>
                  <AvatarFallback>{video.channelName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{video.channelName}</p>
                  <p className="text-xs text-muted-foreground">
                    {video.views.toLocaleString()} views &bull; {video.uploadedAt}
                  </p>
                </div>
              </div>
            </CardContent>
          </div>
      </Card>
    </Link>
  );
}
