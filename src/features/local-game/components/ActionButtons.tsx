'use client';
import React from 'react';
import { Button } from '@mui/material';
import type { GameMode } from '../types';

interface ActionButtonsProps {
    mode: GameMode;
    selectedCardsCount: number;
    placedCardsCount: number;
    onSubmit: () => void;
    onPass: () => void;
    onReset: () => void;
}

export function ActionButtons({
    mode,
    selectedCardsCount,
    placedCardsCount,
    onSubmit,
    onPass,
    onReset,
}: ActionButtonsProps) {
    return (
        <div className="flex gap-2">
            {mode === 'play' && (
                <>
                    <Button
                        onClick={onSubmit}
                        disabled={placedCardsCount === 0}
                        variant="contained"
                        color="primary"
                        size="medium"
                        sx={{ flex: 1, py: 1.5, fontSize: '0.875rem', fontWeight: 'bold' }}
                    >
                        ✓ Submit Turn
                    </Button>
                    <Button
                        onClick={onPass}
                        disabled={selectedCardsCount === 0}
                        variant="contained"
                        color="warning"
                        size="medium"
                        sx={{ flex: 1, py: 1.5, fontSize: '0.875rem', fontWeight: 'bold' }}
                    >
                        ⤵ Pass
                    </Button>
                </>
            )}
            <Button
                onClick={onReset}
                variant="outlined"
                color="error"
                size="medium"
                sx={{ py: 1.5, fontSize: '0.875rem', fontWeight: 'bold' }}
            >
                🔄 Reset
            </Button>
        </div>
    );
}
