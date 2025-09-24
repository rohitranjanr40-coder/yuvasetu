
'use server';
/**
 * @fileOverview A question scanning AI agent.
 *
 * - scanQuestions - A function that handles scanning questions from a document image.
 * - ScanQuestionsInput - The input type for the scanQuestions function.
 * - ScanQuestionsOutput - The return type for the scanQuestions function.
 */
import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import {
    ScanQuestionsInputSchema, type ScanQuestionsInput,
    ScanQuestionsOutputSchema, type ScanQuestionsOutput
} from '@/types/scan-question';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

function dataUriToGeminiPart(dataUri: string): Part {
    const parts = dataUri.split(';base64,');
    const mimeType = parts[0].split(':')[1];
    const base64Data = parts[1];
    return {
        inlineData: {
            mimeType,
            data: base64Data,
        },
    };
}

function cleanJsonString(text: string): string {
    // Remove markdown backticks and 'json' language identifier
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '');
    return cleaned.trim();
}


export async function scanQuestions(input: ScanQuestionsInput): Promise<ScanQuestionsOutput> {
    try {
        const validatedInput = ScanQuestionsInputSchema.parse(input);

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: { responseMimeType: 'application/json' }
        });

        const imagePart = dataUriToGeminiPart(validatedInput.documentDataUri);

        const prompt = `
            You are an expert in parsing educational documents.
            Your task is to extract all multiple-choice questions (MCQs) from the provided image.
            For each question, provide the question text and all its options.
            If you can determine the correct answer from the image (e.g., it's marked), include it. Otherwise, omit it.
            If no MCQs are found, return an empty "questions" array.
            The output must be a valid JSON object matching this schema: ${JSON.stringify(ScanQuestionsOutputSchema)}.
        `;

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        let text = response.text();
        
        if (!text) {
            console.warn('Received empty response from AI for scanQuestions.');
            return {
                questions: [],
                explanation: "The AI did not find any multiple-choice questions in the document."
            };
        }

        // Clean the response text to ensure it's valid JSON
        text = cleanJsonString(text);
        
        const jsonResponse = JSON.parse(text);
        
        const validatedOutput = ScanQuestionsOutputSchema.parse(jsonResponse);
        
        if (validatedOutput.questions.length === 0) {
            return {
                questions: [],
                explanation: validatedOutput.explanation || "The AI did not find any multiple-choice questions in the document."
            }
        }
        
        return validatedOutput;

    } catch (error: any) {
        console.error("Error in scanQuestions flow:", error);
        return {
            questions: [],
            explanation: `An unexpected error occurred: ${error.message}`
        };
    }
}
