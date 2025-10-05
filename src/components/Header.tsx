'use client';
import React from 'react';
import { supabase } from '@/lib/supabase/client';

export default function Header({ title }: { title: string }) {
    // Google Auth - temporarily disabled for testing
    async function signInGoogle() {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) {
                console.error('Google sign-in error:', error.message);
                alert(`Sign-in error: ${error.message}`);
            }
        } catch (err) {
            console.error('Unexpected error:', err);
            alert('Unexpected error occurred during sign-in');
        }
    }
    async function signOut() {
        await supabase.auth.signOut();
    }
    const [user, setUser] = React.useState<any>({ id: 'test-user', email: 'test@example.com' }); // Mock user for testing
    // React.useEffect(()=>{ supabase.auth.getUser().then(({data})=>setUser(data.user));
    // const { data: sub } = supabase.auth.onAuthStateChange((_e, s)=>setUser(s?.user||null));
    // return ()=>{ sub.subscription.unsubscribe(); };
    // },[]);
    return (
        <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-4">
            <h1 className="text-2xl font-bold">{title}</h1>
            <div className="text-sm text-gray-500">Test Mode ({user?.email || 'No user'})</div>
        </header>
    );
}
