
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";

export function ClassScheduler() {
  const router = useRouter();

  const handleCreateClass = () => {
    // In a real app, you would save the class details and get a unique ID.
    const liveId = `live-${Date.now()}`;
    router.push(`/live/${liveId}`);
  };

  return (
    <div className="space-y-6">
        <CardHeader className="p-0">
            <CardTitle>Create a New Class</CardTitle>
            <CardDescription>Fill in the details to create a new live class for your students.</CardDescription>
        </CardHeader>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="class-title">Class Title</Label>
          <Input id="class-title" placeholder="e.g., Introduction to Algebra" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="class-date">Date</Label>
                <Input id="class-date" type="date" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="class-time">Time</Label>
                <Input id="class-time" type="time" />
            </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="class-description">Description</Label>
          <Textarea id="class-description" placeholder="Briefly describe what the class will cover." />
        </div>
      </div>
      <div className="flex justify-end">
        <Button onClick={handleCreateClass}>Create Class</Button>
      </div>
    </div>
  );
}
