
'use server';
/**
 * @fileOverview A content suggestion AI agent.
 *
 * This flow suggests video content ideas based on a given topic using the Google AI SDK.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  ContentSuggestionInputSchema,
  type ContentSuggestionInput,
  ContentSuggestionOutputSchema,
  type ContentSuggestionOutput,
} from '@/types/content-suggestion';

// Initialize the Google AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

function cleanJsonString(text: string): string {
    // Remove markdown backticks and 'json' language identifier
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '');
    return cleaned.trim();
}

export async function contentSuggestionFlow(
  input: ContentSuggestionInput
): Promise<ContentSuggestionOutput> {
  try {
    // Validate input using Zod
    const validatedInput = ContentSuggestionInputSchema.parse(input);

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });
    
    const prompt = `
        You are a creative content strategist for a video platform.
        Your task is to generate ${validatedInput.length} video ideas based on the following topic: "${validatedInput.topic}".
        For each idea, provide a catchy title and a brief two-sentence outline.
        The output must be a valid JSON object matching this schema: ${JSON.stringify(ContentSuggestionOutputSchema)}.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Ensure the response text is not empty before parsing
    if (!text) {
        console.warn('Received empty response from AI for content suggestion.');
        return { suggestions: [] };
    }
    
    text = cleanJsonString(text);

    // Attempt to parse the JSON response
    const jsonResponse = JSON.parse(text);

    // Validate the output using Zod
    const validatedOutput = ContentSuggestionOutputSchema.parse(jsonResponse);
    
    return validatedOutput;

  } catch (error) {
    console.error('Error in contentSuggestionFlow:', error);
    // Return a default empty response on error
    return { suggestions: [] };
  }
}
