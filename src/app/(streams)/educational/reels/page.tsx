
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShortVideoCard } from "@/components/video/short-video-card";
import { shorts } from "@/lib/data";
import { PlaySquare } from "lucide-react";

export default function EduReelsPage() {
    const eduShorts = shorts.slice(0, 12);
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-center gap-2 text-center">
        <PlaySquare className="h-9 w-9 text-primary" />
        <h1 className="text-4xl font-bold tracking-tight font-headline">Edu Reels</h1>
      </div>
      {eduShorts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {eduShorts.map((short) => (
                <ShortVideoCard key={short.id} short={short} />
            ))}
        </div>
      ) : (
        <Card>
            <CardHeader>
                <CardTitle>Coming Soon</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">No Edu Reels available yet. Please check back later!</p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
