import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ankify AI - AI-Powered Flashcard Generator",
  description: "Convert any text or video into smart flashcards using AI. Export to Anki and boost your learning.",
  icons: {
    icon: "/app-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <PayPalScriptProvider options={{
            clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
            vault: true,
            intent: "subscription"
          }}>
            {children}
          </PayPalScriptProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
