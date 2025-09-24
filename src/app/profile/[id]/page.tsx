
'use client';

import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideoCard } from "@/components/video/video-card";
import { UserX, Loader2, PlusCircle, ListMusic } from "lucide-react";
import Link from "next/link";
import { getVideos, getUserById, getPlaylistsByUserId, createPlaylist } from "@/lib/actions";
import type { Video, User, Playlist } from "@/types";
import { FollowButton } from "./follow-button";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

function CreatePlaylistDialog({ onPlaylistCreated }: { onPlaylistCreated: () => void }) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const { user } = useAuth();
    const { toast } = useToast();

    const handleCreate = async () => {
        if (!user) {
            toast({ variant: "destructive", title: "Please log in" });
            return;
        }
        if (!name) {
            toast({ variant: "destructive", title: "Playlist name is required" });
            return;
        }

        const result = await createPlaylist(name, description, user.id);
        if (result.success) {
            toast({ title: "Playlist Created!", description: `"${name}" has been created.` });
            onPlaylistCreated();
            setOpen(false);
            setName("");
            setDescription("");
        } else {
            toast({ variant: "destructive", title: "Failed to create playlist", description: result.error });
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Playlist
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create a new playlist</DialogTitle>
                    <DialogDescription>Give your playlist a name and optional description.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="playlist-name">Playlist Name</Label>
                        <Input id="playlist-name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="playlist-description">Description (Optional)</Label>
                        <Textarea id="playlist-description" value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreate}>Create</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function ProfilePageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { user: loggedInUser } = useAuth();
  const userId = parseInt(params.id as string, 10);
  
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [userVideos, setUserVideos] = useState<Video[]>([]);
  const [userPlaylists, setUserPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfileData = useCallback(async () => {
    if (isNaN(userId)) {
        setLoading(false);
        return;
    }
    setLoading(true);
    const [userData, allVideos, playlistsData] = await Promise.all([
        getUserById(userId),
        getVideos(),
        getPlaylistsByUserId(userId),
    ]);

    if (userData) {
        setProfileUser(userData as User);
        setUserVideos((allVideos as Video[]).filter(v => v.channelName === userData.name));
        setUserPlaylists(playlistsData as Playlist[]);
    }
    setLoading(false);
  }, [userId]);


  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  if (loading) {
      return (
        <div className="flex justify-center items-center h-96">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
  }

  if (isNaN(userId)) {
      return (
        <div className="text-center py-24">
          <UserX className="h-16 w-16 mx-auto text-muted-foreground" />
          <h1 className="mt-4 text-3xl font-bold tracking-tight">Invalid User ID</h1>
        </div>
      )
  }

  if (!profileUser) {
    return (
      <div className="text-center py-24">
        <UserX className="h-16 w-16 mx-auto text-muted-foreground" />
        <h1 className="mt-4 text-3xl font-bold tracking-tight">User Not Found</h1>
        <p className="mt-2 text-lg text-muted-foreground">The profile you are looking for does not exist.</p>
        <Button asChild className="mt-6">
          <Link href="/main-stream">Go to Homepage</Link>
        </Button>
      </div>
    )
  }
  
  const defaultTab = searchParams.get('tab') || "videos";
  
  return (
    <div className="space-y-6">
      <div className="rounded-lg overflow-hidden">
        <Image
          src={`https://picsum.photos/seed/p-banner-${profileUser.id}/1200/300`}
          alt={`Profile banner for ${profileUser.name}`}
          width={1200}
          height={300}
          className="w-full h-48 object-cover"
          data-ai-hint="profile banner"
          priority
        />
        <div className="bg-card p-6 flex flex-col sm:flex-row items-center gap-6 -mt-16">
          <Avatar className="w-32 h-32 border-4 border-background ring-4 ring-primary">
            <AvatarImage src={profileUser.avatarUrl || ''} alt={profileUser.name} data-ai-hint="user avatar"/>
            <AvatarFallback className="text-4xl">{profileUser.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-3xl font-bold font-headline">{profileUser.name}</h1>
            <p className="text-muted-foreground">@{profileUser.name.toLowerCase().replace(/ /g, '')}</p>
            <p className="text-sm text-muted-foreground mt-1">{profileUser.joiners?.toLocaleString()} Joiners</p>
          </div>
          <FollowButton profileUser={profileUser} />
        </div>
      </div>
      
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="playlists">Playlists</TabsTrigger>
        </TabsList>
        <TabsContent value="videos" className="mt-6">
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {userVideos.length > 0 ? (
                userVideos.map((video) => (
                    <VideoCard key={video.id} videoId={video.id as number} />
                ))
            ) : (
                <div className="col-span-full text-center py-16 text-muted-foreground">
                    <p>{profileUser.name} hasn't uploaded any videos yet.</p>
                </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="playlists" className="mt-6">
            {loggedInUser?.id === profileUser.id && (
                <div className="flex justify-end mb-4">
                    <CreatePlaylistDialog onPlaylistCreated={fetchProfileData} />
                </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {userPlaylists.length > 0 ? (
                    userPlaylists.map((playlist) => (
                        <Link href={`/playlist/${playlist.id}`} key={playlist.id} className="group">
                             <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                                <Image
                                    src={playlist.thumbnailUrl || 'https://placehold.co/600x400.png'}
                                    alt={`Thumbnail for ${playlist.name}`}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                                     <h3 className="font-semibold text-white truncate">{playlist.name}</h3>
                                     <p className="text-xs text-white/80">{playlist.videoCount} videos</p>
                                </div>
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ListMusic className="h-10 w-10 text-white" />
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="col-span-full text-center py-16 text-muted-foreground">
                        <p>{profileUser.name} hasn't created any playlists yet.</p>
                    </div>
                )}
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}


export default function ProfilePage() {
    return (
        <Suspense fallback={
             <div className="flex justify-center items-center h-96">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        }>
            <ProfilePageContent />
        </Suspense>
    )
}
