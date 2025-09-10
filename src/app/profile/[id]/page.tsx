
'use client';

import Image from "next/image";
import { users, videos } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideoCard } from "@/components/video/video-card";
import { Rss } from "lucide-react";

export default function ProfilePage({ 
  params,
  searchParams
}: { 
  params: { id: string },
  searchParams?: { tab?: string }
}) {
  const user = users.find((u) => u.id === params.id) || users[0];
  const userVideos = videos.filter(v => v.channelName === user.name);
  const defaultTab = searchParams?.tab || "videos";

  return (
    <div className="space-y-6">
      <div className="rounded-lg overflow-hidden">
        <Image
          src="https://placehold.co/1200x300.png"
          alt={`${user.name}'s banner`}
          width={1200}
          height={300}
          className="w-full h-48 object-cover"
          data-ai-hint="profile banner"
        />
        <div className="bg-card p-6 flex flex-col sm:flex-row items-center gap-6 -mt-16">
          <Avatar className="w-32 h-32 border-4 border-background ring-4 ring-primary">
            <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="user avatar"/>
            <AvatarFallback className="text-4xl">{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-3xl font-bold font-headline">{user.name}</h1>
            <p className="text-muted-foreground">@{user.name.toLowerCase().replace(' ', '')}</p>
            <p className="text-sm text-muted-foreground mt-1">{user.subscribers.toLocaleString()} subscribers</p>
          </div>
          <Button size="lg" className="gap-2 bg-accent hover:bg-accent/90">
            <Rss className="h-5 w-5" />
            <span>Follow</span>
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="liked">Liked</TabsTrigger>
          <TabsTrigger value="playlists">Playlists</TabsTrigger>
        </TabsList>
        <TabsContent value="videos" className="mt-6">
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {userVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="liked" className="mt-6">
          <div className="text-center py-16 text-muted-foreground">
              <p>Liked videos will appear here.</p>
          </div>
        </TabsContent>
        <TabsContent value="playlists" className="mt-6">
          <div className="text-center py-16 text-muted-foreground">
              <p>Created playlists will appear here.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
