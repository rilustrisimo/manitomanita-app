'use server';

import { suggestGifts as suggestGiftsFlow, SuggestGiftsInput, SuggestGiftsOutput } from '@/ai/flows/lazada-shopee-gift-suggestions';

export async function suggestGiftsAction(
  prevState: any,
  formData: FormData
): Promise<{ suggestions: SuggestGiftsOutput | null; error: string | null }> {
  const wishlistItems = formData.getAll('wishlistItem') as string[];
  const memberProfile = formData.get('memberProfile') as string;

  const input: SuggestGiftsInput = {
    wishlistItems,
    memberProfile,
  };

  if (!memberProfile || wishlistItems.length === 0) {
    return { suggestions: null, error: 'Not enough information to suggest gifts.' };
  }

  try {
    const suggestions = await suggestGiftsFlow(input);
    return { suggestions, error: null };
  } catch (e: any) {
    console.error(e);
    return { suggestions: null, error: 'Failed to generate gift suggestions. Please try again.' };
  }
}
