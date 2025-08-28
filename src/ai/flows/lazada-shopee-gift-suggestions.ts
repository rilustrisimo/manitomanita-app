'use server';
/**
 * @fileOverview AI gift suggestion flow that suggests gifts from Lazada and Shopee with affiliate links.
 *
 * - suggestGifts - A function that suggests gifts based on wishlist items and member profiles.
 * - SuggestGiftsInput - The input type for the suggestGifts function.
 * - SuggestGiftsOutput - The return type for the suggestGifts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestGiftsInputSchema = z.object({
  wishlistItems: z.array(z.string()).describe('List of items in the user wishlist.'),
  memberProfile: z.string().describe('Profile information of the group member.'),
});
export type SuggestGiftsInput = z.infer<typeof SuggestGiftsInputSchema>;

const SuggestedGiftSchema = z.object({
  itemName: z.string().describe('Name of the suggested gift item.'),
  itemDescription: z.string().describe('Description of the suggested gift item.'),
  lazadaAffiliateLink: z.string().url().optional().describe('Affiliate link for the item on Lazada, if available.'),
  shopeeAffiliateLink: z.string().url().optional().describe('Affiliate link for the item on Shopee, if available.'),
});

const SuggestGiftsOutputSchema = z.array(SuggestedGiftSchema).describe('List of suggested gifts from Lazada and Shopee with affiliate links.');
export type SuggestGiftsOutput = z.infer<typeof SuggestGiftsOutputSchema>;

export async function suggestGifts(input: SuggestGiftsInput): Promise<SuggestGiftsOutput> {
  return suggestGiftsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestGiftsPrompt',
  input: {schema: SuggestGiftsInputSchema},
  output: {schema: SuggestGiftsOutputSchema},
  prompt: `You are a gift suggestion expert specializing in finding gifts on Lazada and Shopee.

  Based on the provided wishlist items and member profile, suggest gifts available on Lazada and Shopee.  Include affiliate links to the suggested items.

  Wishlist Items: {{wishlistItems}}
  Member Profile: {{memberProfile}}

  Format your output as a JSON array of gift suggestions, including the item name, description, and affiliate links for both Lazada and Shopee when available.
  If a gift is not available on either Lazada or Shopee, do not include it in the suggested gifts.
  Ensure that the affiliate links are valid URLs.
  For each item, provide one to two sentence description of why this is a good gift based on the member profile and wishlist items.
  `,
});

const suggestGiftsFlow = ai.defineFlow(
  {
    name: 'suggestGiftsFlow',
    inputSchema: SuggestGiftsInputSchema,
    outputSchema: SuggestGiftsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
