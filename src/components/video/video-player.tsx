
"use client";

import { Card, CardContent } from "@/components/ui/card";

interface VideoPlayerProps {
    videoUrl?: string; 
    title: string;
}

export function VideoPlayer({ videoUrl, title }: VideoPlayerProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="aspect-video w-full bg-black flex items-center justify-center">
            {/* In a real app, you would use a more robust video player library */}
            <video 
                key={videoUrl}
                src={videoUrl || ''} 
                controls 
                className="w-full h-full object-contain"
                aria-label={`Video player for ${title}`}
                poster={undefined}
            >
                Your browser does not support the video tag.
            </video>
        </div>
      </CardContent>
    </Card>
  );
}
