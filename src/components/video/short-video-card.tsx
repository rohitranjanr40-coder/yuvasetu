
'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { PlayCircle } from "lucide-react";
import type { Video } from "@/types";
import { getVideoById } from '@/lib/actions';
import { Skeleton } from '../ui/skeleton';

interface ShortVideoCardProps {
  videoId: number;
}

export function ShortVideoCard({ videoId }: ShortVideoCardProps) {
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchShortData() {
        setLoading(true);
        const videoData = await getVideoById(videoId);
        if(videoData) {
            setVideo(videoData as Video);
        }
        setLoading(false);
    }
    fetchShortData();
  }, [videoId]);
  
  if (loading || !video) {
    return <Skeleton className="w-full h-auto object-cover aspect-[9/16] rounded-lg" />;
  }

  return (
      <div className="group block">
        <Card className="overflow-hidden relative rounded-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <Image
            src={video.thumbnailUrl || 'https://placehold.co/300x500.png'}
            alt={video.title}
            width={300}
            height={500}
            className="w-full h-auto object-cover aspect-[9/16]"
            data-ai-hint="short video thumbnail"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-0 left-0 p-3 text-white">
            <h3 className="font-semibold text-sm leading-tight line-clamp-2">{video.title}</h3>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <PlayCircle className="h-12 w-12 text-white/80" />
          </div>
        </Card>
      </div>
  );
}
