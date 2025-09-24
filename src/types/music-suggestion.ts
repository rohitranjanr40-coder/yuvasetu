
import { z } from 'zod';

export const MusicSuggestionInputSchema = z.object({
  topic: z.string().describe('The topic or mood for which to suggest songs. For example: "upbeat party", "sad breakup", "workout motivation".'),
});
export type MusicSuggestionInput = z.infer<typeof MusicSuggestionInputSchema>;

export const SongSuggestionSchema = z.object({
    title: z.string().describe("The title of the suggested song."),
    artist: z.string().describe("The artist of the suggested song."),
});

export const MusicSuggestionOutputSchema = z.object({
  suggestions: z.array(SongSuggestionSchema),
});
export type MusicSuggestionOutput = z.infer<typeof MusicSuggestionOutputSchema>;
