"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { comments } from "@/lib/data";

export function LiveChat() {
  return (
    <Card className="flex flex-col h-full max-h-[70vh]">
      <CardHeader>
        <CardTitle>Live Chat</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.user.avatarUrl} data-ai-hint="user avatar" />
                  <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <span className="font-semibold text-sm">{comment.user.name}</span>
                  <p className="text-sm text-muted-foreground">{comment.text}</p>
                </div>
              </div>
            ))}
             <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://placehold.co/40x40" data-ai-hint="user avatar" />
                  <AvatarFallback>A</AvatarFallback>
                </Avatar>
                <div>
                  <span className="font-semibold text-sm">Alice</span>
                  <p className="text-sm text-muted-foreground">This is amazing! 🔥</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://placehold.co/40x40" data-ai-hint="user avatar" />
                  <AvatarFallback>B</AvatarFallback>
                </Avatar>
                <div>
                  <span className="font-semibold text-sm">Bob</span>
                  <p className="text-sm text-muted-foreground">Welcome to the stream everyone!</p>
                </div>
              </div>
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-center space-x-2">
          <Input id="message" placeholder="Say something..." autoComplete="off" />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
