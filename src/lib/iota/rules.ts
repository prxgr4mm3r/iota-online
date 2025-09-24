import { Card, Grid, Line, Pos, TurnPlacement, TurnScore, key } from './types';

function isValidIotaLine(cards: Card[]): boolean {
  if (cards.length < 2 || cards.length > 4) return false;

  function feasible<T>(values: T[]): boolean {
    const unique = [...new Set(values)];
    const allSame = unique.length === 1;
    const allDifferent = unique.length === values.length;
    return allSame || allDifferent;
  }

  const colors = cards.map(c => c.kind === 'wild' ? 'wild' : c.color);
  const shapes = cards.map(c => c.kind === 'wild' ? 'wild' : c.shape);
  const nums = cards.map(c => c.kind === 'wild' ? 0 : c.num);

  return feasible(colors) && feasible(shapes) && feasible(nums);
}

function isAdjacentToGrid(grid: Grid, pos: Pos): boolean {
  const adjacent = [
    { r: pos.r - 1, c: pos.c },
    { r: pos.r + 1, c: pos.c },
    { r: pos.r, c: pos.c - 1 },
    { r: pos.r, c: pos.c + 1 }
  ];
  return adjacent.some(p => grid.has(key(p)));
}

function getContiguousLine(grid: Grid, start: Pos, dir: 'row' | 'col'): Line {
  const line: Line = [start];
  const delta = dir === 'row' ? { r: 0, c: 1 } : { r: 1, c: 0 };

  // Expand forward
  let current = { r: start.r + delta.r, c: start.c + delta.c };
  while (grid.has(key(current))) {
    line.push(current);
    current = { r: current.r + delta.r, c: current.c + delta.c };
  }

  // Expand backward
  current = { r: start.r - delta.r, c: start.c - delta.c };
  while (grid.has(key(current))) {
    line.unshift(current);
    current = { r: current.r - delta.r, c: current.c - delta.c };
  }

  return line;
}


export function validateTurn(grid: Grid, placements: TurnPlacement): { ok: true } | { ok: false; reason: string } {
if (placements.length < 1 || placements.length > 4) return { ok:false, reason:'Play 1 to 4 cards' };
const rows = new Set(placements.map(p=>p.pos.r));
const cols = new Set(placements.map(p=>p.pos.c));
const oneLine = (rows.size===1) || (cols.size===1);
if (!oneLine) return { ok:false, reason:'Cards must be in a single straight line' };
const kset = new Set<string>();
for (const pl of placements) {
const k = key(pl.pos);
if (grid.has(k)) return { ok:false, reason:'Cell already occupied' };
if (kset.has(k)) return { ok:false, reason:'Duplicate placement' };
kset.add(k);
}
const empty = grid.size===0;
if (!empty) {
const touches = placements.some(pl => isAdjacentToGrid(grid, pl.pos));
if (!touches) return { ok:false, reason:'At least one card must connect to grid' };
}
const tmp: Grid = new Map(grid);
for (const pl of placements) tmp.set(key(pl.pos), pl.card);
const dir: 'row'|'col' = rows.size===1 ? 'row' : 'col';
const allLines: Line[] = [];
for (const pl of placements) {
const main = getContiguousLine(tmp, pl.pos, dir);
const cross = getContiguousLine(tmp, pl.pos, dir==='row'?'col':'row');
for (const L of [main,cross]) {
const sig = L.map(p=>key(p)).join('|');
if (L.length>=2 && !allLines.some(x=>x.map(p=>key(p)).join('|')===sig)) allLines.push(L);
}
}
for (const L of allLines) {
if (L.length < 2 || L.length > 4) return { ok:false, reason:'Line length must be 2 to 4' };
const cards = L.map(p => tmp.get(key(p))!);
if (!isValidIotaLine(cards)) return { ok:false, reason:'Line rule failed' };
}
return { ok:true };
}


export function scoreTurn(grid: Grid, placements: TurnPlacement): TurnScore {
const tmp: Grid = new Map(grid);
for (const pl of placements) tmp.set(key(pl.pos), pl.card);
const rows = new Set(placements.map(p=>p.pos.r));
const dir: 'row'|'col' = rows.size===1 ? 'row' : 'col';
const impact: Line[] = [];
for (const pl of placements) {
for (const d of [dir, dir==='row'?'col':'row'] as const) {
const L = getContiguousLine(tmp, pl.pos, d);
const sig = L.map(p=>key(p)).join('|');
if (L.length>=2 && !impact.some(x=>x.map(p=>key(p)).join('|')===sig)) impact.push(L);
}
}
const linesScored = impact.map(L => {
const cards = L.map(p=>tmp.get(key(p))!);
const value = cards.reduce((s,c)=>s+(c.kind==='wild'?0:c.num),0);
const isLot = (L.length===4);
return { line: L, value, isLot };
});
const base = linesScored.reduce((s,l)=>s+l.value,0);
let multiplier = 1;
const lots = linesScored.filter(l=>l.isLot).length;
for (let i=0;i<lots;i++) multiplier *= 2;
if (placements.length===4) multiplier *= 2;
return { linesScored, base, multiplier, total: base*multiplier };
}