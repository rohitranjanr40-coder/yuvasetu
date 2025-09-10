
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShortVideoCard } from "@/components/video/short-video-card";
import { VideoCard } from "@/components/video/video-card";
import { shorts, videos } from "@/lib/data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatDistanceToNow } from 'date-fns';
import { Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

interface TestDraft {
  id: string;
  subject: string;
  questions: any[];
  createdAt: string;
}

function VideosPageContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'live';
  const [testDrafts, setTestDrafts] = useState<TestDraft[]>([]);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  const liveEduVideos = videos.filter(v => v.category === 'Education' && v.live);
  const uploadedEduVideos = videos.filter(v => v.category === 'Education' && !v.live);
  const eduShorts = shorts.slice(0, 12);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      try {
        const drafts = JSON.parse(localStorage.getItem('testDrafts') || '[]');
        setTestDrafts(drafts);
      } catch (error) {
        console.error("Failed to parse test drafts from localStorage:", error);
      }
    }
  }, [isClient]);

  const handleDeleteDraft = (draftId: string) => {
    if (!isClient) return;
    try {
        const updatedDrafts = testDrafts.filter(draft => draft.id !== draftId);
        localStorage.setItem('testDrafts', JSON.stringify(updatedDrafts));
        setTestDrafts(updatedDrafts);
        toast({
            title: 'Draft Deleted',
            description: 'The test draft has been successfully deleted.'
        });
    } catch (error) {
        console.error('Failed to delete draft:', error);
        toast({
            variant: 'destructive',
            title: 'Operation Failed',
            description: 'Could not delete the test draft.'
        });
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight font-headline">All Educational Content</h1>
        <p className="mt-2 text-lg text-muted-foreground">Browse all available courses, lessons, and materials.</p>
      </div>

      <Tabs defaultValue={initialTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="live">Live Videos</TabsTrigger>
          <TabsTrigger value="uploaded">Uploaded Videos</TabsTrigger>
          <TabsTrigger value="reels">Reels</TabsTrigger>
          <TabsTrigger value="playlists">Playlists</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="test-draft">Test Drafts</TabsTrigger>
        </TabsList>
        <TabsContent value="live" className="mt-6">
          <section className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-4 font-headline">Live Now</h2>
              {liveEduVideos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {liveEduVideos.map((video) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardHeader>
                      <CardTitle>Nothing Live</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="text-muted-foreground">There are no live educational sessions at the moment. Please check back later!</p>
                  </CardContent>
                </Card>
              )}
            </div>
            
            <Separator />

            <div>
               <h2 className="text-2xl font-bold tracking-tight mb-4 font-headline">Recorded Live Streams</h2>
               {uploadedEduVideos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {uploadedEduVideos.map((video) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>No Recordings Yet</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Recordings of past live streams will appear here.</p>
                  </CardContent>
                </Card>
              )}
            </div>

          </section>
        </TabsContent>
        <TabsContent value="uploaded" className="mt-6">
          <section>
            {uploadedEduVideos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {uploadedEduVideos.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            ) : (
              <Card>
                <CardHeader>
                    <CardTitle>Coming Soon</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">No courses available yet. Please check back later!</p>
                </CardContent>
              </Card>
            )}
          </section>
        </TabsContent>
        <TabsContent value="reels" className="mt-6">
           <section>
            {eduShorts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
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
          </section>
        </TabsContent>
        <TabsContent value="playlists" className="mt-6">
          <section>
            <Card>
              <CardHeader>
                  <CardTitle>Coming Soon</CardTitle>
              </CardHeader>
              <CardContent>
                  <p className="text-muted-foreground">Playlists are coming soon. Check back later to find curated collections of your favorite topics!</p>
              </CardContent>
            </Card>
          </section>
        </TabsContent>
        <TabsContent value="posts" className="mt-6">
          <section>
            <Card>
              <CardHeader>
                  <CardTitle>Coming Soon</CardTitle>
              </CardHeader>
              <CardContent>
                  <p className="text-muted-foreground">Posts from educators will appear here. Check back later for articles, updates, and more!</p>
              </CardContent>
            </Card>
          </section>
        </TabsContent>
        <TabsContent value="test-draft" className="mt-6">
          <section>
             {!isClient ? (
                <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8">
                    <Loader2 className="h-12 w-12 mb-4 animate-spin"/>
                    <h2 className="text-xl font-semibold">Loading Drafts...</h2>
                </div>
             ) : testDrafts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {testDrafts.map((draft) => (
                  <Card key={draft.id}>
                    <CardHeader>
                      <CardTitle className="truncate">{draft.subject || 'Untitled Test'}</CardTitle>
                      <CardDescription>
                        {draft.questions.length} question{draft.questions.length === 1 ? '' : 's'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isClient && (
                           <p className="text-sm text-muted-foreground">
                                Saved {formatDistanceToNow(new Date(draft.createdAt), { addSuffix: true })}
                            </p>
                        )}
                    </CardContent>
                    <div className="flex justify-end items-center p-4 pt-0 gap-2">
                      <Button variant="destructive" size="icon" onClick={() => handleDeleteDraft(draft.id)}>
                        <Trash2 className="h-4 w-4"/>
                        <span className="sr-only">Delete</span>
                      </Button>
                      <Button asChild>
                          <Link href={`/educational/test?draftId=${draft.id}`}>Continue Editing</Link>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardHeader>
                    <CardTitle>No Test Drafts</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Your saved test drafts will appear here. Start creating a new test to see your drafts.</p>
                </CardContent>
              </Card>
            )}
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}


export default function EduVideosPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VideosPageContent />
    </Suspense>
  )
}
