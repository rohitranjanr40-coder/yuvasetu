
'use server';
/**
 * @fileOverview An AI agent for suggesting music.
 *
 * - musicSuggestionFlow - A function that suggests songs based on a topic.
 * - MusicSuggestionInput - The input type for the musicSuggestionFlow function.
 * - MusicSuggestionOutput - The return type for the musicSuggestionFlow function.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import {
    MusicSuggestionInputSchema, type MusicSuggestionInput,
    MusicSuggestionOutputSchema, type MusicSuggestionOutput
} from '@/types/music-suggestion';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

function cleanJsonString(text: string): string {
    // Remove markdown backticks and 'json' language identifier
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '');
    return cleaned.trim();
}

export async function musicSuggestionFlow(input: MusicSuggestionInput): Promise<MusicSuggestionOutput> {
    try {
        const validatedInput = MusicSuggestionInputSchema.parse(input);

        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: { responseMimeType: 'application/json' },
        });

        const prompt = `You are a music expert and DJ. Based on the topic of "${validatedInput.topic}", suggest a list of 5 songs. For each song, provide the title and the artist. The output must be a valid JSON object matching this schema: ${JSON.stringify(MusicSuggestionOutputSchema)}.`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Ensure the response text is not empty before parsing
        if (!text) {
            console.warn('Received empty response from AI for music suggestion.');
            return { suggestions: [] };
        }

        text = cleanJsonString(text);

        const jsonResponse = JSON.parse(text);
        
        const validatedOutput = MusicSuggestionOutputSchema.parse(jsonResponse);
        return validatedOutput;

    } catch (error) {
        console.error("Error in musicSuggestionFlow:", error);
        return { suggestions: [] };
    }
}
