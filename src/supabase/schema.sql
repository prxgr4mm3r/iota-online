create table public.states (
  room_id uuid not null,
  version integer not null default 0,
  grid jsonb not null default '{}'::jsonb,
  deck jsonb not null default '[]'::jsonb,
  hands jsonb not null default '{}'::jsonb,
  turn_order jsonb not null default '[]'::jsonb,
  active_player uuid null,
  last_move jsonb null,
  updated_at timestamp with time zone null default now(),
  constraint states_pkey primary key (room_id),
  constraint states_room_id_fkey foreign KEY (room_id) references rooms (id) on delete CASCADE
) TABLESPACE pg_default;