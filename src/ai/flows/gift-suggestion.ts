'use server';
/**
 * @fileOverview Provides gift suggestions based on a user's wishlist and profile.
 *
 * - suggestGifts - A function that suggests gifts based on wishlist items and profile information.
 * - GiftSuggestionInput - The input type for the suggestGifts function.
 * - GiftSuggestionOutput - The return type for the suggestGifts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GiftSuggestionInputSchema = z.object({
  wishlistItems: z.array(z.string()).describe('List of items in the user\'s wishlist.'),
  profileInformation: z.string().describe('User profile information, including interests and preferences.'),
});
export type GiftSuggestionInput = z.infer<typeof GiftSuggestionInputSchema>;

const GiftSuggestionOutputSchema = z.object({
  giftSuggestions: z.array(
    z.object({
      item: z.string().describe('The suggested gift item.'),
      description: z.string().describe('A description of the gift and why it is a good suggestion.'),
      affiliateLink: z.string().optional().describe('Affiliate link to purchase the gift, if available.'),
    })
  ).describe('A list of gift suggestions.'),
});
export type GiftSuggestionOutput = z.infer<typeof GiftSuggestionOutputSchema>;

export async function suggestGifts(input: GiftSuggestionInput): Promise<GiftSuggestionOutput> {
  return giftSuggestionFlow(input);
}

const giftSuggestionPrompt = ai.definePrompt({
  name: 'giftSuggestionPrompt',
  input: {schema: GiftSuggestionInputSchema},
  output: {schema: GiftSuggestionOutputSchema},
  prompt: `You are a gift suggestion expert. Given a user's wishlist items and profile information, you will suggest gift ideas that would be perfect for them.

Wishlist Items: {{wishlistItems}}
Profile Information: {{profileInformation}}

Suggest gifts from Lazada or Shopee if possible, and include an affiliate link if available. Otherwise, suggest other relevant gift ideas.

Format your suggestions as a list of gift suggestions, with each item including a description and affiliate link (if available).`,
});

const giftSuggestionFlow = ai.defineFlow(
  {
    name: 'giftSuggestionFlow',
    inputSchema: GiftSuggestionInputSchema,
    outputSchema: GiftSuggestionOutputSchema,
  },
  async input => {
    const {output} = await giftSuggestionPrompt(input);
    return output!;
  }
);
