'use client';
import { useState, useEffect } from 'react';
import type { Card } from '@/lib/iota/types';
import { makeDeck } from '@/lib/iota/deck';
import { dealCards } from '../utils/dealCards';
import type { GameState } from '../types';

export function useGameState() {
    const [gameState, setGameState] = useState<GameState | null>(null);

    useEffect(() => {
        const deck = makeDeck(true);
        const [firstCard, ...rest1] = deck;
        const [hand1, rest2] = dealCards(rest1, 4);
        const [hand2, finalDeck] = dealCards(rest2, 4);

        const initialGrid = new Map<string, Card>();
        initialGrid.set('0:0', firstCard);

        setGameState({
            deck: finalDeck,
            grid: initialGrid,
            hands: [hand1, hand2],
            scores: [0, 0],
            currentPlayer: 0,
            selectedCards: [],
            placements: [],
            mode: 'play' as const,
            message: null,
            scoringMessage: null,
        });
    }, []);

    return { gameState, setGameState };
}
