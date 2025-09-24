
'use client';

import { useState, useEffect, useTransition } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import type { User } from "@/types";
import { Rss, UserCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isJoined, toggleJoin } from '@/lib/actions';
import { useRouter } from 'next/navigation';

export function FollowButton({ profileUser }: { profileUser: User }) {
  const [isJoinedState, setIsJoinedState] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const { user: loggedInUser, loading: authLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    async function checkJoinStatus() {
        if (!loggedInUser || authLoading) {
            setIsJoinedState(false);
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        const joined = await isJoined(loggedInUser.id, profileUser.id);
        setIsJoinedState(joined);
        setIsLoading(false);
    }
    checkJoinStatus();
  }, [loggedInUser, authLoading, profileUser.id]);


  const handleJoinToggle = () => {
    if (!loggedInUser) {
        toast({
            variant: "destructive",
            title: "Please log in",
            description: "You need to be logged in to join users."
        });
        return;
    }
    if (loggedInUser.id === profileUser.id) {
        toast({
            variant: "destructive",
            title: "Cannot join yourself"
        });
        return;
    }

    startTransition(async () => {
        const result = await toggleJoin(loggedInUser.id, profileUser.id);
        if (result.success) {
            setIsJoinedState(result.joined);
            toast({
                title: result.joined ? `Joined ${profileUser.name}!` : `Left ${profileUser.name}`
            });
            // Re-fetch data on the current page to update joiner count
            router.refresh();
        } else {
            toast({
                variant: 'destructive',
                title: 'Something went wrong',
                description: result.error
            });
        }
    });
  };

  const isDisabled = isLoading || isPending || !loggedInUser || loggedInUser.id === profileUser.id;

  return (
    <Button 
      size="lg" 
      className={cn("gap-2", isJoinedState ? "bg-secondary text-secondary-foreground" : "bg-accent hover:bg-accent/90")}
      onClick={handleJoinToggle}
      disabled={isDisabled}
    >
      {isPending ? (
          <Loader2 className="h-5 w-5 animate-spin" />
      ) : isJoinedState ? (
          <UserCheck className="h-5 w-5" /> 
      ) : (
          <Rss className="h-5 w-5" />
      )}
      <span>{isJoinedState ? 'Joined' : 'Join'}</span>
    </Button>
  );
}
