'use server';
/**
 * @fileOverview AI-powered email scanning tool that identifies subscription confirmations and trial end notifications.
 *
 * - detectSubscriptionFromEmail - A function that handles the email scanning and subscription detection process.
 * - DetectSubscriptionFromEmailInput - The input type for the detectSubscriptionFromEmail function.
 * - DetectSubscriptionFromEmailOutput - The return type for the detectSubscriptionFromEmail function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectSubscriptionFromEmailInputSchema = z.object({
  emailContent: z
    .string()
    .describe('The content of the email to be scanned for subscription information.'),
});
export type DetectSubscriptionFromEmailInput = z.infer<typeof DetectSubscriptionFromEmailInputSchema>;

const DetectSubscriptionFromEmailOutputSchema = z.object({
  isSubscriptionRelated: z
    .boolean()
    .describe('Whether the email is related to a subscription or trial.'),
  serviceName: z.string().describe('The name of the subscription service, if detected.').optional(),
  billingDate: z
    .string()
    .describe('The billing date of the subscription, if detected.').optional(),
  paymentMethod: z
    .string()
    .describe('The payment method used for the subscription, if detected (e.g., card, PayPal).')
    .optional(),
  trialEndDate: z
    .string()
    .describe('The end date of the trial period, if applicable.').optional(),
  isMarketingEmail: z
    .boolean()
    .describe('Whether the email is a marketing email.').optional(),
  isReceipt: z
    .boolean()
    .describe('Whether the email is a receipt.').optional(),
  isTermsChange: z
    .boolean()
    .describe('Whether the email is a notification of terms change.').optional(),
});
export type DetectSubscriptionFromEmailOutput = z.infer<typeof DetectSubscriptionFromEmailOutputSchema>;

export async function detectSubscriptionFromEmail(input: DetectSubscriptionFromEmailInput): Promise<DetectSubscriptionFromEmailOutput> {
  return detectSubscriptionFromEmailFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectSubscriptionFromEmailPrompt',
  input: {schema: DetectSubscriptionFromEmailInputSchema},
  output: {schema: DetectSubscriptionFromEmailOutputSchema},
  prompt: `You are an AI assistant specializing in identifying subscription-related information in emails.

  Analyze the provided email content and determine if it contains information about a subscription, trial, or payment. Distinguish between marketing emails, receipts, and terms change notifications.

  Email Content: {{{emailContent}}}

  Output a JSON object with the following fields:
  - isSubscriptionRelated: true if the email is related to a subscription or trial, false otherwise.
  - serviceName: The name of the subscription service, if detected.
  - billingDate: The billing date of the subscription, if detected.
  - paymentMethod: The payment method used for the subscription, if detected (e.g., card, PayPal).
  - trialEndDate: The end date of the trial period, if applicable.
  - isMarketingEmail: true if the email is a marketing email, false otherwise.
  - isReceipt: true if the email is a receipt, false otherwise.
  - isTermsChange: true if the email is a notification of terms change, false otherwise.
  \nEnsure that the output is a valid JSON object.
  If a field cannot be determined, set it to null.
  `,
});

const detectSubscriptionFromEmailFlow = ai.defineFlow(
  {
    name: 'detectSubscriptionFromEmailFlow',
    inputSchema: DetectSubscriptionFromEmailInputSchema,
    outputSchema: DetectSubscriptionFromEmailOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
