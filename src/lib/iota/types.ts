export type Color = 'red'|'green'|'blue'|'yellow';
export type Shape = 'triangle'|'square'|'circle'|'plus';
export type Num = 1|2|3|4;


export type Card =
| { kind: 'normal'; color: Color; shape: Shape; num: Num; id: string }
| { kind: 'wild'; id: string };


export type Pos = { r: number; c: number };
export type Grid = Map<string, Card>;
export type Line = Pos[];
export type TurnPlacement = { card: Card; pos: Pos }[];


export type TurnScore = {
linesScored: { line: Line; value: number; isLot: boolean }[];
base: number;
multiplier: number;
total: number;
};


export function key(p: Pos) { return `${p.r}:${p.c}`; }