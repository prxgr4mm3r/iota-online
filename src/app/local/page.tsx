'use client';
import React from 'react';
import { makeDeck } from '@/lib/iota/deck';
import type { Card, Pos } from '@/lib/iota/types';
import { key } from '@/lib/iota/types';
import { getValidPositions } from '@/lib/iota/rules';
import { useGameState } from '@/features/local-game/hooks/useGameState';
import { useGameActions } from '@/features/local-game/hooks/useGameActions';
import { useGridBounds } from '@/features/local-game/hooks/useGridBounds';
import { useResizablePanel } from '@/features/local-game/hooks/useResizablePanel';
import { ScoreDisplay } from '@/features/local-game/components/ScoreDisplay';
import { GameMessages } from '@/features/local-game/components/GameMessages';
import { GameBoard } from '@/features/local-game/components/GameBoard';
import { HandPanel } from '@/features/local-game/components/HandPanel';
import { ModeToggle } from '@/features/local-game/components/ModeToggle';
import { ActionButtons } from '@/features/local-game/components/ActionButtons';

export default function LocalGame() {
    const { gameState, setGameState } = useGameState();
    const { handWidth, isResizing, handleMouseDown } = useResizablePanel(300);
    const [selectedWildPos, setSelectedWildPos] = React.useState<Pos | null>(null);

    const { toggleCardSelection, handleDrop, handleSubmit, handlePass, handleReplaceWild } =
        useGameActions(gameState, setGameState);

    // Create preview grid with placements
    const previewGrid = React.useMemo(() => {
        if (!gameState) return new Map();
        const grid = new Map(gameState.grid);
        for (const pl of gameState.placements) {
            grid.set(key(pl.pos), pl.card);
        }
        return grid;
    }, [gameState]);

    const gridBounds = useGridBounds(previewGrid);

    // Calculate valid positions
    const validPositions = React.useMemo(() => {
        if (!gameState || gameState.mode !== 'play' || gameState.selectedCards.length !== 1) {
            return new Set<string>();
        }
        return getValidPositions(gameState.grid, gameState.selectedCards[0]);
    }, [gameState]);

    // Wild card positions for replace mode
    const wildPositions = React.useMemo(() => {
        if (!gameState) return [];
        const positions: Pos[] = [];
        for (const [k, card] of gameState.grid.entries()) {
            if (card.kind === 'wild') {
                const [r, c] = k.split(':').map(Number);
                positions.push({ r, c });
            }
        }
        return positions;
    }, [gameState]);

    const handleCardClick = (card: Card) => {
        if (!gameState) return;
        if (gameState.mode === 'replaceWild') {
            if (card.kind === 'wild') return;
            if (!selectedWildPos) return;
            handleReplaceWild(selectedWildPos, card);
            setSelectedWildPos(null);
        } else {
            toggleCardSelection(card);
        }
    };

    const handleModeChange = (mode: 'play' | 'replaceWild' | 'draw') => {
        if (!gameState) return;
        setGameState((prev) => prev ? ({ ...prev, mode, selectedCards: [] }) : prev);
        setSelectedWildPos(null);
    };

    const handleReset = () => {
        const deck = makeDeck(true);
        const [firstCard, ...rest1] = deck;
        const [hand1, rest2] = [rest1.slice(0, 4), rest1.slice(4)];
        const [hand2, finalDeck] = [rest2.slice(0, 4), rest2.slice(4)];

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
            mode: 'play',
            message: null,
            scoringMessage: null,
        });
    };

    const handleBoardDrop = (pos: Pos) => {
        if (!gameState) return;
        if (gameState.mode === 'replaceWild') {
            setSelectedWildPos(pos);
        } else {
            handleDrop(pos);
        }
    };

    if (!gameState) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-100">
                <div className="text-xl font-semibold text-gray-700">Loading...</div>
            </div>
        );
    }

    const currentHand = gameState.hands[gameState.currentPlayer];

    // Calculate how many cards are placed
    const placedCardsCount = gameState.placements.length;

    return (
        <div className="flex h-screen flex-col bg-gray-100 p-8">
            <ScoreDisplay scores={gameState.scores} currentPlayer={gameState.currentPlayer} />
            <GameMessages message={gameState.message} scoringMessage={gameState.scoringMessage} />

            <div className="flex flex-1 gap-4 overflow-hidden">
                <GameBoard
                    previewGrid={previewGrid}
                    validPositions={validPositions}
                    replaceWildMode={gameState.mode === 'replaceWild'}
                    selectedWildPos={selectedWildPos}
                    gridBounds={gridBounds}
                    onDrop={handleBoardDrop}
                />

                <div
                    className={`group relative flex w-8 cursor-col-resize flex-col items-center justify-center border-x-2 transition-colors ${
                        isResizing
                            ? 'border-blue-400 bg-blue-200'
                            : 'border-gray-300 bg-gray-200 hover:border-blue-400 hover:bg-blue-100'
                    }`}
                    onMouseDown={handleMouseDown}
                >
                    <div className="h-24 w-1.5 rounded-full bg-gray-500 transition-colors group-hover:bg-blue-600"></div>
                </div>

                <div className="flex flex-col gap-3 overflow-hidden" style={{ width: `${handWidth}px` }}>
                    <HandPanel
                        hand={currentHand}
                        selectedCards={gameState.selectedCards}
                        deckSize={gameState.deck.length}
                        onCardClick={handleCardClick}
                    />
                    <div className="mt-auto flex flex-col gap-2">
                        <ModeToggle currentMode={gameState.mode} onModeChange={handleModeChange} />
                        <ActionButtons
                            mode={gameState.mode}
                            selectedCardsCount={gameState.selectedCards.length}
                            placedCardsCount={placedCardsCount}
                            onSubmit={handleSubmit}
                            onPass={handlePass}
                            onReset={handleReset}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
