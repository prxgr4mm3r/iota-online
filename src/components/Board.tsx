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
}: {
    grid: Map<string, Card>;
    onDrop: (pos: Pos) => void;
    validPositions?: Set<string>;
    replaceWildMode?: boolean;
    selectedWildPos?: Pos | null;
}) {
    const size = 11; // 11x11 MVP
    return (
        <div
            className="grid place-items-center"
            style={{
                gridTemplateColumns: `repeat(${size}, minmax(120px, 7.5vw))`,
                gap: '8px'
            }}
        >
            {Array.from({ length: size }).map((_, r) =>
                Array.from({ length: size }).map((_, c) => {
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
                })
            )}
        </div>
    );
}
