import Header from '@/components/Header';
import { createRoom, joinRoom } from '../actions';
import Link from 'next/link';
import { redirect } from 'next/navigation';

async function newRoom(formData: FormData) {
    'use server';
    const name = (formData.get('name') as string) || 'Room';
    const id = await createRoom(name);
    redirect(`/room/${id}`);
}

async function joinRoomAction(formData: FormData) {
    'use server';
    const room = formData.get('room') as string;
    const nick = (formData.get('nick') as string) || 'Guest';
    await joinRoom(room, nick);
    redirect(`/room/${room}`);
}

export default function Lobby() {
    return (
        <main>
            <Header title="iota online" />
            <div className="mx-auto grid max-w-xl gap-6 p-4">
                <Link
                    href="/local"
                    className="grid gap-2 rounded bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white shadow transition-colors hover:from-blue-600 hover:to-blue-700"
                >
                    <h2 className="text-lg font-semibold">🎮 Play Local Game</h2>
                    <p className="text-sm text-blue-100">
                        2 players on one device (no account needed)
                    </p>
                </Link>

                <form action={newRoom} className="grid gap-2 rounded bg-white p-4 shadow">
                    <h2 className="text-lg font-semibold">Create room</h2>
                    <input name="name" placeholder="Room name" className="rounded border p-2" />
                    <button className="rounded bg-black px-3 py-2 text-white">Create</button>
                </form>

                <form action={joinRoomAction} className="grid gap-2 rounded bg-white p-4 shadow">
                    <h2 className="text-lg font-semibold">Join room</h2>
                    <input
                        name="room"
                        placeholder="Room ID"
                        className="rounded border p-2"
                        required
                    />
                    <input name="nick" placeholder="Your name" className="rounded border p-2" />
                    <button className="rounded bg-black px-3 py-2 text-white">Join</button>
                </form>

                <p className="text-center text-sm text-gray-500">
                    Rooms appear as UUIDs (copy URL to invite friends)
                </p>
            </div>
        </main>
    );
}
