
'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { History, Archive, Scissors, Handshake, Shield, Rss } from "lucide-react";
import { AdPlaceholder } from "@/components/shared/ad-placeholder";
import { useAuth } from "@/hooks/use-auth";
import { ViralIcon } from "@/components/icons/viral-icon";
import { MainHubIcon } from "@/components/icons/main-hub-icon";
import { TickVibeIcon } from "@/components/icons/tick-vibe-icon";
import { PlaylistIcon } from "@/components/icons/playlist-icon";

const NavLink = ({ item }: { item: { href: string; icon?: React.ElementType; label: string } }) => (
  <Link href={item.href} passHref>
    <Button variant="ghost" className="w-full justify-end gap-3">
      <span>{item.label}</span>
      {item.icon && <item.icon className="h-5 w-5" />}
    </Button>
  </Link>
);

export default function Sidebar() {
  const { user: loggedInUser } = useAuth();
  
  const mainNavItems = [
    { href: "/main-stream", icon: MainHubIcon, label: "Main Hub" },
    { href: "/main-stream/cliptick/player/1", icon: ViralIcon, label: "ViraL" },
  ];

  if (loggedInUser) {
      mainNavItems.push(
          { href: "/main-stream/cliptick", icon: Scissors, label: "ClipTick" },
          { href: "/main-stream/membership", icon: Handshake, label: "MemberShip" }
      );
  }
  
  let libraryNavItems = [
    { href: "/live", icon: Rss, label: "Live Hub" },
    { href: "/main-stream/history", icon: History, label: "History" },
    { href: "/main-stream/tick-vibe", icon: TickVibeIcon, label: "Tick Vibe" },
    { href: `/profile/${loggedInUser?.id || 'user-1'}?tab=playlists`, icon: PlaylistIcon, label: "Playlists" },
    { href: "/main-stream/bucket", icon: Archive, label: "Bucket" },
  ];

  const adminNavItems = [
      { href: "/admin", icon: Shield, label: "Admin Panel" },
  ]

  return (
    <aside className="hidden md:block w-44 p-4 border-l">
      <div className="flex flex-col h-full">
        <nav className="flex flex-col gap-1">
          {mainNavItems.map((item) => <NavLink key={item.label} item={item} />)}
        </nav>
        <hr className="my-4" />
        {loggedInUser && (
          <nav className="flex flex-col gap-1">
            <h2 className="px-4 py-2 text-lg font-semibold tracking-tight font-headline text-right">Library</h2>
            {libraryNavItems.map((item) => <NavLink key={item.label} item={item} />)}
          </nav>
        )}
        {loggedInUser?.role === 'admin' && (
            <>
                <hr className="my-4" />
                <nav className="flex flex-col gap-1">
                <h2 className="px-4 py-2 text-lg font-semibold tracking-tight font-headline text-right">Admin</h2>
                {adminNavItems.map((item) => <NavLink key={item.label} item={item} />)}
                </nav>
            </>
        )}
        <div className="mt-auto">
            <AdPlaceholder />
        </div>
      </div>
    </aside>
  );
}
