
'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { History, Archive, GraduationCap, CalendarClock, Crown, Pencil, FileText, Rss } from "lucide-react";
import { AdPlaceholder } from "@/components/shared/ad-placeholder";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useAuth } from "@/hooks/use-auth";
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
    { href: "/educational", icon: GraduationCap, label: "Edu Hub" },
    { href: "/educational/upcoming", icon: CalendarClock, label: "Upcoming" },
    { href: "/educational/teacher", icon: Crown, label: "Educator" },
    { href: "/educational/live", icon: Rss, label: "Live" },
  ];

  let libraryNavItems = [
    { href: "#", icon: History, label: "History" },
    { href: "#", icon: TickVibeIcon, label: "Tick Vibe" },
    { href: `/profile/${loggedInUser?.id || 'user-1'}?tab=playlists`, icon: PlaylistIcon, label: "Playlists" },
    { href: "/educational/bucket", icon: Archive, label: "Bucket" },
  ];
  
  return (
    <aside className="hidden md:block w-44 p-4 border-l">
      <div className="flex flex-col h-full">
        <nav className="flex flex-col gap-1">
          {mainNavItems.map((item) => <NavLink key={item.label} item={item} />)}
          <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="go-test" className="border-b-0">
                  <AccordionTrigger className="py-2 px-4 text-sm font-medium w-full justify-end gap-3 hover:bg-accent hover:text-accent-foreground rounded-md hover:no-underline" showIcon={true}>
                    <span>Go Test</span>
                  </AccordionTrigger>
                  <AccordionContent>
                      <div className="flex flex-col gap-1">
                          <NavLink item={{ href: "/educational/test", icon: Pencil, label: "Creator" }} />
                          <NavLink item={{ href: "/educational/test/live", icon: FileText, label: "Attempter" }} />
                      </div>
                  </AccordionContent>
              </AccordionItem>
          </Accordion>
        </nav>
        <hr className="my-4" />
        {loggedInUser && (
          <nav className="flex flex-col gap-1">
            <h2 className="px-4 py-2 text-lg font-semibold tracking-tight font-headline text-right">Library</h2>
            {libraryNavItems.map((item) => <NavLink key={item.label} item={item} />)}
          </nav>
        )}
        <div className="mt-auto">
            <AdPlaceholder />
        </div>
      </div>
    </aside>
  );
}
