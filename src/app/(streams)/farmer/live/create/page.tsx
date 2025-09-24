'use client';

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { LiveSetupForm } from "@/components/streaming/LiveSetupForm";

function CreateFarmerLiveStreamPageContent() {
  return (
    <LiveSetupForm defaultCategory="Farmer" />
  );
}

export default function CreateFarmerLiveStreamPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-96"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <CreateFarmerLiveStreamPageContent />
        </Suspense>
    )
}
