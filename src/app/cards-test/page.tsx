'use client';
import React from 'react';
import Card from '@/components/Card';
import type { Card as CardType, Color, Shape, Num } from '@/lib/iota/types';

export default function CardsTestPage() {
    const colors: Color[] = ['red', 'green', 'blue', 'yellow'];
    const shapes: Shape[] = ['triangle', 'square', 'circle', 'plus'];
    const nums: Num[] = [1, 2, 3, 4];

    // Generate all normal cards
    const allCards: CardType[] = [];
    let cardId = 0;

    for (const color of colors) {
        for (const shape of shapes) {
            for (const num of nums) {
                allCards.push({
                    kind: 'normal',
                    color,
                    shape,
                    num,
                    id: `card-${cardId++}`,
                });
            }
        }
    }

    // Add wild cards
    const wildCards: CardType[] = [
        { kind: 'wild', id: 'wild-1' },
        { kind: 'wild', id: 'wild-2' },
    ];

    return (
        <main className="min-h-screen p-8" style={{ backgroundColor: '#8e8e91ff' }}>
            <div className="mx-auto max-w-7xl">
                <h1 className="mb-6 text-3xl font-bold text-white">IOTA Cards Test Gallery</h1>

                <div className="mb-8 rounded-lg bg-white p-4 shadow">
                    <h2 className="mb-2 text-xl font-semibold">Statistics</h2>
                    <p className="text-gray-600">
                        Total cards: {allCards.length + wildCards.length} ({allCards.length} normal
                        + {wildCards.length} wild)
                    </p>
                </div>

                {/* Wild Cards */}
                <section className="mb-12">
                    <h2 className="mb-4 text-2xl font-bold text-white">Wild Cards</h2>
                    <div className="flex flex-wrap gap-4">
                        {wildCards.map(card => (
                            <div key={card.id} className="flex flex-col items-center gap-2">
                                <Card card={card} />
                                <span className="text-sm text-gray-600">Wild</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Cards grouped by color */}
                {colors.map(color => (
                    <section key={color} className="mb-12">
                        <h2
                            className="mb-4 text-2xl font-bold capitalize"
                            style={{ color: color === 'yellow' ? '#d4a500' : color }}
                        >
                            {color} Cards
                        </h2>

                        {/* Group by shape within each color */}
                        {shapes.map(shape => (
                            <div key={shape} className="mb-6">
                                <h3 className="mb-3 text-lg font-semibold text-gray-700 capitalize">
                                    {shape}
                                </h3>
                                <div className="flex flex-wrap gap-4">
                                    {nums.map(num => {
                                        const card = allCards.find(
                                            c =>
                                                c.kind === 'normal' &&
                                                c.color === color &&
                                                c.shape === shape &&
                                                c.num === num
                                        );
                                        return card ? (
                                            <div
                                                key={card.id}
                                                className="flex flex-col items-center gap-2"
                                            >
                                                <Card card={card} />
                                                <span className="text-sm text-gray-600">
                                                    {color[0].toUpperCase()}/
                                                    {shape[0].toUpperCase()}/{num}
                                                </span>
                                            </div>
                                        ) : null;
                                    })}
                                </div>
                            </div>
                        ))}
                    </section>
                ))}

                {/* Alternative view: All cards in a grid */}
                <section className="mb-12">
                    <h2 className="mb-4 text-2xl font-bold text-white">All Cards Grid</h2>
                    <div className="grid grid-cols-8 gap-4">
                        {allCards.map(card => (
                            <div key={card.id}>
                                <Card card={card} />
                            </div>
                        ))}
                        {wildCards.map(card => (
                            <div key={card.id}>
                                <Card card={card} />
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}
