'use client';
import React from 'react';
import type { Card } from '@/lib/iota/types';
import CardV from './Card';

export default function Hand({ cards, onPick }: { cards: Card[]; onPick: (c: Card) => void }) {
    return (
        <div className="flex flex-wrap items-center justify-center gap-3">
            {cards.map(c => (
                <button key={c.id} onClick={() => onPick(c)} className="focus:outline-none">
                    <CardV card={c} />
                </button>
            ))}
        </div>
    );
}
