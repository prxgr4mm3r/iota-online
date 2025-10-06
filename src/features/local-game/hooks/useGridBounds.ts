'use client';
import { useMemo } from 'react';
import type { Grid } from '@/lib/iota/types';
import type { GridBounds } from '../types';

export function useGridBounds(grid: Grid): GridBounds {
    return useMemo(() => {
        if (grid.size === 0) {
            return { minRow: -5, maxRow: 5, minCol: -5, maxCol: 5 };
        }

        let minRow = Infinity;
        let maxRow = -Infinity;
        let minCol = Infinity;
        let maxCol = -Infinity;

        for (const k of grid.keys()) {
            const [r, c] = k.split(':').map(Number);
            minRow = Math.min(minRow, r);
            maxRow = Math.max(maxRow, r);
            minCol = Math.min(minCol, c);
            maxCol = Math.max(maxCol, c);
        }

        // Add padding of 2 cells on each side
        return {
            minRow: minRow - 2,
            maxRow: maxRow + 2,
            minCol: minCol - 2,
            maxCol: maxCol + 2,
        };
    }, [grid]);
}
