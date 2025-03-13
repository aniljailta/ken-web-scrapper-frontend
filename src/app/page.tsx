"use client";

import { useConversation } from "@/providers/ConversationProvider";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { useState } from "react";
import { InputComponent } from "./components/InputComponent";
import httpService from "@/utils/httpService";
import { ROLE_TYPE } from "@/utils/constant";
import { MessageList } from "./components/Chat/MessageList";
import { StreamingChat } from "./components/Chat/StreamChat";

export default function Home() {
  const { data: sessionUser } = useSession();
  const router = useRouter();
  const [chatProgressing, setChatProgressing] = useState<boolean>(false);
  const { conversationState, setConversationState } = useConversation();
  const { messages, isLoadingRequest } = conversationState;

  const onSubmit = async (productQuestion: string, reset: () => void) => {
    if (!productQuestion || isLoadingRequest) return;

    try {
      setConversationState((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          { role: ROLE_TYPE.USER, content: productQuestion, isFlag: false },
        ],
        isLoadingRequest: true,
      }));

      setChatProgressing(true);

      const res = await httpService.post(
        "conversation/chat",
        { question: productQuestion },
        {
          headers: {
            Authorization: `Bearer ${sessionUser ? sessionUser.user.access_token : ""
              }`,
          },
        }
      );

      const responseData = await res.data;

      setChatProgressing(false);
      reset(); // Reset form after submission

      if (responseData.data) {
        if (responseData?.conversationId) {
          // Perform the redirect only after the typing effect finishes
          router.push(`/search/${responseData?.conversationId}`);
        }
        setConversationState((prev) => ({
          ...prev,
          messages: [...prev.messages, { role: ROLE_TYPE.ASSISTANT, content: "", isFlag: false }],
        }));
        setConversationState((prev) => ({
          ...prev,
          messages: prev.messages.map((msg, i) =>
            i === prev.messages.length - 1 && msg.role === ROLE_TYPE.ASSISTANT
              ? { ...msg, content: responseData.data }
              : msg
          ),
        }));

      } else {
        setConversationState((prev) => ({
          ...prev,
          messages: [
            ...prev.messages,
            {
              role: ROLE_TYPE.ASSISTANT,
              content: responseData.message || "No response received",
              isFlag: false
            },
          ],
        }));
      }
    } catch (err) {
      console.error(err);
      setConversationState((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          { role: ROLE_TYPE.ASSISTANT, content: "Something went wrong.", isFlag: false },
        ],
      }));
    } finally {
      setConversationState((prev) => ({
        ...prev,
        isLoadingRequest: false,
      }));
    }
  };


  return (
    <div className="flex min-h-[78vh] flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full h-full max-w-xl space-y-8">
        {messages.length === 0 && (
          <div className="space-y-9">
            <h1 className="text-center text-3xl text-[32px] font-medium tracking-tight text-gray-900">
              What PID do you have?
            </h1>

            <InputComponent onSubmit={onSubmit} />
          </div>
        )}

        {messages.length > 0 && (
          <div className="flex flex-col h-full">
            <div className="flex-1 space-y-4 max-w-3xl">
              <MessageList data={messages} />
              {
                chatProgressing &&
                <StreamingChat />
              }
            </div>
            <div className="mt-4">
              <InputComponent onSubmit={onSubmit} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
