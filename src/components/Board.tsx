'use client';
import React from 'react';
import type { Card, Pos } from '@/lib/iota/types';
import { key } from '@/lib/iota/types';
import CardV from './Card';

export default function Board({
    grid,
    onDrop,
    validPositions = new Set(),
    replaceWildMode = false,
    selectedWildPos = null,
    bounds = { minRow: -5, maxRow: 5, minCol: -5, maxCol: 5 },
}: {
    grid: Map<string, Card>;
    onDrop: (pos: Pos) => void;
    validPositions?: Set<string>;
    replaceWildMode?: boolean;
    selectedWildPos?: Pos | null;
    bounds?: { minRow: number; maxRow: number; minCol: number; maxCol: number };
}) {
    const rows = bounds.maxRow - bounds.minRow + 1;
    const cols = bounds.maxCol - bounds.minCol + 1;

    return (
        <div
            className="grid place-items-center"
            style={{
                gridTemplateColumns: `repeat(${cols}, minmax(120px, 7.5vw))`,
                gap: '8px'
            }}
        >
            {Array.from({ length: rows }).map((_, ri) => {
                const r = bounds.minRow + ri;
                return Array.from({ length: cols }).map((_, ci) => {
                    const c = bounds.minCol + ci;
                    const k = `${r}:${c}`;
                    const card = grid.get(k);
                    const isValid = validPositions.has(k);
                    const isWild = card?.kind === 'wild';
                    const isSelectedWild =
                        selectedWildPos && selectedWildPos.r === r && selectedWildPos.c === c;
                    const showCell = card || isValid || validPositions.size === 0;

                    if (!showCell) {
                        return (
                            <div
                                key={k}
                                className="aspect-square w-[7.5vw] max-w-[180px] min-w-[120px]"
                            />
                        );
                    }

                    const isClickable = (!card && isValid) || (replaceWildMode && isWild);

                    return (
                        <div
                            key={k}
                            className={`grid aspect-square w-[7.5vw] max-w-[180px] min-w-[120px] place-items-center rounded-xl border-2 transition-colors ${
                                isSelectedWild
                                    ? 'border-4 border-solid border-purple-600 bg-purple-100'
                                    : card
                                      ? replaceWildMode && isWild
                                          ? 'cursor-pointer border-solid border-purple-400 bg-purple-50 hover:bg-purple-100'
                                          : 'border-solid border-gray-300'
                                      : isValid
                                        ? 'animate-pulse cursor-pointer border-solid border-green-500 bg-green-50 hover:bg-green-100'
                                        : 'border-dashed border-gray-200 bg-gray-50'
                            }`}
                            onClick={() => isClickable && onDrop({ r, c })}
                        >
                            {card ? (
                                <CardV card={card} />
                            ) : isValid ? (
                                <div className="flex h-full w-full items-center justify-center rounded-xl bg-green-50">
                                    <span className="text-7xl font-bold text-green-600">+</span>
                                </div>
                            ) : null}
                        </div>
                    );
                });
            })}
        </div>
    );
}
