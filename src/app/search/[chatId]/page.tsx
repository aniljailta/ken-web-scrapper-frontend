"use client";

import { useConversation } from "@/providers/ConversationProvider";
import { useSession } from "next-auth/react";

import { useState } from "react";
import { InputComponent } from "../../components/InputComponent";

import Link from "next/link";
import httpService from "@/utils/httpService";
import MarkdownText from "@/app/components/Markdown";

export default function SearchPage() {
  const { data: sessionUser } = useSession();

  const [isTyping, setIsTyping] = useState<boolean>(false);

  const { conversationState, setConversationState } = useConversation();

  const { messages, conversationId, messageLoading } = conversationState;

  const onSubmit = async (productQuestion: string, reset: () => void) => {
    if (!productQuestion) return;

    try {
      setConversationState((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          { role: "user", content: productQuestion },
        ],
      }));

      setIsTyping(true);

      const res = await httpService.post(
        "conversation/thread",
        { question: productQuestion, conversationId },
        {
          headers: {
            Authorization: `Bearer ${
              sessionUser ? sessionUser.user.access_token : ""
            }`,
          },
        }
      );

      const responseData = await res.data;
      setIsTyping(false);
      reset(); // Reset form after submission

      if (responseData.data) {
        simulateTypingEffect(responseData.data);
        setConversationState((prev) => ({
          ...prev,
          conversationId: responseData?.conversationId,
        }));
      } else {
        setConversationState((prev) => ({
          ...prev,
          messages: [
            ...prev.messages,
            {
              role: "assistant",
              content: responseData.message || "No response received",
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
          { role: "assistant", content: "Something went wrong." },
        ],
      }));
    }
  };

  // Simulate Typing Effect
  const simulateTypingEffect = (response: string) => {
    let index = 0;

    setConversationState((prev) => ({
      ...prev,
      messages: [...prev.messages, { role: "assistant", content: "" }],
    }));

    const typingInterval = setInterval(() => {
      setConversationState((prev) => ({
        ...prev,
        messages: prev.messages.map((msg, i) =>
          i === prev.messages.length - 1 && msg.role === "assistant"
            ? { ...msg, content: msg.content + response[index - 1] }
            : msg
        ),
      }));

      index++;

      if (index >= response.length) {
        clearInterval(typingInterval);
      }
    }, 20);
  };

  return (
    <div className="flex flex-col min-h-[78vh] items-center justify-between">
      <div className="flex flex-col w-full max-w-xl flex-1">
        {messageLoading ? (
          // Show loading indicator while messages are loading
          <div className="flex flex-col h-full justify-center items-center">
            <div className="p-4 rounded-lg text-gray-900 animate-pulse">
              Loading messages...
            </div>
          </div>
        ) : (
          messages.length > 0 && (
            <div className="flex flex-col h-full justify-between flex-1">
              <Link
                passHref
                href={"/"}
                onClick={() =>
                  setConversationState((prev) => ({
                    ...prev,
                    conversationId: "",
                    messages: [],
                  }))
                }
              >
                <div className="flex justify-end">+ New Report</div>
              </Link>

              {/* Message area with scroll */}
              <div className="flex-1 overflow-y-auto space-y-4 max-w-3xl p-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg break-words text-base font-light text-black/75"
                  >
                    <MarkdownText text={message.content} />
                  </div>
                ))}

                {isTyping && (
                  <div className="p-4 bg-gray-100 text-gray-900 mr-auto rounded-lg break-words">
                    <span className="animate-pulse">Retrieving PID...</span>
                  </div>
                )}
              </div>

              {/* Fixed input box at the bottom */}
              <div className="mt-4 sticky bottom-0 bg-white w-full p-4">
                {messageLoading ? (
                  // Show loading indicator for input field
                  <div className="flex justify-center items-center p-4 rounded-lg bg-gray-100 text-gray-900 animate-pulse">
                    Preparing input field...
                  </div>
                ) : (
                  // Input field component once loading is complete
                  <InputComponent
                    onSubmit={onSubmit}
                    placeholder="What would you like to know?"
                  />
                )}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
