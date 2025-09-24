'use server';
import { supabaseServer } from '@/lib/supabase/server';
import { makeDeck } from '@/lib/iota/deck';


export async function createRoom(name: string){
    const sb = supabaseServer();
    const { data: room, error } = await sb.from('rooms').insert({ name }).select('*').single();
    if (error) throw error;
    const room_id = room.id;
    // init state
    const deck = makeDeck(true);
    const hands: Record<string, any[]> = {};
    const turn_order: string[] = [];
    const { error: e2 } = await sb.from('states').insert({ room_id, deck, hands, turn_order, version:0 });
    if (e2) throw e2;
    return room_id as string;
}


export async function joinRoom(room_id: string, display_name: string){
const sb = supabaseServer();
const { data: player, error } = await sb.from('players').insert({ room_id, display_name }).select('*').single();
if (error) throw error;
return player.id as string;
}