"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { InputComponent } from "../components/InputComponent";
import { useConversation } from "@/providers/ConversationProvider";
import { toast } from "sonner";
import httpService from "@/utils/httpService";
import MarkdownText from "../components/Markdown";
import { LoadingSvg } from "@/svg";
import { ROLE_TYPE } from "@/utils/constant";

function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const [isTestingMode, setIsTestingMode] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  const { conversationState, setConversationState } = useConversation();

  const { messages } = conversationState;

  useEffect(() => {
    // Redirect if user is not admin
    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/");
    }
  }, [session, status, router]);

  const fetchContent = async () => {
    try {
      const response = await httpService.post(
        "users/user-values-by-name",
        { name: "ai_prompt" },
        {
          headers: {
            Authorization: `Bearer ${
              session ? session?.user?.access_token : ""
            }`,
          },
        }
      );

      const data = await response.data;

      setContent(data.text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const submitInstruction = async () => {
    if (
      session?.user?.access_token &&
      content &&
      session?.user?.role === "admin"
    ) {
      try {
        const response = await httpService.post(
          "users/update-user-value",
          { name: "ai_prompt", text: content },
          {
            headers: {
              Authorization: `Bearer ${session?.user?.access_token}`,
            },
          }
        );
        if (!response.data) throw new Error("Saved unsuccessful ");

        fetchContent();
        toast.success("Save successful");
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        toast.error(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const publishInstruction = () => {
    submitInstruction();
    fetchContent();
    setIsTestingMode(false);
  };

  useEffect(() => {
    if (session?.user?.role === "admin") {
      fetchContent();
    }
  }, [session]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const onSubmit = async (productQuestion: string, reset: () => void) => {
    if (!productQuestion) return;

    try {
      setConversationState((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          { role: ROLE_TYPE.USER, content: productQuestion },
        ],
      }));

      setIsTyping(true);

      const res = await httpService.post("conversation/chat", {
        question: productQuestion,
      });

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
              role: ROLE_TYPE.ASSISTANT,
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
          { role: ROLE_TYPE.ASSISTANT, content: "Something went wrong." },
        ],
      }));
    }
  };

  // Simulate Typing Effect
  const simulateTypingEffect = (response: string) => {
    let index = 0;

    setConversationState((prev) => ({
      ...prev,
      messages: [...prev.messages, { role: ROLE_TYPE.ASSISTANT, content: "" }],
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

      if (index >= response.length) {
        clearInterval(typingInterval);
      }
    }, 20);
  };

  // Show loading state
  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  // Only render if user is admin
  if (session?.user?.role !== "admin") {
    return null;
  }

  return (
    <div className="container mx-auto min-h-[78vh] flex flex-col">
      <div className="bg-white rounded-lg overflow-hidden flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[78vh]">
          {/* Left Section */}
          <div className="flex flex-col justify-between p-4">
            <div>
              <h2 className="text-base font-medium text-black">
                System Instructions
              </h2>

              <div className="p-4">
                {!isTestingMode ? (
                  <div className="px-2 py-6 max-h-80 overflow-auto">
                    {content}
                  </div>
                ) : (
                  <textarea
                    id="content"
                    value={content}
                    onChange={handleChange}
                    className="w-full min-h-80 h-80 p-4 border rounded-md focus:ring-2 focus:ring-neutral-200 focus:border-neutral-200"
                  />
                )}
              </div>
            </div>

            {/* Bottom Section */}
            <div>
              <div className="flex justify-between gap-2">
                <div className="flex flex-row items-center">
                  <p
                    className={`p-4 ${
                      !isTestingMode ? "text-black" : "text-neutral-500"
                    } font-medium text-base cursor-pointer`}
                    onClick={() => setIsTestingMode(false)}
                  >
                    Live
                  </p>
                  <p
                    className={`p-4 ${
                      isTestingMode ? "text-black" : "text-neutral-500"
                    } font-medium text-base cursor-pointer`}
                    onClick={() => setIsTestingMode(true)}
                  >
                    Testing
                  </p>
                </div>
                {isTestingMode && (
                  <div className="flex flex-row items-center gap-4">
                    <p className="cursor-pointer" onClick={submitInstruction}>
                      Save
                    </p>
                    <p
                      className="min-w-24 px-4 py-3 bg-black text-white rounded-[10px] cursor-pointer"
                      onClick={publishInstruction}
                    >
                      Publish
                    </p>
                  </div>
                )}
              </div>

              <div className="text-black p-4 flex flex-row items-center gap-2">
                <span className="font-medium">Modal:</span>{" "}
                {process.env.NEXT_PUBLIC_AI_ASSISTANT_MODAL}
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex p-4">
            <div className="flex flex-col w-full max-w-xl flex-1">
              <div className="flex flex-col h-full justify-between flex-1">
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
                    <div className="p-4 bg-gray-100 text-gray-900 mr-auto rounded-lg flex gap-2">
                      <span className="animate-pulse">Retrieving PID</span>
                      <LoadingSvg />
                    </div>
                  )}
                </div>

                {/* Fixed input box at the bottom */}
                <div className="mt-4 sticky bottom-0 bg-white w-full p-4">
                  <InputComponent onSubmit={onSubmit} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
