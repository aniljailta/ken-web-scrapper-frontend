import { useConversation } from "@/providers/ConversationProvider";
import { DeleteSvg } from "@/svg";
import httpService from "@/utils/httpService";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";
import { Drawer } from "vaul";
import { Conversation } from "../types";
import { Session } from "next-auth";
import { getInitials } from "@/utils/helper";

interface SideDrawerProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  chatList: Conversation[];
  fetchChatList: () => void;
  session: Session;
}

function SideDrawer({
  open,
  setOpen,
  chatList,
  fetchChatList,
  session,
}: SideDrawerProps) {
  const { handleLogout, setConversationState } = useConversation();
  const router = useRouter();
  const params = useParams();
  const queryChatId = params?.chatId as string;

  const handleDeleteChat = async (chatId: string) => {
    if (session && session.user) {
      try {
        await httpService.delete(`conversation/chat/${chatId}`, {
          headers: {
            Authorization: `Bearer ${session && session.user ? session.user.access_token : ""
              }`,
          },
        });

        if (chatId === queryChatId) {
          setConversationState({
            messages: [],
            conversationId: "",
            messageLoading: false,
            isLoadingRequest: false,
          });
          router.replace("/");
        }
        fetchChatList();
        toast.success("Chat deleted");
      } catch (error) {
        console.error("Failed to delete chat:", error);
        toast.error("Failed to delete chat");
      }
    }
  };

  const handleAllDeleteChat = async () => {
    if (session && session.user) {
      try {
        await httpService.delete(`conversation/all-chats`, {
          headers: {
            Authorization: `Bearer ${session && session.user ? session.user.access_token : ""
              }`,
          },
        });

        setConversationState({
          messages: [],
          conversationId: "",
          messageLoading: false,
          isLoadingRequest: false,
        });
        router.replace("/");

        fetchChatList();
        toast.success("All Chats deleted");
      } catch (error) {
        console.error("Failed to delete all chat:", error);
        toast.error("Failed to delete all chat");
      }
    }
  };

  const handleClickSystemInstruction = () => {
    setOpen(false);
    setConversationState({
      messages: [],
      conversationId: "",
      messageLoading: false,
      isLoadingRequest: false,
    });
    router.push("/admin");
  };

  const handleClickDashboard = () => {
    setOpen(false);
    setConversationState({
      messages: [],
      conversationId: "",
      messageLoading: false,
      isLoadingRequest: false,
    });
    router.push("/admin/dashboard");
  };

  const handleClickBetaInvite = () => {
    setOpen(false);
    setConversationState({
      messages: [],
      conversationId: "",
      messageLoading: false,
      isLoadingRequest: false,
    });
    router.push("/admin/beta-invite");
  };

  return (
    <Drawer.Root direction="right" open={open} onOpenChange={setOpen}>
      <div className="relative">
        <Drawer.Trigger className="w-[50px] h-[47px] grid place-content-center bg-black text-white rounded-full cursor-pointer">
          {getInitials(session.user.name)}
        </Drawer.Trigger>

        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40" />
          <Drawer.Content className="-right-0.5 top-0.5 bottom-2 fixed z-10 outline-none w-80 h-screen flex rounded-lg bg-zinc-50 border border-gray-400">
            <div className="p-3 xl:p-5 space-y-4 w-full flex-1 flex flex-col justify-between gap-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center gap-2">
                  <div className="flex justify-start items-end gap-4">
                    <div
                      className="cursor-pointer"
                      onClick={() => setOpen(!open)}
                    >
                      <Image
                        src="/images/cross.svg"
                        alt="arrow"
                        width={18}
                        height={18}
                      />
                    </div>
                    {chatList?.length > 0 && (
                      <div
                        className="text-xs hover:text-red-500 cursor-pointer"
                        onClick={handleAllDeleteChat}
                      >
                        Clear all
                      </div>
                    )}
                  </div>
                  <Drawer.Title className="w-[50px] h-[47px] grid place-content-center bg-black text-white rounded-full">
                    {getInitials(session.user.name)}
                  </Drawer.Title>
                </div>
                <div className="space-y-2 max-h-[70vh] overflow-auto">
                  {chatList.map((chat, idx) => (
                    <Link
                      key={chat.id}
                      passHref
                      href={`/search/${chat.id}`}
                      className="block p-2 hover:bg-gray-100 group"
                      onClick={() => setOpen(!open)}
                    >
                      <div className="flex justify-between items-center gap-2">
                        <div>
                          <p className="text-xs text-black font-medium">
                            {String(idx + 1).padStart(3, "0")} Report
                          </p>
                          <p className="text-xs text-black font-light line-clamp-2">
                            {chat.productName
                              ? chat.productName.split(",")[0]
                              : "Report"}
                          </p>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <div
                            onClick={(e) => {
                              e.preventDefault();
                              handleDeleteChat(chat.id);
                            }}
                          >
                            <DeleteSvg />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-4">
                {session.user.role === "admin" && (
                  <>

                    <div className="flex justify-end items-center gap-2">
                      <div
                        className="text-sm text-black cursor-pointer"
                        onClick={handleClickBetaInvite}
                      >
                        Beta Invite
                      </div>
                    </div>
                    <div className="flex justify-end items-center gap-2">

                      <div
                        className="text-sm text-black cursor-pointer"
                        onClick={handleClickDashboard}
                      >
                        Dashboard
                      </div>
                    </div>{" "}
                    <div className="flex justify-end items-center gap-2">
                      <div
                        className="text-sm text-black cursor-pointer"
                        onClick={handleClickSystemInstruction}
                      >
                        System Instruction
                      </div>
                    </div>
                  </>
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
          </Drawer.Content>
        </Drawer.Portal>
      </div>
    </Drawer.Root>
  );
}

export default SideDrawer;
