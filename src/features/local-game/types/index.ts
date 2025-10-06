import type { Card, Grid, TurnPlacement } from '@/lib/iota/types';

export type GameMode = 'play' | 'replaceWild' | 'draw';

export interface GameState {
    deck: Card[];
    grid: Grid;
    hands: [Card[], Card[]];
    scores: [number, number];
    currentPlayer: number;
    selectedCards: Card[];
    placements: TurnPlacement;
    mode: GameMode;
    message: string | null;
    scoringMessage: string | null;
}

export interface GridBounds {
    minRow: number;
    maxRow: number;
    minCol: number;
    maxCol: number;
}
