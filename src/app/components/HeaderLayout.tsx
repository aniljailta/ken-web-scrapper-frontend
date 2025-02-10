import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Conversation } from "../types";
import Image from "next/image";
import httpService from "@/utils/httpService";
import { useConversation } from "@/providers/ConversationProvider";

export default function HeaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const { handleLogout } = useConversation();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  const [chatList, setChatList] = useState<Conversation[]>([]);

  const getInitials = (name: string) => {
    if (!name) return "GU";
    const nameParts = name.trim().split(" ");
    return nameParts.length === 1
      ? (nameParts[0][0] + nameParts[0].slice(-1)).toUpperCase()
      : (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
  };

  const fetchChatList = async () => {
    try {
      const response = await httpService.get("conversation/all-chat", {
        headers: {
          Authorization: `Bearer ${
            session && session.user ? session.user.access_token : ""
          }`,
        },
      });
      const data = await response.data;
      if (!data) {
        router.push("/");
        return;
      }

      setChatList(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
      router.push("/");
    }
  };

  useEffect(() => {
    if (session && session.user) {
      fetchChatList();
    }
  }, [session]);

  return (
    <>
      <header className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Desktop View */}
          <div className="hidden md:flex justify-between items-center gap-2">
            <Link href={"/"} passHref>
              <p className="text-base font-normal text-black max-w-24">
                Great Migration
              </p>
            </Link>
            {session?.user ? (
              <div className="relative">
                <div
                  className="w-[50px] h-[47px] grid place-content-center bg-black text-white rounded-full cursor-pointer"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  {getInitials(session.user.name)}
                </div>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 min-w-64 bg-white shadow-lg rounded-lg border border-gray-400">
                    <div className="p-3 xl:p-5 space-y-4">
                      <div
                        className="flex justify-end cursor-pointer"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                      >
                        <Image
                          src="/images/cross.svg"
                          alt="arrow"
                          width={18}
                          height={18}
                        />
                      </div>
                      <div className="space-y-2">
                        {chatList.map((chat, idx) => (
                          <Link
                            key={chat.id}
                            passHref
                            href={`/search/${chat.id}`}
                            className="block p-2 hover:bg-gray-100"
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                          >
                            <div className="">
                              <p className="text-xs text-black font-medium">
                                {String(idx + 1).padStart(3, "0")} Report
                              </p>
                              <p className="text-xs text-black font-light">
                                {chat.productName}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                      {session.user.role === "admin" && (
                        <div className="flex justify-end items-center gap-2">
                          <div
                            className="text-sm text-black cursor-pointer"
                            onClick={() => {
                              router.push("/admin");
                            }}
                          >
                            System Instruction
                          </div>
                        </div>
                      )}
                      <div className="flex justify-end items-center gap-2">
                        <div
                          className="text-sm text-black cursor-pointer"
                          onClick={handleLogout}
                        >
                          Logout
                        </div>
                      </div>
                    </div>
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

          {/* Mobile View */}
          <div className="flex md:hidden items-center justify-between">
            {/* Sign Up (Only if not logged in) */}
            {!session?.user && (
              <Link href={"/signup"} passHref>
                <div className="px-4 py-2 bg-black text-white rounded-[10px] text-sm">
                  Sign Up
                </div>
              </Link>
            )}

            {/* Centered Site Name */}
            <Link href={"/"} passHref>
              <p className="text-base font-medium text-black">GM</p>
            </Link>

            {/* Right Side: Initials (if logged in) or Log in */}
            {session?.user ? (
              <div
                className="w-10 h-10 grid place-content-center bg-black text-white rounded-full cursor-pointer"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {getInitials(session.user.name)}
              </div>
            ) : (
              <Link href={"/login"} passHref>
                <div className="px-4 py-2 bg-white text-black rounded-[10px] text-sm">
                  Log in
                </div>
              </Link>
            )}
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
    </>
  );
}
