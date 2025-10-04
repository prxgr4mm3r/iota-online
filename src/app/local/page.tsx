'use client';
import React from 'react';
import { makeDeck } from '@/lib/iota/deck';
import { validateTurn, scoreTurn, getValidPositions } from '@/lib/iota/rules';
import type { Card, Grid, Pos, TurnPlacement } from '@/lib/iota/types';
import { key } from '@/lib/iota/types';
import Board from '@/components/Board';
import Hand from '@/components/Hand';
import CardV from '@/components/Card';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

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
};

function dealCards(deck: Card[], count: number): [Card[], Card[]] {
  const dealt = deck.slice(0, count);
  const remaining = deck.slice(count);
  return [dealt, remaining];
}

export default function LocalGame() {
  const [gameState, setGameState] = React.useState<GameState | null>(null);

  // Initialize game
  React.useEffect(() => {
    const deck = makeDeck(true);

    // Place first card in center
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
  const validPositions = React.useMemo(() => {
    if (!gameState || gameState.selectedCards.length === 0) return new Set<string>();
    const selectedCard = gameState.selectedCards[0];
    return getValidPositions(previewGrid, selectedCard);
  }, [gameState, previewGrid]);

  if (!gameState) return <div className="p-8">Loading...</div>;

  const currentHand = gameState.hands[gameState.currentPlayer];

  const toggleCardSelection = (card: Card) => {
    setGameState(prev => {
      if (!prev) return prev;
      const isSelected = prev.selectedCards.some(c => c.id === card.id);
      return {
        ...prev,
        selectedCards: isSelected
          ? prev.selectedCards.filter(c => c.id !== card.id)
          : [...prev.selectedCards, card],
        error: null,
      };
    });
  };

  const placeCard = (pos: Pos) => {
    if (gameState.selectedCards.length === 0) {
      setGameState(prev => prev ? { ...prev, error: 'Select a card first' } : prev);
      return;
    }

    const cardToPlace = gameState.selectedCards[0];
    const k = key(pos);

    if (gameState.grid.has(k)) {
      setGameState(prev => prev ? { ...prev, error: 'Cell already occupied' } : prev);
      return;
    }

    // Check if this card is already placed
    if (gameState.placements.some(p => p.card.id === cardToPlace.id)) {
      setGameState(prev => prev ? { ...prev, error: 'Card already placed this turn' } : prev);
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
      };
    });
  };

  const submitTurn = () => {
    if (gameState.placements.length === 0) {
      setGameState(prev => prev ? { ...prev, error: 'Place at least one card' } : prev);
      return;
    }

    const validation = validateTurn(gameState.grid, gameState.placements);

    if (!validation.ok) {
      setGameState(prev => prev ? { ...prev, error: validation.reason } : prev);
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
        grid: newGrid,
        deck: remainingDeck,
        hands: newHands,
        currentPlayer: nextPlayer,
        scores: newScores,
        selectedCards: [],
        placements: [],
        error: null,
        lastScore: score.total,
      };
    });
  };

  const canSubmit = gameState.placements.length > 0;

  return (
    <main className="p-8 min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">IOTA - Local Game</h1>
              <p className="text-gray-600">Current Player: Player {gameState.currentPlayer + 1}</p>
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
            <div className="mt-3 p-2 bg-green-100 text-green-800 rounded">
              Last turn scored: {gameState.lastScore} points!
            </div>
          )}

          {gameState.error && (
            <div className="mt-3 p-2 bg-red-100 text-red-800 rounded">
              Error: {gameState.error}
            </div>
          )}
        </div>

        <div className="mb-6 bg-white rounded-lg shadow p-4">
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
              wrapperClass="!w-full !h-[600px] !overflow-hidden"
              contentClass="!flex !items-center !justify-center"
            >
              <div className="flex items-center justify-center">
                <Board grid={previewGrid} onDrop={placeCard} validPositions={validPositions} />
              </div>
            </TransformComponent>
          </TransformWrapper>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-lg">Your Hand (Player {gameState.currentPlayer + 1})</h3>
            <div className="flex gap-2">
              {gameState.placements.length > 0 && (
                <button
                  onClick={cancelTurn}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={submitTurn}
                disabled={!canSubmit}
                className={`px-4 py-2 rounded text-white ${
                  canSubmit
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                Submit Turn
              </button>
            </div>
          </div>

          {gameState.placements.length > 0 && (
            <div className="mb-3 p-2 bg-blue-50 rounded">
              <div className="text-sm text-blue-800 mb-2">Cards to place this turn:</div>
              <div className="flex gap-2 flex-wrap">
                {gameState.placements.map((pl, idx) => (
                  <div key={idx} className="text-xs bg-white p-2 rounded border">
                    <CardV card={pl.card} />
                    <div className="text-center mt-1">@ ({pl.pos.r},{pl.pos.c})</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            {currentHand.map(card => {
              const isSelected = gameState.selectedCards.some(c => c.id === card.id);
              const isPlaced = gameState.placements.some(p => p.card.id === card.id);

              return (
                <button
                  key={card.id}
                  onClick={() => !isPlaced && toggleCardSelection(card)}
                  disabled={isPlaced}
                  className={`focus:outline-none transition-transform ${
                    isSelected ? 'ring-4 ring-blue-500 -translate-y-2' : ''
                  } ${isPlaced ? 'opacity-40 cursor-not-allowed' : 'hover:scale-105'}`}
                >
                  <CardV card={card} />
                </button>
              );
            })}
          </div>

          {currentHand.length === 0 && gameState.deck.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              Game Over! Final Scores: P1: {gameState.scores[0]}, P2: {gameState.scores[1]}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
