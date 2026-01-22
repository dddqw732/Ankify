"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect } from "react";

export function ClientProviders({ children }: { children: React.ReactNode }) {
    // Auth Sync for Chrome Extension
    useEffect(() => {
        const supabase = createClientComponentClient();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session?.user && session?.access_token) {
                // Broadcast session for extension to pick up
                localStorage.setItem('ankify_extension_sync', JSON.stringify({
                    access_token: session.access_token,
                    user: session.user,
                    timestamp: Date.now()
                }));
            } else if (event === 'SIGNED_OUT') {
                localStorage.removeItem('ankify_extension_sync');
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <AuthProvider>
            <PayPalScriptProvider options={{
                clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
                vault: true,
                intent: "subscription"
            }}>
                {children}
            </PayPalScriptProvider>
        </AuthProvider>
    );
}
