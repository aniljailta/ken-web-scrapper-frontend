import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Conversation } from "../types";
import httpService from "@/utils/httpService";
import SideDrawer from "./SideDrawer";
import { getInitials } from "@/utils/helper";
import { useConversation } from "@/providers/ConversationProvider";

export default function HeaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const { setConversationState } = useConversation();
  const [open, setOpen] = useState<boolean>(false);
  const [chatList, setChatList] = useState<Conversation[]>([]);

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
            <Link
              href={"/"}
              passHref
              onClick={() =>
                setConversationState((prev) => ({
                  ...prev,
                  conversationId: "",
                  messages: [],
                }))
              }
            >
              <p className="text-base font-normal text-black max-w-24">
                Great Migration
              </p>
            </Link>
            {session?.user ? (
              <SideDrawer
                chatList={chatList}
                session={session}
                fetchChatList={fetchChatList}
                open={open}
                setOpen={setOpen}
              />
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
            <Link
              href={"/"}
              passHref
              onClick={() =>
                setConversationState((prev) => ({
                  ...prev,
                  conversationId: "",
                  messages: [],
                }))
              }
            >
              <p className="text-base font-medium text-black">GM</p>
            </Link>

            {/* Right Side: Initials (if logged in) or Log in */}
            {session?.user ? (
              <div
                className="w-10 h-10 grid place-content-center bg-black text-white rounded-full cursor-pointer"
                onClick={() => setOpen(!open)}
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
