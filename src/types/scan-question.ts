
import { z } from 'zod';

// Define schemas using Zod for type safety and validation
export const ScanQuestionsInputSchema = z.object({
    documentDataUri: z.string().describe("An image of a document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type ScanQuestionsInput = z.infer<typeof ScanQuestionsInputSchema>;

export const ScanQuestionsOutputSchema = z.object({
  questions: z.array(z.object({
    question: z.string(),
    options: z.array(z.string()),
    correctAnswer: z.string().optional(),
  })),
  explanation: z.string().nullable().optional(),
});
export type ScanQuestionsOutput = z.infer<typeof ScanQuestionsOutputSchema>;
