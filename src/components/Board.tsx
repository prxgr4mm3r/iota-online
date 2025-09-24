'use client';
import React from 'react';
import type { Card, Pos } from '@/lib/iota/types';
import { key } from '@/lib/iota/types';
import CardV from './Card';


export default function Board({ grid, onDrop }:{ grid: Map<string,Card>; onDrop:(pos:Pos)=>void }){
const size = 11; // 11x11 MVP
return (
<div className="grid" style={{ gridTemplateColumns:`repeat(${size}, 96px)`, gap:'8px' }}>
{Array.from({length:size}).map((_,r)=> (
Array.from({length:size}).map((_,c)=> {
const k = `${r}:${c}`;
const card = grid.get(k);
return (
<div key={k} className="w-24 h-32 rounded-xl border bg-gray-50 grid place-items-center"
onClick={()=>!card && onDrop({r,c})}>
{card ? <CardV card={card}/> : <span className="text-gray-300">+</span>}
</div>
);
})
))}
</div>
);
}