
'use client';

import { VideoCard } from "@/components/video/video-card";
import { videos } from "@/lib/data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ChevronsUpDown } from "lucide-react";

export default function SearchPage({
  searchParams,
}: {
  searchParams?: {
    query?: string;
  };
}) {
  const query = searchParams?.query || "";
  const searchResults = videos.filter((video) =>
    video.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Search Results</h1>
        <p className="text-muted-foreground">
          {query ? `Showing results for "${query}"` : "Browse all content"}
        </p>
      </div>

      <div className="p-4 bg-card border rounded-lg space-y-4">
        <div className="flex flex-wrap gap-4">
          <Input placeholder="Keywords..." defaultValue={query} className="flex-1 min-w-[200px]" />
          <Select>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="entertainment">Entertainment</SelectItem>
              <SelectItem value="education">Education</SelectItem>
              <SelectItem value="music">Music</SelectItem>
              <SelectItem value="news">News</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Upload Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any Time</SelectItem>
              <SelectItem value="hour">Last Hour</SelectItem>
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          <Button className="w-full md:w-auto">Apply Filters</Button>
        </div>
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-center gap-2">
              <span>Filter by Platform</span>
              <ChevronsUpDown className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border-t mt-2">
                <div className="flex items-center space-x-2">
                    <Checkbox id="filter-main" />
                    <Label htmlFor="filter-main">Main Stream</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox id="filter-educational" />
                    <Label htmlFor="filter-educational">Educational</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox id="filter-farmer" />
                    <Label htmlFor="filter-farmer">Farmer</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox id="filter-children" />
                    <Label htmlFor="filter-children">Children</Label>
                </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {searchResults.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {searchResults.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground">No videos found for your search.</p>
        </div>
      )}
    </div>
  );
}
