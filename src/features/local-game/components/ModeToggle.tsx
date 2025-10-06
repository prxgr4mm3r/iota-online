'use client';
import React from 'react';
import { Button } from '@mui/material';
import type { GameMode } from '../types';

interface ModeToggleProps {
    currentMode: GameMode;
    onModeChange: (mode: GameMode) => void;
}

export function ModeToggle({ currentMode, onModeChange }: ModeToggleProps) {
    return (
        <div className="mb-3 flex gap-2">
            <Button
                onClick={() => onModeChange('play')}
                variant={currentMode === 'play' ? 'contained' : 'outlined'}
                color="primary"
                size="medium"
                sx={{ flex: 1, py: 1.5, fontSize: '0.875rem', fontWeight: 'bold' }}
            >
                🎮 Play
            </Button>
            <Button
                onClick={() => onModeChange('replaceWild')}
                variant={currentMode === 'replaceWild' ? 'contained' : 'outlined'}
                color="secondary"
                size="medium"
                sx={{ flex: 1, py: 1.5, fontSize: '0.875rem', fontWeight: 'bold' }}
            >
                🔄 Replace Wild
            </Button>
            <Button
                onClick={() => onModeChange('draw')}
                variant={currentMode === 'draw' ? 'contained' : 'outlined'}
                color="inherit"
                size="medium"
                sx={{ flex: 1, py: 1.5, fontSize: '0.875rem', fontWeight: 'bold' }}
            >
                🎴 Draw
            </Button>
        </div>
    );
}
