
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mic, Search, Bell, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function TopNav() {
  const pathname = usePathname();

  const getPageName = () => {
    if (pathname.includes("/educational")) return "Educational";
    if (pathname.includes("/farmer")) return "Farmer";
    if (pathname.includes("/children")) return "Children";
    if (pathname.includes("/main-stream")) return "Main Stream";
    return "";
  }

  const pageName = getPageName();
  const placeholder = pageName ? `Search in ${pageName}...` : "Search...";

  return (
    <div className="bg-background text-secondary-foreground">
      <div className="container mx-auto flex h-14 items-center justify-between px-4 md:px-6 gap-4">
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Upload className="h-5 w-5" />
                    <span className="sr-only">Upload</span>
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                    <Link href="/upload">Edu Upload</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>Edu Go live</DropdownMenuItem>
                <DropdownMenuItem>Blogging</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
        <div className="flex flex-1 justify-center max-w-lg items-center gap-2">
            <div className="relative w-full">
                <Input
                    type="search"
                    placeholder={placeholder}
                    className="w-full rounded-lg bg-secondary pl-10 pr-3 py-2"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <Button variant="ghost" size="icon" className="rounded-full flex-shrink-0">
                <Mic className="h-5 w-5" />
                <span className="sr-only">Voice Search</span>
            </Button>
        </div>
        <div className="w-[124px]"></div>
      </div>
    </div>
  );
}
