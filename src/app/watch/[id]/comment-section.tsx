
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getCommentsByVideoId } from '@/lib/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { Comment as CommentType } from '@/types';

type CommentWithUser = Omit<CommentType, 'userId'> & {
    user: {
        id: string | null;
        name: string | null;
        avatarUrl: string | null;
    }
};

export function CommentSection({ videoId }: { videoId: number }) {
    const { user: loggedInUser } = useAuth();
    const [comments, setComments] = useState<CommentWithUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadComments() {
            setLoading(true);
            const fetchedComments = await getCommentsByVideoId(videoId);
            setComments(fetchedComments as CommentWithUser[]);
            setLoading(false);
        }
        loadComments();
    }, [videoId]);

    return (
        <div className="bg-card border rounded-lg p-4 md:p-6">
            <h2 className="text-lg font-bold font-headline mb-4">{loading ? <Skeleton className="h-6 w-24" /> : `${comments.length} Comments`}</h2>
            <div className="flex items-start gap-4">
                <Avatar>
                    {loggedInUser ? (
                    <>
                        <AvatarImage src={loggedInUser.avatarUrl || ''} alt={loggedInUser.name || ''} data-ai-hint="user avatar" />
                        <AvatarFallback>{loggedInUser.name.charAt(0)}</AvatarFallback>
                    </>
                    ) : (
                    <AvatarFallback>U</AvatarFallback>
                    )}
                </Avatar>
                <div className="w-full space-y-2">
                    <Textarea placeholder="Add a comment..." disabled={!loggedInUser} />
                    <div className="flex justify-end">
                        <Button disabled={!loggedInUser}>Comment</Button>
                    </div>
                </div>
            </div>
            <Separator className="my-6" />
            <div className="space-y-6">
                {loading ? (
                    Array.from({length: 3}).map((_, i) => (
                        <div key={i} className="flex items-start gap-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className='space-y-2'>
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-4 w-48" />
                            </div>
                        </div>
                    ))
                ) : (
                    comments.map(comment => (
                        <div key={comment.id} className="flex items-start gap-4">
                            <Avatar>
                                <AvatarImage src={comment.user.avatarUrl || ''} alt={comment.user.name || ''} data-ai-hint="user avatar" />
                                <AvatarFallback>{comment.user.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="flex items-baseline gap-2">
                                    <p className="font-semibold text-sm">{comment.user.name}</p>
                                    <p className="text-xs text-muted-foreground">{new Date(comment.createdAt || Date.now()).toLocaleTimeString()}</p>
                                </div>
                                <p>{comment.text}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
