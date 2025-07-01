'use server';

/**
 * @fileOverview Categorizes a subscription into predefined categories.
 *
 * - categorizeSubscription - A function that categorizes a subscription based on its name and description.
 * - CategorizeSubscriptionInput - The input type for the categorizeSubscription function.
 * - CategorizeSubscriptionOutput - The return type for the categorizeSubscription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizeSubscriptionInputSchema = z.object({
  subscriptionName: z.string().describe('The name of the subscription.'),
  subscriptionDescription: z.string().describe('A detailed description of the subscription.'),
});
export type CategorizeSubscriptionInput = z.infer<typeof CategorizeSubscriptionInputSchema>;

const CategorizeSubscriptionOutputSchema = z.object({
  category: z
    .enum([
      'News',
      'Entertainment',
      'Music',
      'Shopping',
      'Other',
    ])
    .describe('The category of the subscription.'),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe('Confidence score between 0 and 1 for the assigned category.'),
});
export type CategorizeSubscriptionOutput = z.infer<typeof CategorizeSubscriptionOutputSchema>;

export async function categorizeSubscription(input: CategorizeSubscriptionInput): Promise<CategorizeSubscriptionOutput> {
  return categorizeSubscriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizeSubscriptionPrompt',
  input: {schema: CategorizeSubscriptionInputSchema},
  output: {schema: CategorizeSubscriptionOutputSchema},
  prompt: `You are an expert at categorizing subscriptions.

  Given the name and description of a subscription, determine its category. The categories are limited to: News, Entertainment, Music, Shopping, and Other.
  Also, provide a confidence score between 0 and 1 for the assigned category.

  Subscription Name: {{{subscriptionName}}}
  Subscription Description: {{{subscriptionDescription}}}
  Category:`, // Asking for category directly. The LLM should not provide any other info than what is requested.
});

const categorizeSubscriptionFlow = ai.defineFlow(
  {
    name: 'categorizeSubscriptionFlow',
    inputSchema: CategorizeSubscriptionInputSchema,
    outputSchema: CategorizeSubscriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
