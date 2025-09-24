import { Card, Color, Shape, Num } from './types';


const COLORS: Color[] = ['red','green','blue','yellow'];
const SHAPES: Shape[] = ['triangle','square','circle','plus'];
const NUMS: Num[] = [1,2,3,4];


let uid = 0; const nid = () => `c${uid++}`;


export function makeDeck(withWild = true): Card[] {
const deck: Card[] = [];
for (const color of COLORS)
for (const shape of SHAPES)
for (const num of NUMS)
deck.push({ kind:'normal', color, shape, num, id: nid() });
if (withWild) deck.push({ kind:'wild', id: nid() }, { kind:'wild', id: nid() });
return shuffle(deck);
}


function shuffle<T>(a: T[]): T[] {
const arr = a.slice();
for (let i=arr.length-1;i>0;i--){
const j = Math.floor(Math.random()*(i+1));
[arr[i],arr[j]]=[arr[j],arr[i]];
}
return arr;
}