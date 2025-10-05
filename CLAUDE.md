# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**iota-online** is a Next.js 14 web application for playing the IOTA card game online. It uses Supabase for real-time multiplayer functionality and authentication.

### Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database & Auth**: Supabase (with real-time subscriptions)
- **Runtime**: React 18

### Environment Setup

Required environment variables (see `.env.local.example`):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Development Commands

```bash
# Install dependencies
pnpm i
# or: npm i / yarn

# Run dev server
pnpm dev

# Build for production
pnpm build

# Run production build
pnpm start

# Lint
pnpm lint
```

## Architecture

### Directory Structure

```
src/
├── app/                      # Next.js App Router pages & routes
│   ├── (public)/            # Public routes (lobby/home)
│   ├── room/[id]/           # Dynamic room pages
│   ├── auth/                # Auth callback handlers
│   ├── actions.ts           # Server Actions (createRoom, joinRoom)
│   └── layout.tsx           # Root layout
├── components/              # React components
│   ├── Board.tsx           # Game board grid
│   ├── Card.tsx            # Card display component
│   ├── Hand.tsx            # Player hand UI
│   └── Header.tsx          # App header
├── lib/
│   ├── iota/               # Game logic (pure TypeScript)
│   │   ├── types.ts        # Card, Grid, Position types
│   │   ├── deck.ts         # Deck generation & shuffling
│   │   └── rules.ts        # validateTurn & scoreTurn logic
│   ├── supabase/
│   │   ├── client.ts       # Client-side Supabase instance
│   │   └── server.ts       # Server-side Supabase with cookies
│   └── i18n.ts             # Internationalization (en/uk/ru)
└── supabase/
    └── schema.sql          # Database schema reference
```

### Key Architecture Patterns

#### 1. Game Logic Separation

All IOTA game rules are isolated in `src/lib/iota/`:

- **types.ts**: Core type definitions for cards, positions, grids
- **deck.ts**: Pure deck generation (64 normal cards + 2 wild cards)
- **rules.ts**: Game validation and scoring logic
    - `validateTurn()`: Checks if placement is legal (line continuity, adjacency, IOTA rules)
    - `scoreTurn()`: Calculates points (base score × multipliers for 4-card lines/placements)

#### 2. Supabase Client/Server Split

- **Client** (`lib/supabase/client.ts`): Used in `'use client'` components for real-time subscriptions
- **Server** (`lib/supabase/server.ts`): Used in Server Actions and Server Components, handles cookie-based auth

#### 3. Real-time Game State

- Game state stored in Supabase `states` table (grid, deck, hands, turn_order, version)
- Room pages subscribe to Postgres changes via `supabase.channel()` for real-time updates
- Optimistic updates in UI, then server validation via Server Actions (planned)

#### 4. Server Actions Pattern

Server Actions in `app/actions.ts` handle:

- `createRoom()`: Creates room + initializes deck/state
- `joinRoom()`: Adds player to room

Client pages use these actions with form submissions or direct invocation.

### Database Schema

Main tables (see `src/supabase/schema.sql`):

- **states**: Per-room game state (grid, deck, hands, turn_order, active_player)
    - `grid`: JSONB map of `"r:c"` → Card
    - `deck`: JSONB array of remaining cards
    - `hands`: JSONB object `player_id → Card[]`
    - `version`: Optimistic concurrency control
- **rooms**: Room metadata (name, created_at)
- **players**: Player records (room_id, display_name)

### IOTA Game Rules Implementation

- Cards have 3 attributes: color (4 types), shape (4 types), number (1-4)
- Valid line: 2-4 cards where each attribute is either all-same or all-different
- Wild cards can substitute any attribute
- Scoring: sum of numbers × multipliers (×2 per 4-card line, ×2 if placing 4 cards)

### Path Aliases

- `@/*` maps to `src/*` (configured in tsconfig.json)

### Internationalization

Basic i18n support via `lib/i18n.ts`:

- Locales: `en`, `uk`, `ru`
- Translation function: `t(locale, key)`
- Dictionary includes common UI strings (title, create, join, etc.)
