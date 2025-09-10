
"use client";

import { useEffect, useState } from "react";
import { getSuggestedContent } from "@/lib/actions";
import { VideoCard } from "@/components/video/video-card";
import { videos as allVideos } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";

interface ContentSuggestionProps {
  currentVideoId: string;
}

export function ContentSuggestion({ currentVideoId }: ContentSuggestionProps) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSuggestions() {
      setLoading(true);
      const suggestedTitles = await getSuggestedContent({
        viewingHistory: ["Learn JavaScript in 60 Minutes", "The Future of AI"],
        interests: "Technology, Programming, Science",
      });

      // In a real app, you would fetch video details based on titles/ids
      // Here we simulate it by finding videos from our mock data
      const suggestedVideos = allVideos
        .filter((v) => suggestedTitles.includes(v.title) && v.id !== currentVideoId)
        .slice(0, 5);
      
      // If AI returns few results, fill with other videos
      if (suggestedVideos.length < 5) {
        const otherVideos = allVideos.filter(v => v.id !== currentVideoId && !suggestedTitles.includes(v.title));
        suggestedVideos.push(...otherVideos.slice(0, 5 - suggestedVideos.length));
      }

      setSuggestions(suggestedVideos);
      setLoading(false);
    }

    fetchSuggestions();
  }, [currentVideoId]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold font-headline">Recommended for You</h2>
      {loading ? (
        Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center space-x-4">
            <Skeleton className="h-20 w-32 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))
      ) : (
        <div className="space-y-4">
          {suggestions.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}
