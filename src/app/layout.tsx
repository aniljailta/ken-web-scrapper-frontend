import Link from "next/link";
import "./globals.css";
import { getSession } from "./lib/auth";
import { AuthProvider } from "./providers";

import { Roboto_Mono } from "next/font/google";

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto-mono",
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  console.log({ session });
  return (
    <html lang="en" suppressHydrationWarning className={robotoMono.className}>
      <body>
        <AuthProvider>
          <header className="bg-white">
            <div className="max-w-7xl mx-auto px-4 py-6">
              <div className="flex justify-between gap-2">
                <p className="text-base font-normal text-black max-w-24">
                  Great Migration
                </p>
                {session?.user ? (
                  <div className="w-[50px] h-[47px] grid place-content-center bg-black text-white rounded-full">
                    NV
                  </div>
                ) : (
                  <div className="flex justify-between gap-2">
                    <Link href={"/signup"} passHref>
                      <div className="min-w-24 px-4 py-3 bg-black text-white rounded-[10px]">
                        Sign Up
                      </div>
                    </Link>
                    <Link href={"/login"} passHref>
                      <div className="min-w-24 px-4 py-3 bg-white text-black rounded-[10px]">
                        Log in
                      </div>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </header>
          <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
