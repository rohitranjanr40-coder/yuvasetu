
'use client';

import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function NotesEditor() {
  return (
    <div className="space-y-6">
        <CardHeader className="p-0">
            <CardTitle>Add Notes</CardTitle>
            <CardDescription>Create and upload notes for your courses or videos.</CardDescription>
        </CardHeader>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="notes-title">Notes Title</Label>
          <Input id="notes-title" placeholder="e.g., Chapter 1: Key Concepts" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes-content">Content</Label>
          <Textarea id="notes-content" placeholder="Start writing your notes here..." rows={15} />
        </div>
         <div className="space-y-2">
          <Label htmlFor="notes-file">Or Upload a File</Label>
          <Input id="notes-file" type="file" />
        </div>
      </div>
      <div className="flex justify-end">
        <Button>Save Notes</Button>
      </div>
    </div>
  );
}
