'use server';
/**
 * @fileOverview An AI flow for scanning and extracting multiple-choice questions from a document.
 *
 * - scanQuestions - A function that handles the question scanning process.
 * - ScanQuestionsInput - The input type for the scanQuestions function.
 * - ScanQuestionsOutput - The return type for the scanQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ScanQuestionsInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "A document or image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ScanQuestionsInput = z.infer<typeof ScanQuestionsInputSchema>;

const ScanQuestionsOutputSchema = z.object({
    questions: z.array(z.object({
        question: z.string().describe('The extracted question text.'),
        options: z.array(z.string()).describe('An array of up to 4 answer options.'),
    })).describe('An array of all the multiple-choice questions found in the document.'),
    explanation: z.string().describe('An explanation of why no questions could be found, if applicable.'),
});
export type ScanQuestionsOutput = z.infer<typeof ScanQuestionsOutputSchema>;

export async function scanQuestions(input: ScanQuestionsInput): Promise<ScanQuestionsOutput> {
  return scanQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'scanQuestionsPrompt',
  input: {schema: ScanQuestionsInputSchema},
  output: {schema: ScanQuestionsOutputSchema},
  prompt: `You are an expert at parsing educational documents to find multiple-choice questions (MCQs).

  Analyze the provided document or image. Identify all multiple-choice questions within it. For each question, extract the main question text and up to four of its answer options.

  - The question should be a complete sentence or query.
  - The options should be distinct choices related to the question.
  - If you cannot find any clear MCQs, return an empty questions array and provide a brief explanation in the explanation field.

  Document: {{media url=documentDataUri}}`,
});

const scanQuestionsFlow = ai.defineFlow(
  {
    name: 'scanQuestionsFlow',
    inputSchema: ScanQuestionsInputSchema,
    outputSchema: ScanQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
