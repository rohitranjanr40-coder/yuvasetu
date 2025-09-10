import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

interface VideoPlayerProps {
    thumbnailUrl: string;
    title: string;
}

export function VideoPlayer({ thumbnailUrl, title }: VideoPlayerProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="aspect-video w-full bg-black flex items-center justify-center">
            {/* In a real app, this would be a <video> element or a player library like Plyr/Video.js */}
            <Image 
                src={thumbnailUrl} 
                alt={title} 
                width={1280} 
                height={720} 
                className="w-full h-full object-cover"
                data-ai-hint="video player"
                priority
            />
        </div>
      </CardContent>
    </Card>
  );
}
