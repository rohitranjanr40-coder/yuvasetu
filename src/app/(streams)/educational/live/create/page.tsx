'use client';

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { LiveSetupForm } from "@/components/streaming/LiveSetupForm";

function CreateEduLiveStreamPageContent() {
  return (
    <LiveSetupForm defaultCategory="Education" />
  );
}

export default function CreateEduLiveStreamPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-96"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <CreateEduLiveStreamPageContent />
        </Suspense>
    )
}
