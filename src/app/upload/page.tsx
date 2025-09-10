"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UploadCloud } from "lucide-react";

export default function UploadPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Upload Your Video</CardTitle>
          <CardDescription>Share your creation with the world. Fill out the details below.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-2">
            <Label htmlFor="video-file">Video File</Label>
            <div className="border-2 border-dashed border-muted rounded-lg p-12 flex flex-col items-center justify-center text-center">
                <UploadCloud className="h-12 w-12 text-muted-foreground"/>
                <p className="mt-4 text-muted-foreground">Drag & drop your video here, or</p>
                <Button variant="outline" className="mt-2">Browse Files</Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="e.g., My Awesome Cat Video" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Tell viewers about your video" rows={5} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="music">Music</SelectItem>
                  <SelectItem value="news">News</SelectItem>
                  <SelectItem value="gaming">Gaming</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="privacy">Privacy</Label>
              <Select defaultValue="public">
                <SelectTrigger id="privacy">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="unlisted">Unlisted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
           <div className="flex justify-end gap-2">
            <Button variant="outline">Save as Draft</Button>
            <Button className="bg-primary hover:bg-primary/90">Publish</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
