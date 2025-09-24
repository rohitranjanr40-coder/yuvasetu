
import { z } from 'zod';

// Input schema for content suggestions
export const ContentSuggestionInputSchema = z.object({
  topic: z.string().describe("The central topic for which to suggest content."),
  length: z.number().optional().describe("The number of suggestions to generate."),
});
export type ContentSuggestionInput = z.infer<typeof ContentSuggestionInputSchema>;


// Output schema for a single suggestion
export const SuggestionSchema = z.object({
    title: z.string().describe("A catchy and relevant title for a video on the given topic."),
    outline: z.string().describe("A brief, two-sentence outline of what the video could cover."),
});

// Output schema for the entire list of suggestions
export const ContentSuggestionOutputSchema = z.object({
  suggestions: z.array(SuggestionSchema),
});
export type ContentSuggestionOutput = z.infer<typeof ContentSuggestionOutputSchema>;
