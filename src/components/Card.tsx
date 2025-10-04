'use client';
import React from 'react';
import type { Card as T, Shape as ShapeType, Num } from '@/lib/iota/types';

const colorMap = { red:'#e53935', green:'#43a047', blue:'#1e88e5', yellow:'#fdd835' } as const;

// Small shape component for corners and inner patterns
function SmallShape({ shape, size = 12, fill, rotation = 0 }: { shape: ShapeType; size?: number; fill: string; rotation?: number }) {
  const s = size; // 12 divides evenly: 12/3 = 4
  const half = s / 2;

  const shapeElement = (() => {
    if (shape === 'triangle') {
      return <polygon points={`${half},2 2,${s-2} ${s-2},${s-2}`} fill={fill} />;
    }
    if (shape === 'square') {
      return <rect x={2} y={2} width={s-4} height={s-4} fill={fill} />;
    }
    if (shape === 'circle') {
      return <circle cx={half} cy={half} r={half-2} fill={fill} />;
    }
    // Plus/cross - made of 5 equal squares (perfectly symmetric)
    const squareSize = 4; // s=12: 4+4+4=12 (perfect division)
    const offset = 0; // starts at edge since 4*3=12
    return (
      <g fill={fill}>
        {/* Horizontal bar (3 squares) */}
        <rect x={offset} y={4} width={12} height={4} />
        {/* Vertical bar (top square) */}
        <rect x={4} y={offset} width={4} height={4} />
        {/* Vertical bar (bottom square) */}
        <rect x={4} y={8} width={4} height={4} />
      </g>
    );
  })();

  if (rotation !== 0) {
    return <g transform={`rotate(${rotation}, ${half}, ${half})`}>{shapeElement}</g>;
  }

  return shapeElement;
}

// Large shape component for center
function LargeShape({ shape, fill }: { shape: ShapeType; fill: string }) {
  const s = 76; // increased from 64 to be larger
  const half = s / 2;

  if (shape === 'triangle') {
    return <polygon points={`${half},2 2,${s-2} ${s-2},${s-2}`} fill={fill} />;
  }
  if (shape === 'square') {
    return <rect x={6} y={6} width={s-12} height={s-12} fill={fill} />;
  }
  if (shape === 'circle') {
    return <circle cx={half} cy={half} r={half-2} fill={fill} />;
  }
  // Plus/cross - made of 5 equal squares
  const squareSize = (s - 4) / 3; // divide available space into 3 parts
  return (
    <g fill={fill}>
      {/* Horizontal bar (3 squares) */}
      <rect x={2} y={half - squareSize/2} width={squareSize * 3} height={squareSize} />
      {/* Vertical bar (top square) */}
      <rect x={half - squareSize/2} y={2} width={squareSize} height={squareSize} />
      {/* Vertical bar (bottom square) */}
      <rect x={half - squareSize/2} y={half + squareSize/2} width={squareSize} height={squareSize} />
    </g>
  );
}

// Inner white shapes positioned based on number
function InnerShapes({ shape, num }: { shape: ShapeType; num: Num }) {
  // Container size is now 76px (LargeShape size)
  const containerSize = 76;
  const center = containerSize / 2; // 38
  const shapeSize = 12;

  // For triangles, each position needs specific rotation (cross pattern)
  const triangleConfigs: { [key in Num]: Array<{ x: number; y: number; rotation: number }> } = {
    1: [{ x: center, y: center, rotation: 0 }], // center
    2: [
      { x: center - 10, y: center, rotation: 270 }, // left
      { x: center + 10, y: center, rotation: 90 }   // right
    ],
    3: [
      { x: center, y: center - 10, rotation: 0 },      // top, pointing up
      { x: center - 8, y: center + 8, rotation: 0 },  // bottom-left, pointing up
      { x: center + 8, y: center + 8, rotation: 0 }   // bottom-right, pointing up
    ],
    4: [
      { x: center, y: center - 12, rotation: 0 },    // top
      { x: center + 12, y: center, rotation: 90 },   // right
      { x: center, y: center + 12, rotation: 180 },  // bottom
      { x: center - 12, y: center, rotation: 270 }   // left
    ],
  };

  const plusConfigs: { [key in Num]: Array<{ x: number; y: number; }> } = {
    1: [{ x: center, y: center }],
    2: [{ x: center - 8, y: center }, { x: center + 8, y: center }],
    3: [{ x: center - 10, y: center - 6 }, { x: center + 10, y: center - 6 }, { x: center, y: center + 10 }],
    4: [{ x: center - 8, y: center - 8 }, { x: center + 8, y: center - 8 }, { x: center - 8, y: center + 8 }, { x: center + 8, y: center + 8 }]
  };

  // For other shapes, no rotation needed
  const regularPositions: { [key in Num]: Array<{ x: number; y: number }> } = {
    1: [{ x: center, y: center }],
    2: [{ x: center - 12, y: center }, { x: center + 12, y: center }],
    3: [{ x: center - 12, y: center - 10 }, { x: center + 12, y: center - 10 }, { x: center, y: center + 12 }],
    4: [{ x: center - 12, y: center - 12 }, { x: center + 12, y: center - 12 }, { x: center - 12, y: center + 12 }, { x: center + 12, y: center + 12 }],
  };

  if (shape === 'triangle') {
    return (
      <>
        {triangleConfigs[num].map((config, idx) => (
          <g key={idx} transform={`translate(${config.x - shapeSize/2}, ${config.y})`}>
            <SmallShape shape={shape} size={shapeSize} fill="white" rotation={config.rotation} />
          </g>
        ))}
      </>
    );
  } 
  else if (shape === 'plus') {
        return (
        <>
            {plusConfigs[num].map((pos, idx) => (
                <g key={idx} transform={`translate(${pos.x - shapeSize/2}, ${pos.y - shapeSize/2})`}>
                <SmallShape shape={shape} size={shapeSize} fill="white" />
                </g>
            ))}
        </>
        );
    }

  return (
    <>
      {regularPositions[num].map((pos, idx) => (
        <g key={idx} transform={`translate(${pos.x - shapeSize/2}, ${pos.y - shapeSize/2})`}>
          <SmallShape shape={shape} size={shapeSize} fill="white" />
        </g>
      ))}
    </>
  );
}

// Corner element: number + small shape
function Corner({ num, shape, color, rotation }: { num: Num; shape: ShapeType; color: string; rotation: number }) {
  return (
    <g transform={`rotate(${rotation}, 64, 64)`}>
      {/* Position in top-left corner area */}
      <text x={12} y={18} fontSize={16} fontWeight="bold" fill={color} textAnchor="middle">
        {num}
      </text>
      <g transform="translate(6, 20)">
        <SmallShape shape={shape} size={12} fill={color} />
      </g>
    </g>
  );
}

export default function Card({ card }: { card: T }) {
  if (card.kind === 'wild') {
    return (
      <div className="aspect-square w-[10vw] max-w-[240px] min-w-[160px] rounded-3xl bg-gray-300 grid place-items-center shadow-lg p-[2px]">
        <div className="w-full h-full rounded-3xl bg-white grid place-items-center">
          <span className="text-6xl">★</span>
        </div>
      </div>
    );
  }

  const fill = colorMap[card.color];

  return (
    <div className="aspect-square w-[10vw] max-w-[240px] min-w-[160px] rounded-3xl bg-gray-300 shadow-lg p-[2px]">
      <div className="w-full h-full rounded-3xl bg-white overflow-hidden">
        <svg viewBox="0 0 128 128" className="w-full h-full">
          {/* White background with rounded corners */}
          <rect x={0} y={0} width={128} height={128} rx={16} fill="white" />

          {/* Four corners with rotated numbers and shapes */}
          <Corner num={card.num} shape={card.shape} color={fill} rotation={0} />
          <Corner num={card.num} shape={card.shape} color={fill} rotation={90} />
          <Corner num={card.num} shape={card.shape} color={fill} rotation={180} />
          <Corner num={card.num} shape={card.shape} color={fill} rotation={270} />

          {/* Central black square - no rounding */}
          <rect x={24} y={24} width={80} height={80} fill="#1a1a1a" />

          {/* Large colored shape in center */}
          <g transform="translate(26, 26)">
            <LargeShape shape={card.shape} fill={fill} />
            {/* White inner shapes */}
            <InnerShapes shape={card.shape} num={card.num} />
          </g>
        </svg>
      </div>
    </div>
  );
}
