"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

export function ClientProviders({ children }: { children: React.ReactNode }) {
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
