

'use client';

import Image from "next/image";
import { MoreHorizontal, Trash2, Loader2, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getVideos } from "@/lib/actions";
import type { Video } from "@/types";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import StreamsLayout from "../(streams)/layout";

function AdminDashboardContent() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchAllVideos() {
        setLoading(true);
        const videosData = await getVideos() as Video[];
        setVideos(videosData);
        setLoading(false);
    }
    if (user?.role === 'admin') {
      fetchAllVideos();
    } else {
      setLoading(false);
    }
  }, [user]);
  
  if (loading) {
      return (
          <div className="flex items-center justify-center h-96">
              <Loader2 className="h-8 w-8 animate-spin" />
          </div>
      )
  }

  if (user?.role !== 'admin') {
    return (
        <Card className="text-center py-16">
            <CardHeader>
                <ShieldAlert className="h-16 w-16 mx-auto text-destructive" />
                <CardTitle className="mt-4 text-2xl">Access Denied</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">You do not have permission to view this page.</p>
            </CardContent>
        </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Video Management</CardTitle>
        <CardDescription>
          A list of all videos on the platform. You can manage them here.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] sm:table-cell">
                <span className="sr-only">Thumbnail</span>
              </TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead className="hidden md:table-cell">Views</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {videos.map((video) => (
              <TableRow key={video.id}>
                <TableCell className="hidden sm:table-cell">
                  <Image
                    alt={video.title}
                    className="aspect-square rounded-md object-cover"
                    height="64"
                    src={video.thumbnailUrl || 'https://placehold.co/64x64.png'}
                    width="64"
                    data-ai-hint="video thumbnail"
                  />
                </TableCell>
                <TableCell className="font-medium">{video.title}</TableCell>
                <TableCell>
                  <Badge variant={video.live ? "destructive" : "secondary"}>
                    {video.live ? "Live" : "VOD"}
                  </Badge>
                </TableCell>
                <TableCell>{video.channelName}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {video.views?.toLocaleString()}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost" aria-label={`Actions for ${video.title}`}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive hover:!text-destructive hover:!bg-destructive/10">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          Showing <strong>1-{videos.length}</strong> of <strong>{videos.length}</strong> videos
        </div>
      </CardFooter>
    </Card>
  );
}


export default function AdminDashboard() {
  return (
    <StreamsLayout>
      <AdminDashboardContent />
    </StreamsLayout>
  )
}
