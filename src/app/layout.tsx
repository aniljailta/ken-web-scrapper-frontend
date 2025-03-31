"use client";
import "./globals.css";
import { AuthProvider } from "./providers";
import { GoogleTagManager } from '@next/third-parties/google'

import { Roboto_Mono } from "next/font/google";
import HeaderLayout from "./components/HeaderLayout";
import { ConversationProvider } from "@/providers/ConversationProvider";
import { Toaster } from "sonner";
import { SocketProvider } from "@/providers/SocketProvider";

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto-mono",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={robotoMono.className}>
      <GoogleTagManager gtmId="G-TD6ZS2ESY7" />
      <body>
        <AuthProvider>
          <SocketProvider>
            <ConversationProvider>
              <Toaster position="top-right" />
              <HeaderLayout>{children}</HeaderLayout>
            </ConversationProvider>
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
