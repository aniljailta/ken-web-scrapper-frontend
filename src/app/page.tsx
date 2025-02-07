"use client";

import { useConversation } from "@/providers/ConversationProvider";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { useState } from "react";
import { InputComponent } from "./components/InputComponent";

export default function Home() {
  const { data: sessionUser } = useSession();
  const router = useRouter();

  const [isTyping, setIsTyping] = useState<boolean>(false);

  const { conversationState, setConversationState } = useConversation();

  const { messages } = conversationState;

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

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}conversation/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${
              sessionUser ? sessionUser.user.access_token : ""
            }`,
          },
          body: JSON.stringify({
            question: productQuestion,
          }),
        }
      );

      const responseData = await res.json();
      setIsTyping(false);
      reset(); // Reset form after submission

      if (responseData.data) {
        simulateTypingEffect(responseData.data);
        setConversationState((prev) => ({
          ...prev,
          conversationId: responseData?.conversationId,
        }));
        router.push(`/search/${responseData?.conversationId}`);
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
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg break-words text-base font-light text-black/75`}
                >
                  {message.content}
                </div>
              ))}

              {isTyping && (
                <div className="p-4 bg-gray-100 text-gray-900 mr-auto rounded-lg break-words">
                  <span className="animate-pulse">Retrieving PID...</span>
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
