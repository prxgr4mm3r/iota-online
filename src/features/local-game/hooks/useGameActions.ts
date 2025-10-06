'use client';
import { useCallback } from 'react';
import type { Card, Pos } from '@/lib/iota/types';
import { key } from '@/lib/iota/types';
import { validateTurn, scoreTurn, getValidPositions } from '@/lib/iota/rules';
import { dealCards } from '../utils/dealCards';
import type { GameState } from '../types';

export function useGameActions(
    gameState: GameState | null,
    setGameState: React.Dispatch<React.SetStateAction<GameState | null>>
) {
    const toggleCardSelection = useCallback(
        (card: Card) => {
            setGameState((prev) => {
                if (!prev) return prev;
                const alreadySelected = prev.selectedCards.some((c) => c.id === card.id);
                if (alreadySelected) {
                    return {
                        ...prev,
                        selectedCards: prev.selectedCards.filter((c) => c.id !== card.id),
                    };
                } else {
                    return { ...prev, selectedCards: [...prev.selectedCards, card] };
                }
            });
        },
        [setGameState]
    );

    const handleDrop = useCallback(
        (pos: Pos) => {
            setGameState((prev) => {
                if (!prev) return prev;
                if (prev.mode === 'replaceWild') {
                    return prev;
                }

                if (prev.mode === 'draw') {
                    return prev;
                }

                const card = prev.selectedCards[0];
                if (!card) return prev;

                const newPlacements = [...prev.placements, { card, pos }];
                const validation = validateTurn(prev.grid, newPlacements);

                if (!validation.ok) {
                    return { ...prev, message: validation.reason, scoringMessage: null };
                }

                const newHand = prev.hands[prev.currentPlayer].filter((c) => c.id !== card.id);
                const newHands: [Card[], Card[]] =
                    prev.currentPlayer === 0
                        ? [newHand, prev.hands[1]]
                        : [prev.hands[0], newHand];

                return {
                    ...prev,
                    hands: newHands,
                    placements: newPlacements,
                    selectedCards: [],
                    message: null,
                };
            });
        },
        [setGameState]
    );

    const handleSubmit = useCallback(() => {
        setGameState((prev) => {
            if (!prev) return prev;

            if (prev.placements.length === 0) {
                return { ...prev, message: 'No cards placed', scoringMessage: null };
            }

            const validation = validateTurn(prev.grid, prev.placements);
            if (!validation.ok) {
                return { ...prev, message: validation.reason, scoringMessage: null };
            }

            const score = scoreTurn(prev.grid, prev.placements);
            const newScores: [number, number] =
                prev.currentPlayer === 0
                    ? [prev.scores[0] + score.total, prev.scores[1]]
                    : [prev.scores[0], prev.scores[1] + score.total];

            // Apply placements to grid
            const newGrid = new Map(prev.grid);
            for (const pl of prev.placements) {
                newGrid.set(key(pl.pos), pl.card);
            }

            const cardsToRefill = prev.placements.length;
            const [refill, newDeck] = dealCards(prev.deck, cardsToRefill);
            const newHand = [...prev.hands[prev.currentPlayer], ...refill];
            const newHands: [Card[], Card[]] =
                prev.currentPlayer === 0 ? [newHand, prev.hands[1]] : [prev.hands[0], newHand];

            return {
                ...prev,
                grid: newGrid,
                deck: newDeck,
                hands: newHands,
                scores: newScores,
                currentPlayer: (prev.currentPlayer + 1) % 2,
                selectedCards: [],
                placements: [],
                message: null,
                scoringMessage: `+${score.total} points`,
            };
        });
    }, [setGameState]);

    const handlePass = useCallback(() => {
        setGameState((prev) => {
            if (!prev) return prev;
            const cardsToRefill = prev.selectedCards.length;
            if (cardsToRefill === 0) {
                return { ...prev, message: 'No cards selected', scoringMessage: null };
            }

            if (prev.deck.length < cardsToRefill) {
                return {
                    ...prev,
                    message: 'Not enough cards in deck',
                    scoringMessage: null,
                };
            }

            const [refill, newDeck] = dealCards(prev.deck, cardsToRefill);
            const newHand = [
                ...prev.hands[prev.currentPlayer].filter(
                    (c) => !prev.selectedCards.some((sc) => sc.id === c.id)
                ),
                ...refill,
            ];
            const newHands: [Card[], Card[]] =
                prev.currentPlayer === 0 ? [newHand, prev.hands[1]] : [prev.hands[0], newHand];

            return {
                ...prev,
                deck: newDeck,
                hands: newHands,
                currentPlayer: (prev.currentPlayer + 1) % 2,
                selectedCards: [],
                message: null,
                scoringMessage: null,
            };
        });
    }, [setGameState]);

    const handleReplaceWild = useCallback(
        (wildPos: Pos, replacementCard: Card) => {
            setGameState((prev) => {
                if (!prev) return prev;
                const wildCard = prev.grid.get(key(wildPos));
                if (!wildCard || wildCard.kind !== 'wild') return prev;

                const newGrid = new Map(prev.grid);
                newGrid.set(key(wildPos), replacementCard);

                const newHand = [
                    ...prev.hands[prev.currentPlayer].filter((c) => c.id !== replacementCard.id),
                    wildCard,
                ];
                const newHands: [Card[], Card[]] =
                    prev.currentPlayer === 0 ? [newHand, prev.hands[1]] : [prev.hands[0], newHand];

                return {
                    ...prev,
                    grid: newGrid,
                    hands: newHands,
                    selectedCards: [],
                    mode: 'play',
                    currentPlayer: (prev.currentPlayer + 1) % 2,
                    message: null,
                    scoringMessage: 'Wild card replaced',
                };
            });
        },
        [setGameState]
    );

    return {
        toggleCardSelection,
        handleDrop,
        handleSubmit,
        handlePass,
        handleReplaceWild,
    };
}
