'use client';
import React from 'react';
import { supabase } from '@/lib/supabase/client';


export default function Header({ title }:{ title:string }){
async function signInGoogle(){ await supabase.auth.signInWithOAuth({ provider:'google' }); }
async function signOut(){ await supabase.auth.signOut(); }
const [user, setUser] = React.useState<any>(null);
React.useEffect(()=>{ supabase.auth.getUser().then(({data})=>setUser(data.user));
const { data: sub } = supabase.auth.onAuthStateChange((_e, s)=>setUser(s?.user||null));
return ()=>{ sub.subscription.unsubscribe(); };
},[]);
return (
<header className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10">
<h1 className="text-2xl font-bold">{title}</h1>
<div>
{user ? (
<button onClick={signOut} className="px-3 py-2 rounded bg-gray-200">Log out</button>
) : (
<button onClick={signInGoogle} className="px-3 py-2 rounded bg-black text-white">Sign in with Google</button>
)}
</div>
</header>
);
}