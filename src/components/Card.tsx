'use client';
import React from 'react';
import type { Card as T } from '@/lib/iota/types';


const colorMap = { red:'#e53935', green:'#43a047', blue:'#1e88e5', yellow:'#fdd835' } as const;


function Shape({ shape }: { shape: 'triangle'|'square'|'circle'|'plus' }){
const s = 56;
if (shape==='triangle') return <polygon points={`${s/2},8 8,${s-8} ${s-8},${s-8}`} />;
if (shape==='square') return <rect x={8} y={8} width={s-16} height={s-16} rx={8} ry={8}/>;
if (shape==='circle') return <circle cx={s/2} cy={s/2} r={s/2-10}/>;
return (
<g strokeWidth={10} strokeLinecap="round">
<line x1={8} y1={s/2} x2={s-8} y2={s/2}/>
<line x1={s/2} y1={8} x2={s/2} y2={s-8}/>
</g>
);
}


export default function Card({ card }: { card: T }){
if (card.kind==='wild') {
return (
<div className="w-24 h-32 rounded-xl border bg-white grid place-items-center shadow">
<span className="text-4xl">★</span>
</div>
);
}
const fill = colorMap[card.color];
return (
<div className="w-24 h-32 rounded-xl border bg-white p-2 shadow grid grid-rows-[1fr_auto]">
<svg viewBox="0 0 64 64" className="w-full h-full" style={{ fill, stroke: fill }}>
<Shape shape={card.shape}/>
</svg>
<div className="text-center text-xl font-semibold" style={{ color: fill }}>{card.num}</div>
</div>
);
}