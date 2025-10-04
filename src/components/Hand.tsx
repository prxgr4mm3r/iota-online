'use client';
import React from 'react';
import type { Card } from '@/lib/iota/types';
import CardV from './Card';


export default function Hand({ cards, onPick }:{ cards: Card[]; onPick:(c:Card)=>void }){
return (
<div className="flex gap-3 flex-wrap justify-center items-center">
{cards.map(c=> (
<button key={c.id} onClick={()=>onPick(c)} className="focus:outline-none">
<CardV card={c} />
</button>
))}
</div>
);
}