
"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, Upload, User, Podcast } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormEvent, useEffect, useState, useRef } from "react";
import { NotificationDropdown } from "@/app/_components/notification-dropdown";
import { ColorMicIcon } from "@/components/icons/color-mic-icon";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";


// This is necessary for TypeScript to recognize the webkitSpeechRecognition API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function TopNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const { toast } = useToast();
  const { user: loggedInUser } = useAuth();

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setQuery(searchParams.get('q') || '');
  }, [searchParams]);

  const placeholder = "Search in Main Stream...";
  const goLiveHref = "/main-stream/live/create";
  const uploadHref = "/main-stream/upload";

  const performSearch = (searchQuery: string) => {
    const params = new URLSearchParams(searchParams);
    if (searchQuery) {
      params.set('q', searchQuery);
    } else {
      params.delete('q');
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };
  
  const handleListen = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({
        variant: "destructive",
        title: "Voice search not supported",
        description: "Your browser does not support voice search. Try Chrome or Edge.",
      });
      return;
    }
    
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      toast({ title: "Listening..." });
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
        toast({ variant: "destructive", title: "Voice search error", description: event.error });
    };

    recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        performSearch(transcript); // Automatically perform search after transcription
    };
    
    recognition.start();
  }


  return (
    <div className="bg-background text-secondary-foreground">
      <div className="container mx-auto flex h-14 items-center justify-between px-4 md:px-6 gap-4">
        <div className="flex items-center gap-2">
            {loggedInUser && (
              <>
                <NotificationDropdown />
                 <Button variant="ghost" size="icon" asChild>
                    <Link href={goLiveHref} aria-label="Go Live" className="relative">
                        <Podcast className="h-5 w-5 text-destructive animate-pulse" />
                         <span className="absolute inset-0 h-full w-full rounded-full bg-destructive/10 animate-ping -z-10"></span>
                    </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <Link href={uploadHref} aria-label="Upload Video">
                    <Upload className="h-5 w-5" />
                  </Link>
                </Button>
              </>
            )}
        </div>
        <div className="flex flex-1 justify-center max-w-lg items-center gap-2">
            <form onSubmit={handleSearch} className="relative w-full">
                <Input
                    type="search"
                    placeholder={placeholder}
                    className="w-full rounded-lg bg-secondary pl-10 pr-3 py-2"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2" aria-label="Submit search" suppressHydrationWarning={true}>
                    <Search className="h-4 w-4 text-muted-foreground" />
                </button>
            </form>
            <Button 
                variant="ghost" 
                size="icon" 
                className={cn(
                    "rounded-full flex-shrink-0 transition-all",
                    isListening && "ring-2 ring-red-500 scale-110"
                )} 
                aria-label="Voice Search"
                onClick={handleListen}
            >
                <ColorMicIcon className="h-5 w-5" />
            </Button>
        </div>
        <div className="w-[124px] flex justify-end">
            {loggedInUser && (
              <Button asChild variant="outline" size="sm" className="gap-2">
                  <Link href={`/profile/${loggedInUser.id}`}>
                      <User className="h-4 w-4" />
                      My Shadow
                  </Link>
              </Button>
            )}
        </div>
      </div>
    </div>
  );
}
