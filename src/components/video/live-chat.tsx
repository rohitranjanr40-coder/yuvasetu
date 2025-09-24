
"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { getCommentsByVideoId } from '@/lib/actions';
import { Skeleton } from '../ui/skeleton';

type CommentWithUser = Awaited<ReturnType<typeof getCommentsByVideoId>>[0];

export function LiveChat({ videoId }: { videoId: number }) {
  const { user: loggedInUser } = useAuth();
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadComments() {
        setLoading(true);
        const fetchedComments = await getCommentsByVideoId(videoId);
        setComments(fetchedComments);
        setLoading(false);
    }
    if (videoId) {
        loadComments();
    }
  }, [videoId]);


  return (
    <Card className="flex flex-col h-full max-h-[70vh]">
      <CardHeader>
        <CardTitle>Live Chat</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-4">
            {loading ? (
                Array.from({length: 3}).map((_, i) => (
                    <div key={i} className="flex items-start gap-4">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className='space-y-2'>
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>
                ))
            ) : comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.user.avatarUrl || ''} data-ai-hint="user avatar" />
                    <AvatarFallback>{comment.user.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="font-semibold text-sm">{comment.user.name}</span>
                    <p className="text-sm text-muted-foreground">{comment.text}</p>
                  </div>
                </div>
              ))
            ) : (
                <p className="text-sm text-muted-foreground text-center py-4">Be the first to comment!</p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-center space-x-2">
          <Input id="message" placeholder={loggedInUser ? "Say something..." : "Log in to chat"} autoComplete="off" aria-label="Say something..." disabled={!loggedInUser} />
          <Button type="submit" size="icon" aria-label="Send message" disabled={!loggedInUser}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
