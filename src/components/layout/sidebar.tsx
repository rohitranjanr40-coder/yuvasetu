

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Home, Flame, PlaySquare, Video, History, User, ShieldCheck, Clock, ThumbsUp, ListMusic, GraduationCap, CalendarClock, Crown, Tractor, Baby, ClipboardCheck, Pencil, FileText, BarChart4, Store } from "lucide-react";
import { AdPlaceholder } from "../shared/ad-placeholder";
import { users } from "@/lib/data";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const NavLink = ({ item }: { item: { href: string; icon?: React.ElementType; label: string } }) => (
  <Link href={item.href} passHref>
    <Button variant="ghost" className="w-full justify-end gap-3">
      <span>{item.label}</span>
      {item.icon && <item.icon className="h-5 w-5" />}
    </Button>
  </Link>
);

export default function Sidebar() {
  const pathname = usePathname();
  const isEducational = pathname.startsWith('/educational');
  const isFarmer = pathname.startsWith('/farmer');

  const getMainNavItems = () => {
    if (isEducational) {
      return [
        { href: "/educational", icon: GraduationCap, label: "Edu Home" },
        { href: "/educational/teacher", icon: CalendarClock, label: "Upcoming" },
        { href: "/educational/reels", icon: PlaySquare, label: "Edu Reels" },
      ];
    }
    if (isFarmer) {
      return [
        { href: "/farmer", icon: Tractor, label: "Farmer Home" },
        { href: "/farmer/open-market", icon: Store, label: "Open Market" },
      ];
    }
    if (pathname.startsWith('/children')) {
      return [
        { href: "/children", icon: Baby, label: "Children Home" },
      ];
    }
    return [
      { href: "/main-stream", icon: Home, label: "Home" },
      { href: "/live", icon: Flame, label: "Trending" },
    ];
  };

  const mainNavItems = getMainNavItems();

  let libraryNavItems = [
    { href: "#", icon: History, label: "History" },
    { href: "#", icon: Clock, label: "Watch Later" },
    { href: "/profile/user-1?tab=liked", icon: ThumbsUp, label: "Liked Videos" },
    { href: "/profile/user-1?tab=playlists", icon: ListMusic, label: "Playlists" },
  ];

  if (isEducational) {
    libraryNavItems.push({ href: "/educational/videos?tab=test-draft", icon: PlaySquare, label: "Edu Draft" });
  }
  
  const adminNavItems = [
      { href: "/admin", icon: ShieldCheck, label: "Admin Panel" },
  ]

  const loggedInUser = users[0];
  const subscriptions = users.slice(1, 4); // Mock subscription data
  const ownerId = "user-1"; // Assume the first user is the owner

  return (
    <aside className="hidden md:block w-44 p-4 border-l sticky top-0 h-screen">
      <div className="flex flex-col h-full">
        <nav className="flex flex-col gap-1">
          {mainNavItems.map((item) => <NavLink key={item.label} item={item} />)}

          {isEducational && (
            <>
              <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="go-test" className="border-b-0">
                      <AccordionTrigger showIcon={false} className="hover:no-underline p-0">
                          <div className="hover:bg-accent hover:text-accent-foreground w-full justify-end gap-3 rounded-md text-sm font-medium h-10 px-4 py-2 inline-flex items-center">
                              <span>Go Test</span>
                              <ClipboardCheck className="h-5 w-5" />
                          </div>
                      </AccordionTrigger>
                      <AccordionContent>
                          <div className="flex flex-col gap-1">
                              <NavLink item={{ href: "/educational/test", icon: Pencil, label: "Creator" }} />
                              <NavLink item={{ href: "/educational/test/live", icon: FileText, label: "Attempter" }} />
                              <NavLink item={{ href: "/educational/test/result", icon: BarChart4, label: "Result" }} />
                          </div>
                      </AccordionContent>
                  </AccordionItem>
              </Accordion>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="edu-subscription" className="border-b-0">
                  <AccordionTrigger showIcon={false} className="hover:no-underline p-0">
                    <div className="hover:bg-accent hover:text-accent-foreground w-full justify-end gap-3 rounded-md text-sm font-medium h-10 px-4 py-2 inline-flex items-center">
                      <span>Edu Subscription</span>
                      <Crown className="h-5 w-5" />
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col gap-1">
                      <NavLink item={{ href: "/educational/teacher", icon: Pencil, label: "Creator Login" }} />
                      <NavLink item={{ href: "/educational/teacher", icon: User, label: "Viewer Login" }} />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </>
          )}

          {!isEducational && !isFarmer && (
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="subscriptions" className="border-b-0">
                  <AccordionTrigger showIcon={false} className="hover:no-underline p-0">
                      <div className="hover:bg-accent hover:text-accent-foreground w-full justify-end gap-3 rounded-md text-sm font-medium h-10 px-4 py-2 inline-flex items-center">
                          <span>Subscriptions</span>
                      </div>
                  </AccordionTrigger>
                  <AccordionContent>
                      <div className="flex flex-col gap-1">
                          {subscriptions.map(user => (
                               <Link href={`/profile/${user.id}`} key={user.id} passHref>
                                  <Button variant="ghost" className="w-full justify-end gap-3">
                                      <span>{user.name}</span>
                                      <Avatar className="h-6 w-6">
                                          <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="user avatar" />
                                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                      </Avatar>
                                  </Button>
                              </Link>
                          ))}
                      </div>
                  </AccordionContent>
                </AccordionItem>
            </Accordion>
          )}
        </nav>
        <hr className="my-4" />
        <nav className="flex flex-col gap-1">
          <div className="flex items-center justify-end px-4 py-2 gap-2">
            <h2 className="text-lg font-semibold tracking-tight font-headline text-right">{loggedInUser.name}</h2>
            <User className="h-5 w-5" />
          </div>
          {libraryNavItems.map((item) => <NavLink key={item.label} item={item} />)}
        </nav>
        <hr className="my-4" />
        {loggedInUser.id === ownerId && (
            <nav className="flex flex-col gap-1">
            <h2 className="px-4 py-2 text-lg font-semibold tracking-tight font-headline text-right">Admin</h2>
            {adminNavItems.map((item) => <NavLink key={item.label} item={item} />)}
            </nav>
        )}
        <div className="mt-auto">
            <AdPlaceholder />
        </div>
      </div>
    </aside>
  );
}
