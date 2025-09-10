
"use server";

import { suggestContent } from "@/ai/flows/content-suggestion";
import type { ContentSuggestionInput } from "@/ai/flows/content-suggestion";
import { scanQuestions } from "@/ai/flows/scan-question-flow";
import type { ScanQuestionsInput, ScanQuestionsOutput } from "@/ai/flows/scan-question-flow";


export async function getSuggestedContent(input: ContentSuggestionInput) {
  try {
    const result = await suggestContent(input);
    return result.suggestedVideos;
  } catch (error) {
    console.error("Error getting content suggestions:", error);
    return [];
  }
}

export async function getScannedQuestions(input: ScanQuestionsInput): Promise<ScanQuestionsOutput | null> {
    try {
        const result = await scanQuestions(input);
        return result;
    } catch (error) {
        console.error("Error getting scanned question:", error);
        return null;
    }
}
