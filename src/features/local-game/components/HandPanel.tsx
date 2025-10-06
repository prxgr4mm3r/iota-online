'use client';
import React from 'react';
import type { Card } from '@/lib/iota/types';
import CardV from '@/components/Card';

interface HandPanelProps {
    hand: Card[];
    selectedCards: Card[];
    deckSize: number;
    onCardClick: (card: Card) => void;
}

export function HandPanel({ hand, selectedCards, deckSize, onCardClick }: HandPanelProps) {
    return (
        <div className="flex h-full flex-col rounded-lg bg-white p-4 shadow">
            <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-700">Your Hand</h3>
                <span className="text-sm text-gray-500">Deck: {deckSize}</span>
            </div>
            <div className="flex flex-1 flex-col items-center gap-3 overflow-y-auto rounded-lg bg-gray-200 p-3">
                {hand.map((card) => {
                    const isSelected = selectedCards.some((c) => c.id === card.id);
                    return (
                        <div
                            key={card.id}
                            onClick={() => onCardClick(card)}
                            className={`cursor-pointer transition-transform hover:scale-105 ${
                                isSelected ? 'ring-4 ring-blue-500 ring-offset-2' : ''
                            }`}
                        >
                            <CardV card={card} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
