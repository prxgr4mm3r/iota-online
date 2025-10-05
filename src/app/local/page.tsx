'use client';
import React from 'react';
import { makeDeck, shuffle } from '@/lib/iota/deck';
import { validateTurn, scoreTurn, getValidPositions } from '@/lib/iota/rules';
import type { Card, Grid, Pos, TurnPlacement } from '@/lib/iota/types';
import { key } from '@/lib/iota/types';
import Board from '@/components/Board';
import Hand from '@/components/Hand';
import CardV from '@/components/Card';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { Button } from '@mui/material';

type GameMode = 'play' | 'exchange' | 'replace-wild';

type GameState = {
    grid: Grid;
    deck: Card[];
    hands: [Card[], Card[]];
    currentPlayer: 0 | 1;
    scores: [number, number];
    selectedCards: Card[];
    placements: TurnPlacement;
    error: string | null;
    lastScore: number | null;
    mode: GameMode;
    selectedWildPos: Pos | null; // Position of wild card to replace
};

function dealCards(deck: Card[], count: number): [Card[], Card[]] {
    const dealt = deck.slice(0, count);
    const remaining = deck.slice(count);
    return [dealt, remaining];
}

export default function LocalGame() {
    const [gameState, setGameState] = React.useState<GameState | null>(null);
    const [handPanelHeight, setHandPanelHeight] = React.useState(300);
    const [isResizing, setIsResizing] = React.useState(false);

    // Initialize game
    React.useEffect(() => {
        const deck = makeDeck(true);

        // Place first card in cen500
        const [firstCard, ...deckAfterFirst] = deck;
        const initialGrid = new Map<string, Card>();
        initialGrid.set('5:5', firstCard); // center of 11x11 grid

        const [p1Hand, afterP1] = dealCards(deckAfterFirst, 4);
        const [p2Hand, remaining] = dealCards(afterP1, 4);

        setGameState({
            grid: initialGrid,
            deck: remaining,
            hands: [p1Hand, p2Hand],
            currentPlayer: 0,
            scores: [0, 0],
            selectedCards: [],
            placements: [],
            error: null,
            lastScore: null,
            mode: 'play',
            selectedWildPos: null,
        });
    }, []);

    // Create temporary grid with placements for preview
    const previewGrid = React.useMemo(() => {
        if (!gameState) return new Map();
        const grid = new Map(gameState.grid);
        for (const pl of gameState.placements) {
            grid.set(key(pl.pos), pl.card);
        }
        return grid;
    }, [gameState]);

    // Calculate valid positions for selected card
    // NOTE: previewGrid includes current placements, so wild cards are considered
    // with all possible values through validateAllLinesWithWilds()
    const validPositions = React.useMemo(() => {
        if (!gameState || gameState.selectedCards.length === 0) return new Set<string>();
        const selectedCard = gameState.selectedCards[0];

        // getValidPositions internally uses validateTurn which handles wild cards
        // by trying all possible assignments and checking if any makes all lines valid
        const allValidPositions = getValidPositions(previewGrid, selectedCard);

        // If no placements yet, return all valid positions
        if (gameState.placements.length === 0) {
            return allValidPositions;
        }

        // If placements exist, restrict to same line (row or column)
        const firstPlacement = gameState.placements[0];
        const isHorizontalLine = gameState.placements.every(p => p.pos.r === firstPlacement.pos.r);
        const isVerticalLine = gameState.placements.every(p => p.pos.c === firstPlacement.pos.c);

        // Filter valid positions to only those on the same line
        const restrictedPositions = new Set<string>();
        for (const posKey of allValidPositions) {
            const [r, c] = posKey.split(':').map(Number);
            if (isHorizontalLine && r === firstPlacement.pos.r) {
                restrictedPositions.add(posKey);
            } else if (isVerticalLine && c === firstPlacement.pos.c) {
                restrictedPositions.add(posKey);
            }
        }

        return restrictedPositions;
    }, [gameState, previewGrid]);

    // Resize handlers - must be before early return
    React.useEffect(() => {
        if (!isResizing) return;

        const handleMouseMove = (e: MouseEvent) => {
            const newHeight = window.innerHeight - e.clientY;
            const minHeight = 200;
            const maxHeight = window.innerHeight - 300;
            const clampedHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));
            setHandPanelHeight(clampedHeight);
        };

        const handleMouseUp = () => {
            setIsResizing(false);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing]);

    if (!gameState) return <div className="p-8">Loading...</div>;

    const currentHand = gameState.hands[gameState.currentPlayer];

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
    };

    const toggleCardSelection = (card: Card) => {
        setGameState(prev => {
            if (!prev) return prev;
            const isSelected = prev.selectedCards.some(c => c.id === card.id);

            if (prev.mode === 'play') {
                // Play mode: only one card at a time
                return {
                    ...prev,
                    selectedCards: isSelected ? [] : [card],
                    error: null,
                };
            } else if (prev.mode === 'exchange') {
                // Exchange mode: multiple cards
                return {
                    ...prev,
                    selectedCards: isSelected
                        ? prev.selectedCards.filter(c => c.id !== card.id)
                        : [...prev.selectedCards, card],
                    error: null,
                };
            } else {
                // Replace-wild mode: only one card at a time
                return {
                    ...prev,
                    selectedCards: isSelected ? [] : [card],
                    error: null,
                };
            }
        });
    };

    const placeCard = (pos: Pos) => {
        // Replace-wild mode: select wild card on board
        if (gameState.mode === 'replace-wild') {
            const k = key(pos);
            const cardAtPos = gameState.grid.get(k);

            if (!cardAtPos) {
                setGameState(prev =>
                    prev ? { ...prev, error: 'No card at this position' } : prev
                );
                return;
            }

            if (cardAtPos.kind !== 'wild') {
                setGameState(prev =>
                    prev ? { ...prev, error: 'Can only replace wild cards' } : prev
                );
                return;
            }

            setGameState(prev => (prev ? { ...prev, selectedWildPos: pos, error: null } : prev));
            return;
        }

        // Play mode: place card
        if (gameState.selectedCards.length === 0) {
            setGameState(prev => (prev ? { ...prev, error: 'Select a card first' } : prev));
            return;
        }

        const cardToPlace = gameState.selectedCards[0];
        const k = key(pos);

        if (gameState.grid.has(k)) {
            setGameState(prev => (prev ? { ...prev, error: 'Cell already occupied' } : prev));
            return;
        }

        // Check if this card is already placed
        if (gameState.placements.some(p => p.card.id === cardToPlace.id)) {
            setGameState(prev =>
                prev ? { ...prev, error: 'Card already placed this turn' } : prev
            );
            return;
        }

        setGameState(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                placements: [...prev.placements, { card: cardToPlace, pos }],
                selectedCards: prev.selectedCards.slice(1),
                error: null,
            };
        });
    };

    const cancelTurn = () => {
        setGameState(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                placements: [],
                selectedCards: [],
                error: null,
                lastScore: null,
                mode: prev.mode,
                selectedWildPos: null,
            };
        });
    };

    const submitTurn = () => {
        if (gameState.placements.length === 0) {
            setGameState(prev => (prev ? { ...prev, error: 'Place at least one card' } : prev));
            return;
        }

        const validation = validateTurn(gameState.grid, gameState.placements);

        if (!validation.ok) {
            setGameState(prev => (prev ? { ...prev, error: validation.reason } : prev));
            return;
        }

        const score = scoreTurn(gameState.grid, gameState.placements);

        setGameState(prev => {
            if (!prev) return prev;

            // Update grid
            const newGrid = new Map(prev.grid);
            for (const pl of prev.placements) {
                newGrid.set(key(pl.pos), pl.card);
            }

            // Remove placed cards from hand
            const placedIds = new Set(prev.placements.map(p => p.card.id));
            const newHand = prev.hands[prev.currentPlayer].filter(c => !placedIds.has(c.id));

            // Draw new cards
            const cardsToDraw = Math.min(4 - newHand.length, prev.deck.length);
            const [drawnCards, remainingDeck] = dealCards(prev.deck, cardsToDraw);
            const updatedHand = [...newHand, ...drawnCards];

            // Update hands array
            const newHands: [Card[], Card[]] = [...prev.hands] as [Card[], Card[]];
            newHands[prev.currentPlayer] = updatedHand;

            // Update scores
            const newScores: [number, number] = [...prev.scores] as [number, number];
            newScores[prev.currentPlayer] += score.total;

            // Switch player
            const nextPlayer = (prev.currentPlayer === 0 ? 1 : 0) as 0 | 1;

            return {
                ...prev,
                grid: newGrid,
                deck: remainingDeck,
                hands: newHands,
                currentPlayer: nextPlayer,
                scores: newScores,
                selectedCards: [],
                placements: [],
                error: null,
                lastScore: score.total,
                mode: prev.mode,
                selectedWildPos: null,
            };
        });
    };

    const exchangeCards = () => {
        if (gameState.selectedCards.length === 0) {
            setGameState(prev => (prev ? { ...prev, error: 'Select cards to exchange' } : prev));
            return;
        }

        setGameState(prev => {
            if (!prev) return prev;

            // Return selected cards to deck and shuffle
            const newDeck = shuffle([...prev.deck, ...prev.selectedCards]);

            // Remove selected cards from hand
            const selectedIds = new Set(prev.selectedCards.map(c => c.id));
            const newHand = prev.hands[prev.currentPlayer].filter(c => !selectedIds.has(c.id));

            // Draw same number of new cards
            const cardsToDraw = Math.min(prev.selectedCards.length, newDeck.length);
            const [drawnCards, remainingDeck] = dealCards(newDeck, cardsToDraw);
            const updatedHand = [...newHand, ...drawnCards];

            // Update hands array
            const newHands: [Card[], Card[]] = [...prev.hands] as [Card[], Card[]];
            newHands[prev.currentPlayer] = updatedHand;

            // Switch player
            const nextPlayer = (prev.currentPlayer === 0 ? 1 : 0) as 0 | 1;

            return {
                ...prev,
                deck: remainingDeck,
                hands: newHands,
                currentPlayer: nextPlayer,
                selectedCards: [],
                placements: [],
                error: null,
                lastScore: null,
                selectedWildPos: null,
            };
        });
    };

    const replaceWild = () => {
        if (!gameState.selectedWildPos) {
            setGameState(prev =>
                prev ? { ...prev, error: 'Select a wild card on the board' } : prev
            );
            return;
        }

        if (gameState.selectedCards.length === 0) {
            setGameState(prev =>
                prev ? { ...prev, error: 'Select a card from your hand' } : prev
            );
            return;
        }

        const replacementCard = gameState.selectedCards[0];
        const wildPos = gameState.selectedWildPos;
        const k = key(wildPos);

        // Check if replacement card fits all lines the wild is part of
        const wildCard = gameState.grid.get(k)!;

        // Create test grid with replacement to validate
        const testGrid = new Map(gameState.grid);
        testGrid.set(k, replacementCard);

        // Validate by checking if placing the replacement card would be valid
        // We simulate this by temporarily removing the wild and placing the replacement
        const gridWithoutWild = new Map(gameState.grid);
        gridWithoutWild.delete(k);

        const validation = validateTurn(gridWithoutWild, [{ card: replacementCard, pos: wildPos }]);

        if (!validation.ok) {
            setGameState(prev =>
                prev ? { ...prev, error: 'Replacement card does not fit the existing lines' } : prev
            );
            return;
        }

        // Perform replacement
        setGameState(prev => {
            if (!prev) return prev;

            const newGrid = new Map(prev.grid);
            newGrid.set(k, replacementCard);

            // Remove replacement card from hand and add wild card
            const newHand = prev.hands[prev.currentPlayer]
                .filter(c => c.id !== replacementCard.id)
                .concat(wildCard);

            const newHands: [Card[], Card[]] = [...prev.hands] as [Card[], Card[]];
            newHands[prev.currentPlayer] = newHand;

            // Does NOT switch player - this is not a turn, just a swap
            return {
                ...prev,
                grid: newGrid,
                hands: newHands,
                selectedCards: [],
                selectedWildPos: null,
                error: null,
                mode: 'play', // Automatically switch back to play mode
            };
        });
    };

    const canSubmit = gameState.placements.length > 0;

    return (
        <main className="flex h-screen flex-col overflow-hidden bg-gray-100 p-8">
            <div className="mx-auto flex h-full w-full max-w-7xl flex-col">
                <div className="mb-6 rounded-lg bg-white p-4 shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">IOTA - Local Game</h1>
                            <p className="text-gray-600">
                                Current Player: Player {gameState.currentPlayer + 1}
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-600">Scores</div>
                            <div className="text-lg font-semibold">
                                P1: {gameState.scores[0]} | P2: {gameState.scores[1]}
                            </div>
                            <div className="text-xs text-gray-500">
                                Cards in deck: {gameState.deck.length}
                            </div>
                        </div>
                    </div>

                    {gameState.lastScore !== null && (
                        <div className="mt-3 rounded bg-green-100 p-2 text-green-800">
                            Last turn scored: {gameState.lastScore} points!
                        </div>
                    )}

                    {gameState.error && (
                        <div className="mt-3 rounded bg-red-100 p-2 text-red-800">
                            Error: {gameState.error}
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-hidden rounded-lg p-4 shadow" style={{
                    background: 'linear-gradient(135deg, #8B7355 0%, #A0826D 25%, #8B7355 50%, #6F5743 75%, #8B7355 100%)',
                    backgroundSize: '400% 400%'
                }}>
                    <TransformWrapper
                        initialScale={1}
                        minScale={0.3}
                        maxScale={2}
                        centerOnInit={true}
                        centerZoomedOut={true}
                        wheel={{ step: 0.1 }}
                        panning={{ disabled: false }}
                    >
                        <TransformComponent
                            wrapperClass="!w-full !h-full !overflow-hidden"
                            contentClass="!flex !items-center !justify-center"
                        >
                            <div className="flex items-center justify-center">
                                <Board
                                    grid={previewGrid}
                                    onDrop={placeCard}
                                    validPositions={validPositions}
                                    replaceWildMode={gameState.mode === 'replace-wild'}
                                    selectedWildPos={gameState.selectedWildPos}
                                />
                            </div>
                        </TransformComponent>
                    </TransformWrapper>
                </div>

                {/* Resize Handle */}
                <div
                    className={`group relative flex h-8 cursor-row-resize items-center justify-center border-y-2 transition-colors ${
                        isResizing ? 'border-blue-400 bg-blue-200' : 'border-gray-300 bg-gray-200 hover:border-blue-400 hover:bg-blue-100'
                    }`}
                    onMouseDown={handleMouseDown}
                >
                    <div className="h-1.5 w-24 rounded-full bg-gray-500 transition-colors group-hover:bg-blue-600"></div>
                </div>

                <div
                    className="flex flex-shrink-0 flex-col rounded-lg bg-white p-4 shadow"
                    style={{ height: `${handPanelHeight}px` }}
                >
                    {/* Cards container with scroll */}
                    <div className="mb-4 flex-1 overflow-auto">
                        {gameState.mode === 'replace-wild' && gameState.selectedWildPos && (
                            <div className="mb-3 rounded bg-purple-50 p-2">
                                <div className="text-sm text-purple-800">
                                    Wild card selected at position ({gameState.selectedWildPos.r},
                                    {gameState.selectedWildPos.c}). Now select a replacement card
                                    from your hand.
                                </div>
                            </div>
                        )}

                        {gameState.placements.length > 0 && (
                            <div className="mb-3 rounded bg-blue-50 p-2">
                                <div className="mb-2 text-sm text-blue-800">
                                    Cards to place this turn:
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {gameState.placements.map((pl, idx) => (
                                        <div
                                            key={idx}
                                            className="rounded border bg-white p-2 text-xs"
                                        >
                                            <CardV card={pl.card} />
                                            <div className="mt-1 text-center">
                                                @ ({pl.pos.r},{pl.pos.c})
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex flex-wrap gap-2">
                            {currentHand.map(card => {
                                const isSelected = gameState.selectedCards.some(
                                    c => c.id === card.id
                                );
                                const isPlaced = gameState.placements.some(
                                    p => p.card.id === card.id
                                );

                                return (
                                    <button
                                        key={card.id}
                                        onClick={() => !isPlaced && toggleCardSelection(card)}
                                        disabled={isPlaced}
                                        className={`transition-transform focus:outline-none ${
                                            isSelected ? '-translate-y-2 ring-4 ring-blue-500' : ''
                                        } ${isPlaced ? 'cursor-not-allowed opacity-40' : 'hover:scale-105'}`}
                                    >
                                        <CardV card={card} />
                                    </button>
                                );
                            })}
                        </div>

                        {currentHand.length === 0 && gameState.deck.length === 0 && (
                            <div className="py-8 text-center text-gray-500">
                                Game Over! Final Scores: P1: {gameState.scores[0]}, P2:{' '}
                                {gameState.scores[1]}
                            </div>
                        )}
                    </div>

                    {/* Controls at bottom */}
                    <div className="flex-shrink-0 space-y-3 border-t border-gray-200 pt-3">
                        {/* Mode Toggle */}
                        <div className="flex gap-3">
                            <Button
                                onClick={() =>
                                    setGameState(prev =>
                                        prev
                                            ? {
                                                  ...prev,
                                                  mode: 'play',
                                                  selectedCards: [],
                                                  placements: [],
                                                  selectedWildPos: null,
                                                  error: null,
                                              }
                                            : prev
                                    )
                                }
                                variant={gameState.mode === 'play' ? 'contained' : 'outlined'}
                                color="primary"
                                size="medium"
                                sx={{ flex: 1, py: 1.5, fontSize: '0.875rem', fontWeight: 'bold' }}
                            >
                                🎮 Play
                            </Button>
                            <Button
                                onClick={() =>
                                    setGameState(prev =>
                                        prev
                                            ? {
                                                  ...prev,
                                                  mode: 'exchange',
                                                  selectedCards: [],
                                                  placements: [],
                                                  selectedWildPos: null,
                                                  error: null,
                                              }
                                            : prev
                                    )
                                }
                                variant={gameState.mode === 'exchange' ? 'contained' : 'outlined'}
                                color="warning"
                                size="medium"
                                sx={{ flex: 1, py: 1.5, fontSize: '0.875rem', fontWeight: 'bold' }}
                            >
                                🔄 Exchange
                            </Button>
                            <Button
                                onClick={() =>
                                    setGameState(prev =>
                                        prev
                                            ? {
                                                  ...prev,
                                                  mode: 'replace-wild',
                                                  selectedCards: [],
                                                  placements: [],
                                                  selectedWildPos: null,
                                                  error: null,
                                              }
                                            : prev
                                    )
                                }
                                variant={gameState.mode === 'replace-wild' ? 'contained' : 'outlined'}
                                color="secondary"
                                size="medium"
                                sx={{ flex: 1, py: 1.5, fontSize: '0.875rem', fontWeight: 'bold' }}
                            >
                                🃏 Wild
                            </Button>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center justify-between gap-3">
                            <div className="text-sm font-medium text-gray-500">
                                {gameState.mode === 'play' && '💡 Select 1 card to play'}
                                {gameState.mode === 'exchange' && '💡 Select cards to exchange'}
                                {gameState.mode === 'replace-wild' &&
                                    '💡 Click wild, then select card'}
                            </div>
                            <div className="flex gap-2">
                                {gameState.mode === 'play' && gameState.placements.length > 0 && (
                                    <Button
                                        onClick={cancelTurn}
                                        variant="contained"
                                        color="inherit"
                                        size="small"
                                        sx={{ py: 1.25, fontSize: '0.75rem', fontWeight: 'bold' }}
                                    >
                                        ✕ Cancel
                                    </Button>
                                )}
                                {gameState.mode === 'play' ? (
                                    <Button
                                        onClick={submitTurn}
                                        disabled={!canSubmit}
                                        variant="contained"
                                        color="primary"
                                        size="small"
                                        sx={{ py: 1.25, fontSize: '0.75rem', fontWeight: 'bold' }}
                                    >
                                        ✓ Submit Turn
                                    </Button>
                                ) : gameState.mode === 'exchange' ? (
                                    <Button
                                        onClick={exchangeCards}
                                        disabled={gameState.selectedCards.length === 0}
                                        variant="contained"
                                        color="warning"
                                        size="small"
                                        sx={{ py: 1.25, fontSize: '0.75rem', fontWeight: 'bold' }}
                                    >
                                        🔄 Exchange {gameState.selectedCards.length} Card
                                        {gameState.selectedCards.length !== 1 ? 's' : ''}
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={replaceWild}
                                        disabled={
                                            !gameState.selectedWildPos ||
                                            gameState.selectedCards.length === 0
                                        }
                                        variant="contained"
                                        color="secondary"
                                        size="small"
                                        sx={{ py: 1.25, fontSize: '0.75rem', fontWeight: 'bold' }}
                                    >
                                        🃏 Replace Wild
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
