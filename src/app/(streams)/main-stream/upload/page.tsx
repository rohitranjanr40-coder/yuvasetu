
"use client";

import { useState, useRef, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UploadCloud, FileVideo, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { saveVideo } from "@/lib/actions";

function UploadMainStreamPageContent() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Entertainment');
  const [privacy, setPrivacy] = useState('public');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();
  const { user: loggedInUser } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
    } else if (file) {
      toast({
            variant: "destructive",
            title: "Invalid File Type",
            description: "Please upload a valid video file.",
      });
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('video/')) {
        setVideoFile(file);
    } else {
        toast({
            variant: "destructive",
            title: "Invalid File Type",
            description: "Please upload a valid video file.",
        });
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('Entertainment');
    setPrivacy('public');
    setVideoFile(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handlePublish = async () => {
    if (!loggedInUser) {
        toast({ variant: "destructive", title: "Not Logged In", description: "Please log in to upload a video." });
        return;
    }
    if (!videoFile) {
      toast({ variant: "destructive", title: "No Video File", description: "Please select a video file to upload." });
      return;
    }
    if (!title) {
      toast({ variant: "destructive", title: "Title is Required", description: "Please provide a title for your video." });
      return;
    }
    
    setIsUploading(true);

    try {
        // Step 1: Upload the file to blob storage
        const uploadResponse = await fetch(`/api/upload?filename=${videoFile.name}`, {
            method: 'POST',
            body: videoFile,
        });

        if (!uploadResponse.ok) {
            throw new Error('Upload failed');
        }

        const newBlob = await uploadResponse.json();
        const videoUrl = newBlob.url;

        // Step 2: Save video metadata to the database
        const videoData = {
            title,
            description,
            category,
            videoUrl,
            userId: loggedInUser.id,
            channelName: loggedInUser.name,
        };

        const saveResult = await saveVideo(videoData);

        if (!saveResult.success) {
            throw new Error(saveResult.error || 'Failed to save video details to database.');
        }

        toast({
            title: "Video Published!",
            description: `"${title}" is now live and available on the platform.`,
        });

        resetForm();
        router.push('/main-stream/bucket');

    } catch (error: any) {
        console.error("Failed to upload video", error);
         toast({
            variant: "destructive",
            title: "Upload Failed",
            description: error.message || "Could not upload and save the video.",
        });
    } finally {
        setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Upload Video</CardTitle>
          <CardDescription>Share your creation with the world. Fill out the details below.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-2">
            <Label htmlFor="video-file">Video File</Label>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="video/*" className="hidden" disabled={isUploading} />
            
            {videoFile ? (
                <div className="border border-green-500 bg-green-50 dark:bg-green-900/20 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <FileVideo className="h-8 w-8 text-green-600 dark:text-green-400"/>
                        <div>
                            <p className="font-medium text-green-800 dark:text-green-300">{videoFile.name}</p>
                            <p className="text-xs text-green-700 dark:text-green-400">{(videoFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => { setVideoFile(null); if(fileInputRef.current) fileInputRef.current.value = ''; }} disabled={isUploading}>
                        <X className="h-5 w-5 text-green-800 dark:text-green-300" />
                    </Button>
                </div>
            ) : (
                <div 
                    className="border-2 border-dashed border-muted rounded-lg p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary transition-colors"
                    onClick={handleBrowseClick}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                >
                    <UploadCloud className="h-12 w-12 text-muted-foreground"/>
                    <p className="mt-4 text-muted-foreground">Drag & drop your video here, or</p>
                    <Button variant="outline" className="mt-2 pointer-events-none">Browse Files</Button>
                </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="e.g., My Awesome Cat Video" value={title} onChange={(e) => setTitle(e.target.value)} disabled={isUploading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Tell viewers about your video" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} disabled={isUploading} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory} disabled={isUploading}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Entertainment">Entertainment</SelectItem>
                  <SelectItem value="Music">Music</SelectItem>
                  <SelectItem value="News">News</SelectItem>
                  <SelectItem value="Gaming">Gaming</SelectItem>
                  <SelectItem value="Sports">Sports</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="privacy">Privacy</Label>
              <Select value={privacy} onValueChange={setPrivacy} disabled={isUploading}>
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
            <Button variant="outline" onClick={resetForm} disabled={isUploading}>Cancel</Button>
            <Button className="bg-primary hover:bg-primary/90" onClick={handlePublish} disabled={isUploading}>
                {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isUploading ? 'Publishing...' : 'Publish'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


export default function UploadMainStreamPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-96"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <UploadMainStreamPageContent />
        </Suspense>
    )
}
