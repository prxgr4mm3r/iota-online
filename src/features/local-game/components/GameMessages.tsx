'use client';
import React from 'react';

interface GameMessagesProps {
    message: string | null;
    scoringMessage: string | null;
}

export function GameMessages({ message, scoringMessage }: GameMessagesProps) {
    return (
        <div className="mb-4 flex justify-center gap-4">
            {message && (
                <div className="rounded-full bg-red-500 px-6 py-2 text-sm font-semibold text-white shadow-md">
                    {message}
                </div>
            )}
            {scoringMessage && (
                <div className="rounded-full bg-green-500 px-6 py-2 text-sm font-semibold text-white shadow-md">
                    {scoringMessage}
                </div>
            )}
        </div>
    );
}
