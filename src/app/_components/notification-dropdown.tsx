
'use client';

import { useState, useEffect, useTransition } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Bell, Film, Heart, MessageSquare, Podcast, Loader2 } from 'lucide-react';
import type { User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { getNotificationsByUserId, markNotificationsAsRead } from '@/lib/actions';
import { formatDistanceToNow } from 'date-fns';

type NotificationPayload = Awaited<ReturnType<typeof getNotificationsByUserId>>[0];

const getNotificationIcon = (type: NotificationPayload['type']) => {
  switch (type) {
    case 'new_video':
      return <Film className="h-4 w-4 text-primary" />;
    case 'live_stream':
      return <Podcast className="h-4 w-4 text-destructive" />;
    case 'new_joiner':
      return <Heart className="h-4 w-4 text-pink-500" />;
    case 'comment_reply':
      return <MessageSquare className="h-4 w-4 text-green-500" />;
    default:
      return <Bell className="h-4 w-4 text-muted-foreground" />;
  }
};

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);
  const { user, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const fetchNotifications = async () => {
    if (!user) {
        setNotifications([]);
        setIsLoading(false);
        return;
    };
    setIsLoading(true);
    const userNotifications = await getNotificationsByUserId(user.id);
    setNotifications(userNotifications);
    setIsLoading(false);
  }

  useEffect(() => {
    if (!authLoading) {
      fetchNotifications();
    }
  }, [user, authLoading]);
  
  const handleOpenChange = (open: boolean) => {
    if (open && hasUnread && user) {
        startTransition(async () => {
            await markNotificationsAsRead(user.id);
            // Optimistically update UI
            setNotifications(current => current.map(n => ({ ...n, read: true })));
        });
    }
  };
  
  const hasUnread = notifications.some(n => !n.read);

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {hasUnread && (
            <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 md:w-96">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isLoading ? (
            <div className='flex items-center justify-center p-4'>
                <Loader2 className='h-6 w-6 animate-spin' />
            </div>
        ) : notifications.length > 0 ? (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className="p-3 focus:bg-accent/50"
              asChild
            >
              <Link href={notification.href || '#'}>
                <div className="flex items-start gap-3 w-full">
                  {!notification.read && <div className="mt-1 h-2 w-2 rounded-full bg-primary" />}
                  <div className={cn('flex-shrink-0', notification.read && 'ml-4')}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{notification.text}</p>
                    <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {notification.actor && (
                   <Avatar className="h-8 w-8">
                      <AvatarImage src={notification.actor.avatarUrl || ''} alt={notification.actor.name || 'User'} data-ai-hint="user avatar"/>
                      <AvatarFallback>{notification.actor.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              </Link>
            </DropdownMenuItem>
          ))
        ) : (
          <p className="p-4 text-center text-sm text-muted-foreground">No new notifications</p>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
