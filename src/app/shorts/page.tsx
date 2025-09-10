import { ShortVideoCard } from "@/components/video/short-video-card";
import { shorts } from "@/lib/data";
import { Flame } from "lucide-react";

export default function ShortsPage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-center gap-2 text-center">
                <Flame className="h-9 w-9 text-accent" />
                <h1 className="text-4xl font-bold tracking-tight font-headline">Shorts</h1>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {shorts.map((short) => (
                    <ShortVideoCard key={short.id} short={short} />
                ))}
            </div>
        </div>
    );
}
