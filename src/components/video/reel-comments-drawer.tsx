
'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { MessageSquare, Send } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/hooks/use-auth"
import type { User } from '@/types';

interface ReelCommentsDrawerProps {
  commentCount: number;
}

// In a real app, comments would be fetched based on the video ID.
// This is a prototype feature.
const reelCommentsData: { id: string, userName: string, text: string, timestamp: string }[] = [
    { id: 'rc-1', userName: 'GamerGuild', text: 'This is hilarious! 😂', timestamp: "1h" },
    { id: 'rc-2', userName: 'EduLearn', text: 'Where is this place?', timestamp: "2h" },
    { id: 'rc-3', userName: 'MusicMania', text: 'Song name?', timestamp: "3h" },
];

export function ReelCommentsDrawer({ commentCount }: ReelCommentsDrawerProps) {
  const { user, users } = useAuth();
  
  const reelComments = reelCommentsData.map(comment => {
      const commentUser = users.find(u => u.name === comment.userName);
      return {
          ...comment,
          user: commentUser || { id: 0, firebaseUid: 'unknown-uid', name: 'Guest', avatarUrl: '', subscribers: 0, email: '' }
      }
  })


  return (
    <Sheet>
      <SheetTrigger asChild>
        <div className="flex flex-col items-center gap-1 cursor-pointer group">
          <Button variant="ghost" size="icon" className="w-12 h-12 rounded-full text-white bg-black/30 backdrop-blur-sm group-hover:bg-white/20 transition-colors">
            <MessageSquare className="w-7 h-7" />
          </Button>
          <span className="text-sm font-semibold text-white drop-shadow-md">{commentCount.toLocaleString()}</span>
        </div>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[80vh] flex flex-col bg-background text-foreground rounded-t-2xl">
        <SheetHeader className="text-center pb-4">
          <SheetTitle>{reelComments.length.toLocaleString()} Comments</SheetTitle>
        </SheetHeader>
        <Separator />
        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="py-4 space-y-6">
            {reelComments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={comment.user.avatarUrl} data-ai-hint="user avatar" />
                  <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <p className="font-semibold text-sm">{comment.user.name}</p>
                    <p className="text-xs text-muted-foreground">{comment.timestamp}</p>
                  </div>
                  <p className="text-sm">{comment.text}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <Separator />
        <div className="py-4 flex items-center gap-2">
            <Avatar>
                {user ? (
                  <>
                    <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="user avatar" />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </>
                ) : (
                  <AvatarFallback>U</AvatarFallback>
                )}
            </Avatar>
            <Input placeholder={user ? "Add a comment..." : "Log in to comment"} disabled={!user} className="flex-1" />
            <Button type="submit" size="icon" disabled={!user}>
                <Send className="h-4 w-4" />
                <span className="sr-only">Send comment</span>
            </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
