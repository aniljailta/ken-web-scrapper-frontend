"use client";

import { useConversation } from "@/providers/ConversationProvider";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { useState } from "react";
import { InputComponent } from "./components/InputComponent";
import httpService from "@/utils/httpService";
import { LoadingSvg } from "@/svg";
import { ROLE_TYPE } from "@/utils/constant";
import { MessageList } from "./components/Chat/MessageList";

export default function Home() {
  const { data: sessionUser } = useSession();
  const router = useRouter();
  const [isTyping, setIsTyping] = useState<boolean>(false);
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

      setIsTyping(true);

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

      setIsTyping(false);
      reset(); // Reset form after submission

      if (responseData.data) {
        // Simulate the typing effect
        simulateTypingEffect(responseData.data, () => {
          if (responseData?.conversationId) {
            // Perform the redirect only after the typing effect finishes
            router.push(`/search/${responseData?.conversationId}`);
          }

          // Set the conversationId after redirect
          setConversationState((prev) => ({
            ...prev,
            conversationId: responseData?.conversationId || "",
          }));
        });
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

  // Simulate Typing Effect with callback after finishing
  const simulateTypingEffect = (response: string, callback: () => void) => {
    let index = 0;

    // Add an empty message for the typing effect
    setConversationState((prev) => ({
      ...prev,
      messages: [...prev.messages, { role: ROLE_TYPE.ASSISTANT, content: "", isFlag: false }],
    }));

    const typingInterval = setInterval(() => {
      setConversationState((prev) => ({
        ...prev,
        messages: prev.messages.map((msg, i) =>
          i === prev.messages.length - 1 && msg.role === ROLE_TYPE.ASSISTANT
            ? { ...msg, content: msg.content + response[index - 1] }
            : msg
        ),
      }));

      index++;

      // Clear the interval when the typing effect is complete
      if (index >= response.length) {
        clearInterval(typingInterval);

        // Call the callback after the typing effect is done
        if (callback) callback();
      }
    }, 20);
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
              {isTyping && (
                <div className="p-4 bg-gray-100 text-gray-900 mr-auto rounded-lg flex items-center gap-2">
                  <span className="animate-pulse">Retrieving PID</span>
                  <LoadingSvg />
                </div>
              )}
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
