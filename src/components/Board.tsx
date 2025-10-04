'use client';
import React from 'react';
import type { Card, Pos } from '@/lib/iota/types';
import { key } from '@/lib/iota/types';
import CardV from './Card';


export default function Board({ grid, onDrop, validPositions = new Set() }:{ grid: Map<string,Card>; onDrop:(pos:Pos)=>void; validPositions?: Set<string> }){
const size = 11; // 11x11 MVP
return (
<div className="grid place-items-center" style={{ gridTemplateColumns:`repeat(${size}, minmax(160px, 10vw))`, gap:'0.5vw' }}>
{Array.from({length:size}).map((_,r)=> (
Array.from({length:size}).map((_,c)=> {
const k = `${r}:${c}`;
const card = grid.get(k);
const isValid = validPositions.has(k);
const showCell = card || isValid || validPositions.size === 0;

if (!showCell) {
  return <div key={k} className="aspect-square w-[10vw] max-w-[240px] min-w-[160px]" />;
}

return (
<div key={k} className={`aspect-square w-[10vw] max-w-[240px] min-w-[160px] rounded-2xl border-2 grid place-items-center transition-colors ${
  card ? '' : isValid ? 'border-green-500 border-solid bg-green-50 hover:bg-green-100 cursor-pointer animate-pulse' : 'border-dashed border-gray-200 bg-gray-50'
}`}
onClick={()=>!card && isValid && onDrop({r,c})}>
{card ? <CardV card={card}/> : isValid ? <span className="text-green-600 text-3xl font-bold">+</span> : null}
</div>
);
})
))}
</div>
);
}
