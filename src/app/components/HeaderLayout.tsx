import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function HeaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  const getInitials = (name: string) => {
    if (!name) return "GU";
    const nameParts = name.trim().split(" ");
    return nameParts.length === 1
      ? (nameParts[0][0] + nameParts[0].slice(-1)).toUpperCase()
      : (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
  };

  return (
    <>
      <header className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="hidden md:flex justify-between items-center gap-2">
            <p className="text-base font-normal text-black max-w-24">
              Great Migration
            </p>
            {session?.user ? (
              <div className="relative">
                <div
                  className="w-[50px] h-[47px] grid place-content-center bg-black text-white rounded-full cursor-pointer"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  {getInitials(session.user.name)}
                </div>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 min-w-40 bg-white shadow-lg rounded-lg">
                    <div
                      className="px-4 py-2 text-black hover:bg-gray-200 cursor-pointer"
                      onClick={() => {
                        signOut();
                        router.push("/");
                      }}
                    >
                      Logout
                    </div>
                    {session.user.role === "admin" && (
                      <div
                        className="px-4 py-2 text-black hover:bg-gray-200 cursor-pointer"
                        onClick={() => {
                          router.push("/admin");
                        }}
                      >
                        Admin Dashboard
                      </div>
                    )}
                  </div>
                )}
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
    </>
  );
}
