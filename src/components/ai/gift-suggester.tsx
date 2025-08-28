'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { suggestGiftsAction } from '@/app/actions/suggest-gifts-action';
import type { Member } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Bot, Loader2, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '../ui/badge';

interface GiftSuggesterProps {
  recipient: Member;
}

const initialState = {
  suggestions: null,
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Thinking...
        </>
      ) : (
        <>
          <Bot className="mr-2 h-4 w-4" />
          Get AI Gift Suggestions
        </>
      )}
    </Button>
  );
}

export default function GiftSuggester({ recipient }: GiftSuggesterProps) {
  const [state, formAction] = useActionState(suggestGiftsAction, initialState);

  return (
    <div>
      <form action={formAction}>
        {recipient.wishlist.map((item, index) => (
          <input key={index} type="hidden" name="wishlistItem" value={`${item.name}: ${item.description}`} />
        ))}
        <input type="hidden" name="memberProfile" value={`Name: ${recipient.name}, Wishlist: ${recipient.wishlist.map(i => i.name).join(', ')}`} />
        <SubmitButton />
      </form>

      {state.error && (
        <Alert variant="destructive" className="mt-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {state.suggestions && (
        <div className="mt-6">
          <h4 className="text-lg font-semibold font-headline mb-2">AI Suggestions:</h4>
          {state.suggestions.length === 0 ? (
            <p className="text-muted-foreground">The AI couldn't find specific products on Shopee/Lazada for this wishlist.</p>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {state.suggestions.map((suggestion, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger className="font-semibold text-left hover:no-underline">
                    {suggestion.itemName}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-4 text-muted-foreground">{suggestion.itemDescription}</p>
                    <div className="flex flex-wrap gap-2">
                      {suggestion.lazadaAffiliateLink && (
                        <Button asChild variant="outline" size="sm">
                          <Link href={suggestion.lazadaAffiliateLink} target="_blank" rel="noopener noreferrer">
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Buy on Lazada
                          </Link>
                        </Button>
                      )}
                      {suggestion.shopeeAffiliateLink && (
                        <Button asChild variant="outline" size="sm">
                           <Link href={suggestion.shopeeAffiliateLink} target="_blank" rel="noopener noreferrer">
                             <ShoppingCart className="mr-2 h-4 w-4" />
                            Buy on Shopee
                           </Link>
                        </Button>
                      )}
                       {!suggestion.lazadaAffiliateLink && !suggestion.shopeeAffiliateLink && (
                          <Badge variant="secondary">No direct shopping links found</Badge>
                       )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      )}
    </div>
  );
}
