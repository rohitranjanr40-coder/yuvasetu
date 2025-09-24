
'use client';

import Link from "next/link";
import {
  Menu,
  User,
  Settings,
  Lock,
  LogIn,
  LogOut,
  Loader2
} from "lucide-react";
import * as React from "react"
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PasswordDialog } from "./password-dialog";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { ModeToggle } from "./mode-toggle";
import { NotificationDropdown } from "./notification-dropdown";


export interface SectionVisibility {
  mainStream: boolean;
  educational: boolean;
  farmer: boolean;
  children: boolean;
}

const VISIBILITY_KEY = "yuvasetu_section_visibility";

const Logo = () => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M50 10C38.9543 10 30 18.9543 30 30C30 41.0457 38.9543 50 50 50C61.0457 50 70 41.0457 70 30C70 18.9543 61.0457 10 50 10Z"
      fill="#F57D1F"
    />
    <path
      d="M25 40C16.7157 40 10 46.7157 10 55C10 63.2843 16.7157 70 25 70C33.2843 70 40 63.2843 40 55C40 46.7157 33.2843 40 25 40Z"
      fill="#0D6EFC"
    />
    <path
      d="M75 40C66.7157 40 60 46.7157 60 55C60 63.2843 66.7157 70 75 70C83.2843 70 90 63.2843 90 55C90 46.7157 83.2843 40 75 40Z"
      fill="#4CAF50"
    />
    <path
      d="M50 45C50 67.0914 32.0914 85 10 85C19.9577 85 35.8333 80.1667 45 70C54.1667 60.8333 50 45 50 45Z"
      fill="#F57D1F"
    />
    <path
      d="M50 45C50 67.0914 67.9086 85 90 85C80.0423 85 64.1667 80.1667 55 70C45.8333 60.8333 50 45 50 45Z"
      fill="#4CAF50"
    />
  </svg>
);


export default function Header() {
  const pathname = usePathname();
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = React.useState(false);
  const [isClient, setIsClient] = React.useState(false);
  
  const { user: loggedInUser, logout, loading } = useAuth();

  const [sectionVisibility, setSectionVisibility] = React.useState<SectionVisibility>({
    mainStream: true,
    educational: true,
    farmer: true,
    children: true,
  });
  
  React.useEffect(() => {
    setIsClient(true);
    const savedVisibility = localStorage.getItem(VISIBILITY_KEY);
    if (savedVisibility) {
      try {
        setSectionVisibility(JSON.parse(savedVisibility));
      } catch (e) {
        console.error("Failed to parse section visibility from localStorage", e);
      }
    }
  }, []);

  React.useEffect(() => {
      if(isClient) {
        localStorage.setItem(VISIBILITY_KEY, JSON.stringify(sectionVisibility));
      }
  }, [sectionVisibility, isClient]);

  const navLinks = [
    { href: "/main-stream", label: "Main Stream", id: "mainStream" as keyof SectionVisibility },
    { href: "/educational", label: "Educational", id: "educational" as keyof SectionVisibility },
    { href: "/farmer", label: "Farmer", id: "farmer" as keyof SectionVisibility },
    { href: "/children", label: "Kids Hub", id: "children" as keyof SectionVisibility },
  ];
  
  const visibleLinks = navLinks.filter(link => sectionVisibility[link.id]);
  
  const openAuthDialog = () => {
    window.dispatchEvent(new CustomEvent('open-user-switcher'));
  };


  return (
    <>
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
        <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 font-semibold">
                <Logo />
                <span className="text-3xl font-bold tracking-tighter font-headline hidden sm:inline-block">YuvaSetu</span>
            </Link>
        </div>
        
        <nav className="hidden md:flex items-center justify-center">
            {isClient && (
                <div className="flex items-center gap-1 rounded-full bg-muted p-1">
                    {visibleLinks.map(link => {
                        const isActive = pathname.startsWith(link.href);
                        return (
                            <Link key={link.href} href={link.href}>
                                <Button 
                                    variant={isActive ? 'default' : 'ghost'} 
                                    size="sm" 
                                    className={cn("rounded-full", isActive ? "shadow-sm" : "")}
                                >
                                    {link.label}
                                </Button>
                            </Link>
                        )
                    })}
                </div>
            )}
        </nav>


        <div className="flex items-center gap-2">
          <ModeToggle />
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setIsPasswordDialogOpen(true)} aria-label="Admin Lock">
            <Lock className="h-5 w-5" />
          </Button>

          {loading ? (
             <Loader2 className="h-6 w-6 animate-spin" />
          ) : loggedInUser ? (
             <>
              <NotificationDropdown />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="icon" className="rounded-full">
                    <Avatar>
                      <AvatarImage src={loggedInUser.avatarUrl || ''} alt={loggedInUser.name} data-ai-hint="user avatar" />
                      <AvatarFallback>{loggedInUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="sr-only">Toggle user menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/profile/${loggedInUser.id}`} className="flex items-center gap-2">
                      <User />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center gap-2">
                      <Settings />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
             <Button variant="outline" onClick={openAuthDialog}>
                <LogIn className="mr-2 h-4 w-4" />
                Login
            </Button>
          )}

           <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <nav className="grid gap-6 text-lg font-medium">
                  <Link
                    href="#"
                    className="flex items-center gap-2 text-lg font-semibold mb-4"
                  >
                    <Logo />
                    <span className="font-bold tracking-tighter font-headline">YuvaSetu</span>
                  </Link>
                  {isClient && visibleLinks.map(link => (
                     <Link href={link.href} key={link.href} className={cn("hover:text-foreground", pathname.startsWith(link.href) ? "text-foreground font-semibold" : "text-muted-foreground")}>
                        {link.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
        </div>
      </header>
      <PasswordDialog 
        open={isPasswordDialogOpen} 
        onOpenChange={setIsPasswordDialogOpen} 
        sectionVisibility={sectionVisibility}
        setSectionVisibility={setSectionVisibility}
      />
    </>
  );
}
