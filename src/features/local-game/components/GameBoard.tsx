'use client';
import React from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import type { Grid, Pos } from '@/lib/iota/types';
import Board from '@/components/Board';
import type { GridBounds } from '../types';

interface GameBoardProps {
    previewGrid: Grid;
    validPositions: Set<string>;
    replaceWildMode: boolean;
    selectedWildPos: Pos | null;
    gridBounds: GridBounds;
    onDrop: (pos: Pos) => void;
}

export function GameBoard({
    previewGrid,
    validPositions,
    replaceWildMode,
    selectedWildPos,
    gridBounds,
    onDrop,
}: GameBoardProps) {
    return (
        <div
            className="flex-1 overflow-hidden rounded-lg p-4 shadow"
            style={{
                background:
                    'linear-gradient(135deg, #8B7355 0%, #A0826D 25%, #8B7355 50%, #6F5743 75%, #8B7355 100%)',
                backgroundSize: '400% 400%',
            }}
        >
            <TransformWrapper
                initialScale={1}
                minScale={0.3}
                maxScale={3}
                centerOnInit
                wheel={{ step: 0.1 }}
            >
                <TransformComponent
                    wrapperStyle={{
                        width: '100%',
                        height: '100%',
                        overflow: 'visible',
                    }}
                    contentStyle={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <Board
                        grid={previewGrid}
                        onDrop={onDrop}
                        validPositions={validPositions}
                        replaceWildMode={replaceWildMode}
                        selectedWildPos={selectedWildPos}
                        bounds={gridBounds}
                    />
                </TransformComponent>
            </TransformWrapper>
        </div>
    );
}
