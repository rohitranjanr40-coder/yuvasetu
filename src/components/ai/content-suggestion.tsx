
"use client";

import { useEffect, useState } from "react";
import { contentSuggestionFlow } from "@/ai/flows/content-suggestion";
import { Skeleton } from "@/components/ui/skeleton";
import type { ContentSuggestionOutput } from "@/types/content-suggestion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

interface ContentSuggestionProps {
  currentVideoId: string;
}

export function ContentSuggestion({ currentVideoId }: ContentSuggestionProps) {
  const [suggestions, setSuggestions] = useState<ContentSuggestionOutput['suggestions']>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSuggestions() {
      setLoading(true);
      try {
        const result = await contentSuggestionFlow({
          topic: "Technology, Programming, Science",
          length: 3,
        });
        
        setSuggestions(result.suggestions);
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }

    fetchSuggestions();
  }, [currentVideoId]);

  return (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Lightbulb className="text-amber-400"/>
                <span>AI Video Ideas</span>
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            {loading ? (
                Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="space-y-2">
                    <Skeleton className="h-5 w-4/5" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </div>
                ))
            ) : suggestions.length > 0 ? (
                suggestions.map((idea, index) => (
                <div key={index} className="p-3 rounded-lg bg-secondary/50">
                    <h4 className="font-semibold text-sm">{idea.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{idea.outline}</p>
                </div>
                ))
            ) : (
                 <p className="text-sm text-muted-foreground text-center">Could not generate AI suggestions.</p>
            )}
        </CardContent>
    </Card>
  );
}
