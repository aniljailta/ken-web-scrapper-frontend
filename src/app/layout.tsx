"use client";
import "./globals.css";
import { AuthProvider } from "./providers";

import { Roboto_Mono } from "next/font/google";
import HeaderLayout from "./components/HeaderLayout";

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
      <body>
        <AuthProvider>
          <HeaderLayout>{children}</HeaderLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
