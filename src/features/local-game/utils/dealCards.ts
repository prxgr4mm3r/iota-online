import type { Card } from '@/lib/iota/types';

export function dealCards(deck: Card[], count: number): [Card[], Card[]] {
    const dealt = deck.slice(0, count);
    const remaining = deck.slice(count);
    return [dealt, remaining];
}
