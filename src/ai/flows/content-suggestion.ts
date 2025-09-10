'use server';
/**
 * @fileOverview AI-powered content suggestion flow.
 *
 * - suggestContent - A function that suggests videos based on viewing history.
 * - ContentSuggestionInput - The input type for the suggestContent function.
 * - ContentSuggestionOutput - The return type for the suggestContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ContentSuggestionInputSchema = z.object({
  viewingHistory: z
    .array(z.string())
    .describe('List of video titles or IDs the user has watched.'),
  interests: z.string().describe('The interests of the user.'),
});
export type ContentSuggestionInput = z.infer<typeof ContentSuggestionInputSchema>;

const ContentSuggestionOutputSchema = z.object({
  suggestedVideos: z
    .array(z.string())
    .describe('List of suggested video titles or descriptions.'),
});
export type ContentSuggestionOutput = z.infer<typeof ContentSuggestionOutputSchema>;

export async function suggestContent(input: ContentSuggestionInput): Promise<ContentSuggestionOutput> {
  return suggestContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'contentSuggestionPrompt',
  input: {schema: ContentSuggestionInputSchema},
  output: {schema: ContentSuggestionOutputSchema},
  prompt: `You are a content recommendation expert for a video streaming platform.

  Based on the user's viewing history and interests, suggest videos they might like.

  Viewing History: {{{viewingHistory}}}
  Interests: {{{interests}}}

  Suggest videos that are relevant and engaging to the user.
  Return a list of suggested video titles or descriptions.
  `,
});

const suggestContentFlow = ai.defineFlow(
  {
    name: 'suggestContentFlow',
    inputSchema: ContentSuggestionInputSchema,
    outputSchema: ContentSuggestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
