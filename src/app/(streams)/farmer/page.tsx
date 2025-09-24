
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AreaChart, Briefcase, CloudSun, Handshake, Leaf, Loader2, Search } from "lucide-react";
import { VideoCard } from "@/components/video/video-card";
import { getVideos } from "@/lib/actions";
import type { Video } from "@/types";
import { Suspense } from "react";

const services = [
  {
    title: "Market Prices",
    description: "Track the latest prices for your crops from nearby markets.",
    icon: AreaChart,
    href: "#",
    category: "prices",
  },
  {
    title: "Farming Services",
    description: "Access services like soil testing, crop advisory, and equipment rental.",
    icon: Leaf,
    href: "#",
    category: "services",
  },
  {
    title: "Government Schemes",
    description: "Find and apply for beneficial government schemes and subsidies.",
    icon: Briefcase,
    href: "#",
    category: "schemes",
  },
  {
    title: "Weather Forecast",
    description: "Get accurate weather predictions to plan your farming activities.",
    icon: CloudSun,
    href: "#",
    category: "weather",
  },
];

async function FarmerPageContent({ searchParams }: { searchParams?: { q?: string } }) {
  const searchQuery = searchParams?.q?.toLowerCase() || '';

  const allVideos = await getVideos() as Video[];
  const farmerVids = allVideos.filter(v => v.category === 'Farmer' || v.channelName === 'AgriSolutions');
  
  const filteredServices = searchQuery ? services.filter(s => 
      s.title.toLowerCase().includes(searchQuery) ||
      s.description.toLowerCase().includes(searchQuery)
  ) : services;

  const filteredVideos = searchQuery ? farmerVids.filter(v =>
      v.title.toLowerCase().includes(searchQuery)
  ) : farmerVids;

  if (searchQuery && filteredServices.length === 0 && filteredVideos.length === 0) {
      return (
        <div className="text-center py-24">
            <Search className="h-16 w-16 mx-auto text-muted-foreground" />
            <h2 className="mt-4 text-2xl font-semibold">No Results Found in Farmer's Portal</h2>
            <p className="mt-2 text-muted-foreground">
                Your search for "{searchQuery}" did not match any services or videos.
            </p>
        </div>
      )
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight font-headline">
          {searchQuery ? `Results for "${searchQuery}"` : "Farmer's Portal"}
        </h1>
        {!searchQuery && <p className="mt-2 text-lg text-muted-foreground">Empowering farmers with technology and information.</p>}
      </div>

      {!searchQuery && (
        <Card className="bg-primary/10 border-primary">
            <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <CardTitle className="text-primary">Welcome to the Open Market</CardTitle>
                    <CardDescription className="mt-2">
                        Connect directly with buyers, from large corporations to local vendors. Sell your produce at the best prices.
                    </CardDescription>
                </div>
                <Button asChild size="lg">
                    <Link href="/farmer/open-market">
                        <Handshake className="mr-2"/>
                        Explore the Market
                    </Link>
                </Button>
            </CardHeader>
        </Card>
      )}

      <section>
        <h2 className="text-2xl font-bold tracking-tight mb-4 font-headline text-center md:text-left">Krishi Seva (Services)</h2>
        {filteredServices.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredServices.map((service) => (
                    <Card key={service.title} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <div className="bg-primary/10 p-3 rounded-full">
                            <service.icon className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-lg">{service.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                        <Button variant="link" className="px-0 mt-2">Learn More</Button>
                    </CardContent>
                    </Card>
                ))}
            </div>
        ) : (
            <p className="text-muted-foreground">No services found matching your search.</p>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold tracking-tight mb-4 font-headline text-center md:text-left">Knowledge Base</h2>
        {filteredVideos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredVideos.map(video => (
                    <VideoCard key={video.id} videoId={video.id as number} />
                ))}
            </div>
        ) : (
            <p className="text-muted-foreground">No videos found matching your search.</p>
        )}
      </section>

    </div>
  );
}


export default function FarmerPage({ searchParams }: { searchParams?: { q?: string } }) {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        }>
            <FarmerPageContent searchParams={searchParams} />
        </Suspense>
    )
}
