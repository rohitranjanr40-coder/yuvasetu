
'use client';

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { PlayCircle } from "lucide-react";
import type { Short } from "@/types";

interface ShortVideoCardProps {
  short: Short;
}

export function ShortVideoCard({ short }: ShortVideoCardProps) {
  return (
    <Link href={`/watch/${short.id.replace('short-', '')}`} className="group block">
      <Card className="overflow-hidden relative h-[320px] rounded-2xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <Image
          src={short.thumbnailUrl}
          alt={short.title}
          width={200}
          height={320}
          className="w-full h-full object-cover"
          data-ai-hint="short video thumbnail"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 p-4 text-white">
          <h3 className="font-semibold text-sm leading-tight truncate">{short.title}</h3>
          <p className="text-xs text-white/80 mt-1">{short.views.toLocaleString()} views</p>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <PlayCircle className="h-12 w-12 text-white/80" />
        </div>
      </Card>
    </Link>
  );
}
