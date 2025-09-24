import Header from '@/components/Header';
import { createRoom, joinRoom } from '../actions';
import Link from 'next/link';
import { redirect } from 'next/navigation';


async function newRoom(formData: FormData){
'use server';
const name = (formData.get('name') as string)||'Room';
const id = await createRoom(name);
redirect(`/room/${id}`);
}

async function joinRoomAction(formData: FormData){
'use server';
const room = formData.get('room') as string;
const nick = (formData.get('nick') as string)||'Guest';
await joinRoom(room, nick);
redirect(`/room/${room}`);
}

export default function Lobby(){
return (
<main>
<Header title="iota online"/>
<div className="max-w-xl mx-auto p-4 grid gap-6">
<form action={newRoom} className="grid gap-2 p-4 bg-white rounded shadow">
<h2 className="text-lg font-semibold">Create room</h2>
<input name="name" placeholder="Room name" className="border p-2 rounded"/>
<button className="bg-black text-white rounded px-3 py-2">Create</button>
</form>


<form action={joinRoomAction} className="grid gap-2 p-4 bg-white rounded shadow">
<h2 className="text-lg font-semibold">Join room</h2>
<input name="room" placeholder="Room ID" className="border p-2 rounded" required/>
<input name="nick" placeholder="Your name" className="border p-2 rounded"/>
<button className="bg-black text-white rounded px-3 py-2">Join</button>
</form>


<p className="text-sm text-center text-gray-500">Rooms appear as UUIDs (copy URL to invite friends)</p>
</div>
</main>
);
}