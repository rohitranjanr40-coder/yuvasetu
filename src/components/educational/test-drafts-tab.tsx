
'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import type { TestDraft } from '@/types';
import { useAuth } from "@/hooks/use-auth";
import { getTestDraftsByUserId, deleteTestDraft } from "@/lib/actions";

export function TestDraftsTab() {
  const [testDrafts, setTestDrafts] = useState<TestDraft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  const loadDrafts = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const drafts = await getTestDraftsByUserId(user.id);
      setTestDrafts(drafts);
    } catch (error) {
      console.error("Failed to load test drafts from DB:", error);
    } finally {
        setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!authLoading && user) {
      loadDrafts();
    } else if (!authLoading && !user) {
        setIsLoading(false);
    }
  }, [user, authLoading]);

  const handleDeleteDraft = async (draftId: string) => {
    if (!user) return;
    const numericDraftId = parseInt(draftId.replace('test-', ''), 10);
    if (isNaN(numericDraftId)) return;

    try {
        const result = await deleteTestDraft(numericDraftId, user.id);
        if (result.success) {
            setTestDrafts(prev => prev.filter(draft => draft.id !== draftId));
            toast({
                title: 'Draft Deleted',
                description: 'The test draft has been successfully deleted.'
            });
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Failed to delete draft:', error);
        toast({
            variant: 'destructive',
            title: 'Operation Failed',
            description: 'Could not delete the test draft.'
        });
    }
  };

  if (isLoading || authLoading) {
    return (
        <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8">
            <Loader2 className="h-12 w-12 mb-4 animate-spin"/>
            <h2 className="text-xl font-semibold">Loading Drafts...</h2>
        </div>
     );
  }
  
  return (
    <section>
        {testDrafts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {testDrafts.map((draft) => (
            <Card key={draft.id}>
                <CardHeader>
                <CardTitle className="truncate">{draft.subject || 'Untitled Test'}</CardTitle>
                <CardDescription>
                    {draft.questions.length} question{draft.questions.length === 1 ? '' : 's'}
                </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Saved {formatDistanceToNow(new Date(draft.createdAt), { addSuffix: true })}
                    </p>
                </CardContent>
                <div className="flex justify-end items-center p-4 pt-0 gap-2">
                <Button variant="destructive" size="icon" onClick={() => handleDeleteDraft(draft.id)}>
                    <Trash2 className="h-4 w-4"/>
                    <span className="sr-only">Delete</span>
                </Button>
                <Button asChild>
                    <Link href={`/educational/test?draftId=${draft.id}`}>Continue Editing</Link>
                </Button>
                </div>
            </Card>
            ))}
        </div>
        ) : (
        <Card>
            <CardHeader>
                <CardTitle>No Test Drafts</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Your saved test drafts will appear here. Start creating a new test to see your drafts.</p>
            </CardContent>
        </Card>
        )}
    </section>
  )
}
