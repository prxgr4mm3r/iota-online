'use client';
import React from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Board from '@/components/Board';
import Hand from '@/components/Hand';
import type { Card } from '@/lib/iota/types';

function mapToMap(obj: any): Map<string, Card> {
    const m = new Map<string, Card>();
    for (const k of Object.keys(obj || {})) m.set(k, obj[k]);
    return m;
}

export default function RoomPage() {
    const { id } = useParams<{ id: string }>();
    const [state, setState] = React.useState<any>(null);
    const [hand, setHand] = React.useState<Card[]>([]);
    const [picked, setPicked] = React.useState<Card | null>(null);

    React.useEffect(() => {
        async function load() {
            const { data } = await supabase.from('states').select('*').eq('room_id', id).single();
            setState(data);
        }
        load();
        const ch = supabase
            .channel(`room:${id}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'states', filter: `room_id=eq.${id}` },
                payload => {
                    setState(payload.new);
                }
            )
            .subscribe();
        return () => {
            supabase.removeChannel(ch);
        };
    }, [id]);

    const grid = mapToMap(state?.grid || {});

    function onPick(c: Card) {
        setPicked(c);
    }
    async function onDrop(pos: { r: number; c: number }) {
        if (!picked) return;
        // Simple local optimistic update (MVP): place card if cell empty
        const k = `${pos.r}:${pos.c}`;
        if (grid.has(k)) return;
        const newGrid = { ...(state?.grid || {}) };
        newGrid[k] = picked;
        await supabase
            .from('states')
            .update({ grid: newGrid, version: (state?.version || 0) + 1 })
            .eq('room_id', id);
        setPicked(null);
        // TODO: call server action to validate & score
    }

    return (
        <main className="grid gap-4 p-4">
            <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold">Room {String(id).slice(0, 8)}…</h2>
            </div>
            <Board grid={grid} onDrop={onDrop} />
            <div className="rounded bg-white p-4 shadow">
                <h3 className="mb-2 font-semibold">Your hand</h3>
                <Hand cards={hand} onPick={onPick} />
                {picked && (
                    <div className="text-sm text-gray-500">
                        Picked:{' '}
                        {picked.kind === 'wild'
                            ? '★'
                            : `${picked.color}/${picked.shape}/${picked.num}`}
                    </div>
                )}
            </div>
        </main>
    );
}
