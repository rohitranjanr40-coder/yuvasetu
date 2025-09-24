
'use client';

import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Camera, Upload, ImageIcon, Archive, Loader2 } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import type { User } from '@/types';
import { updateUserAssets } from '@/lib/actions';
import StreamsLayout from "../(streams)/layout";

interface Photo {
    src: string;
    alt: string;
}

function MyShadowPageContent() {
    const { user, loading, refreshUser } = useAuth();
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadType, setUploadType] = useState<'banner' | 'avatar' | 'photo' | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    
    const [isClient, setIsClient] = useState(false);
    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!user || !uploadType) return;
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        toast({
            title: 'Uploading...',
            description: `Your new ${uploadType} is being uploaded.`,
        });

        try {
            // Step 1: Upload to Vercel Blob
            const response = await fetch(`/api/upload?filename=${file.name}`, {
                method: 'POST',
                body: file,
            });

            if (!response.ok) {
                throw new Error('Upload to blob storage failed.');
            }

            const newBlob = await response.json();
            const newUrl = newBlob.url;

            // Step 2: Update the database via server action
            let updatePayload: { bannerUrl?: string; avatarUrl?: string; newPhotoUrl?: string } = {};
            if (uploadType === 'banner') updatePayload.bannerUrl = newUrl;
            if (uploadType === 'avatar') updatePayload.avatarUrl = newUrl;
            if (uploadType === 'photo') updatePayload.newPhotoUrl = newUrl;

            const result = await updateUserAssets(user.id, updatePayload);
            
            if (result.success) {
                await refreshUser(); // Refresh user data from DB
                toast({
                    title: `${uploadType.charAt(0).toUpperCase() + uploadType.slice(1)} Updated!`,
                    description: `Your profile has been successfully updated.`,
                });
            } else {
                 throw new Error(result.error || 'Failed to update database.');
            }
        } catch (error: any) {
            console.error("File upload error:", error);
            toast({
                variant: "destructive",
                title: 'Upload Failed',
                description: error.message || 'There was an error processing your file.',
            });
        } finally {
            setIsUploading(false);
            setUploadType(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const triggerFileInput = (type: 'banner' | 'avatar' | 'photo') => {
        setUploadType(type);
        fileInputRef.current?.click();
    };

    if (loading || !isClient) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }
    
    if (!user) {
        return (
            <div className="text-center py-16">
                 <h2 className="text-2xl font-semibold">Please Log In</h2>
                <p className="text-muted-foreground mt-2">You need to be logged in to view your Shadow.</p>
            </div>
        )
    }

    const galleryPhotos: Photo[] = (user.galleryPhotos || []).map((p: any, i: number) => ({
        src: p.src,
        alt: p.alt || `User photo ${i + 1}`,
        id: p.id || i,
    }));


    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileUpload} 
                disabled={isUploading}
            />

            <Card className="border-none shadow-none bg-transparent">
                 <div className="relative h-48 md:h-64 bg-muted rounded-lg group">
                    <Image
                        key={user.bannerUrl}
                        src={user.bannerUrl || `https://picsum.photos/seed/shadow-banner/1200/400`}
                        alt="My Shadow Banner"
                        fill
                        className="rounded-lg object-cover"
                        data-ai-hint="abstract banner"
                    />
                    <div className="absolute inset-0 bg-black/30 rounded-lg" />
                    <Button 
                        variant="secondary" 
                        className="absolute top-4 right-4 z-10" 
                        onClick={() => triggerFileInput('banner')}
                        disabled={isUploading}
                    >
                        {isUploading && uploadType === 'banner' ? <Loader2 className="mr-2 animate-spin"/> : <Upload className="mr-2" />}
                        Upload Banner
                    </Button>
                 </div>
                 
                 <div className="relative mt-[-80px] md:mt-[-90px] flex flex-col items-center">
                    <div className="relative group">
                        <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-background ring-4 ring-primary">
                            <AvatarImage src={user.avatarUrl || undefined} alt={user.name} data-ai-hint="user avatar" />
                            <AvatarFallback className="text-4xl">
                                {user.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                        </Avatar>
                        <Button 
                            size="icon" 
                            variant="secondary" 
                            className="absolute bottom-2 right-2 rounded-full h-10 w-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" 
                            onClick={() => triggerFileInput('avatar')}
                            disabled={isUploading}
                        >
                           {isUploading && uploadType === 'avatar' ? <Loader2 className="animate-spin" /> : <Camera />}
                           <span className="sr-only">Upload Profile Picture</span>
                        </Button>
                    </div>
                    <div className="text-center mt-4">
                        <h1 className="text-3xl md:text-4xl font-bold font-headline">{user.name}</h1>
                        <p className="text-muted-foreground mt-1">@{user.name.toLowerCase().replace(/ /g, '')}</p>
                    </div>
                 </div>
                 
                 <CardContent className="pt-8 text-center" />
            </Card>

            <Card>
                <CardContent className="p-4 flex items-center justify-between">
                     <div>
                        <h3 className="font-semibold">My Storage</h3>
                        <p className="text-sm text-muted-foreground">Access your saved videos and drafts.</p>
                     </div>
                     <Button asChild>
                        <Link href="/main-stream/bucket">
                            <Archive className="mr-2"/>
                            View My Bucket
                        </Link>
                     </Button>
                </CardContent>
            </Card>

            <Card>
                 <CardContent className="p-4 md:p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold font-headline">My Photos</h2>
                        <Button 
                            variant="outline" 
                            onClick={() => triggerFileInput('photo')}
                            disabled={isUploading}
                        >
                            {isUploading && uploadType === 'photo' ? <Loader2 className="mr-2 animate-spin"/> : <ImageIcon className="mr-2"/>}
                            Upload Photo
                        </Button>
                    </div>
                    {galleryPhotos.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2 md:gap-4">
                            {galleryPhotos.map(photo => (
                                <div key={photo.src} className="aspect-square bg-muted rounded-lg overflow-hidden group relative">
                                    <Image
                                        src={photo.src}
                                        alt={photo.alt}
                                        layout="fill"
                                        objectFit="cover"
                                        className="transition-transform duration-300 group-hover:scale-105"
                                        data-ai-hint="gallery personal"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
                            <ImageIcon className="h-12 w-12 mx-auto mb-4" />
                            <h3 className="font-semibold">Your gallery is empty</h3>
                            <p className="text-sm">Click "Upload Photo" to add your first memory.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

        </div>
    );
}


export default function MyShadowPage() {
    return (
        <StreamsLayout>
            <MyShadowPageContent />
        </StreamsLayout>
    )
}
