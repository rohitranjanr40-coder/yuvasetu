
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { TickIcon } from '@/components/icons/tick-icon';
import { getTickedVideoIds, toggleTick } from '@/lib/actions';

export function TickButton({ videoId, initialTickCount }: { videoId: number, initialTickCount: number }) {
  const { user: loggedInUser, loading: authLoading } = useAuth();
  const [isTicked, setIsTicked] = useState(false);
  const [tickCount, setTickCount] = useState(initialTickCount);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkInitialStatus() {
      if (!loggedInUser || authLoading) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      const tickedIds = await getTickedVideoIds(loggedInUser.id);
      setIsTicked(tickedIds.includes(videoId));
      setIsLoading(false);
    }
    checkInitialStatus();
  }, [loggedInUser, authLoading, videoId]);

  const handleTick = async () => {
    if (!loggedInUser || isLoading) return;

    setIsLoading(true);
    const result = await toggleTick(loggedInUser.id, videoId);
    
    if (result.success) {
      setIsTicked(result.ticked);
      setTickCount(prev => result.ticked ? prev + 1 : prev - 1);
    }
    // In a real app, you might show a toast on error
    setIsLoading(false);
  };

  return (
    <Button variant="ghost" className="gap-2" onClick={handleTick} aria-label={`Tick this video. Currently has ${tickCount} ticks.`} disabled={!loggedInUser || authLoading || isLoading}>
      <TickIcon isTicked={isTicked} />
      <span>{tickCount.toLocaleString()}</span>
    </Button>
  );
}
