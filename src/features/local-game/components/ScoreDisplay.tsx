'use client';
import React from 'react';

interface ScoreDisplayProps {
    scores: [number, number];
    currentPlayer: number;
}

export function ScoreDisplay({ scores, currentPlayer }: ScoreDisplayProps) {
    return (
        <div className="mb-4 flex justify-center">
            <div className="flex items-center gap-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-4 shadow-lg">
                <div className="text-center">
                    <div className="text-xs font-medium uppercase tracking-wide text-blue-100">
                        Player 1
                    </div>
                    <div className="text-3xl font-bold text-white">{scores[0]}</div>
                </div>

                <div className="h-12 w-px bg-white/30"></div>

                <div className="text-center">
                    <div className="text-xs font-medium uppercase tracking-wide text-purple-100">
                        Player 2
                    </div>
                    <div className="text-3xl font-bold text-white">{scores[1]}</div>
                </div>

                {currentPlayer !== undefined && (
                    <div className="ml-4 rounded-full bg-white/20 px-4 py-2 text-xs font-semibold text-white">
                        P{currentPlayer + 1} Turn
                    </div>
                )}
            </div>
        </div>
    );
}
