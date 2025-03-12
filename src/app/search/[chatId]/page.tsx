"use client";

import { useConversation } from "@/providers/ConversationProvider";
import { useSession } from "next-auth/react";

import { RefObject, useRef, useState } from "react";
import { InputComponent } from "../../components/InputComponent";

import Link from "next/link";
import httpService from "@/utils/httpService";
import MarkdownText from "@/app/components/Markdown";
import { LoadingSvg, PencilSvg, ThumbsDown, ThumbsUp } from "@/svg";
import { ROLE_TYPE } from "@/utils/constant";
import { useScrollMessages } from "@/app/hooks/useScrollMessages";
import SuggestionList from "@/app/components/SuggestionList";
import { ReportChat } from "@/app/components/ReportChat";

export default function SearchPage() {
  const { data: sessionUser } = useSession();

  const [isTyping, setIsTyping] = useState<boolean>(false);
  const { conversationState, setConversationState } = useConversation();
  const { messages, conversationId, messageLoading, isLoadingRequest } =
    conversationState;

  const messageContainerRef = useRef<HTMLDivElement>(null);
  const typingIndicatorRef = useRef<HTMLDivElement>(null);

  const { scrollToLastMessage } = useScrollMessages({
    messageContainerRef: messageContainerRef as RefObject<HTMLDivElement>,
    typingIndicatorRef: typingIndicatorRef as RefObject<HTMLDivElement>,
    messages,
    isTyping,
  });

  const onSubmit = async (productQuestion: string, reset: () => void) => {
    if (!productQuestion || isLoadingRequest) return;

    try {
      setConversationState((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            role: ROLE_TYPE.USER,
            content: productQuestion,
            reactionStatus: null,
            isFlag: false
          },
        ],
        isLoadingRequest: true,
      }));

      // Scroll after adding user message
      scrollToLastMessage();

      setIsTyping(true);

      const res = await httpService.post(
        "conversation/thread",
        { question: productQuestion, conversationId },
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
        simulateTypingEffect(responseData.data, responseData?.messageId);
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
              reactionStatus: responseData.reactionStatus || null,
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
          {
            role: ROLE_TYPE.ASSISTANT,
            content: "Something went wrong.",
            reactionStatus: null,
            isFlag: false,

          },
        ],
      }));
    } finally {
      setConversationState((prev) => ({
        ...prev,
        isLoadingRequest: false,
      }));
    }
  };

  // Simulate Typing Effect
  const simulateTypingEffect = (response: string, messageId?: string) => {
    let index = 0;

    setConversationState((prev) => ({
      ...prev,
      messages: [
        ...prev.messages,
        { role: ROLE_TYPE.ASSISTANT, content: "", reactionStatus: null, isFlag: false },
      ],
    }));

    const typingInterval = setInterval(() => {
      setConversationState((prev) => ({
        ...prev,
        messages: prev.messages.map((msg, i) =>
          i === prev.messages.length - 1 && msg.role === ROLE_TYPE.ASSISTANT
            ? {
              ...msg,
              content: msg.content + response[index - 1],
              ...(messageId && { id: messageId }),
            }
            : msg
        ),
      }));

      // Scroll after each character is added
      requestAnimationFrame(() => {
        scrollToLastMessage();
      });

      index++;

      if (index >= response.length) {
        clearInterval(typingInterval);
      }
    }, 20);
  };

  const handleReaction = async ({
    messageId,
    newStatus,
  }: {
    messageId: string;
    newStatus: boolean | null;
  }) => {
    setConversationState((prev) => ({
      ...prev,
      messages: prev.messages.map((msg) =>
        msg.id === messageId ? { ...msg, reactionStatus: newStatus } : msg
      ),
    }));
    if (messageId) {
      try {
        await httpService.post(
          "conversation/message/reaction",
          { messageId, reactionStatus: newStatus },
          {
            headers: {
              Authorization: `Bearer ${sessionUser ? sessionUser.user.access_token : ""
                }`,
            },
          }
        );
      } catch (error) {
        console.error("Failed to update reaction:", error);

        // Rollback UI state if API fails
        setConversationState((prev) => ({
          ...prev,
          messages: prev.messages.map((msg) =>
            msg.id === messageId ? { ...msg, reactionStatus: !newStatus } : msg
          ),
        }));
      }
    }
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
                <div className="flex justify-end">
                  <div className="block md:hidden">
                    <PencilSvg />
                  </div>
                  <div className="hidden md:block">+ New Report</div>
                </div>
              </Link>

              {/* Message area with scroll */}
              <div
                ref={messageContainerRef}
                className="flex-1 overflow-y-auto space-y-4 max-w-3xl p-4"
              >
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg break-words  text-black/75 ${message.role === ROLE_TYPE.USER
                      ? "text-xl font-normal"
                      : "text-base font-light"
                      }`}
                  >
                    <MarkdownText text={message.content} />
                    {message.role !== ROLE_TYPE.USER && (
                      <div className="flex gap-4 mt-4 items-center justify-start">
                        <div className="flex gap-8 cursor-pointer">
                          {/* Like Button */}
                          <div
                            onClick={() =>
                              handleReaction({
                                messageId: message?.id || "",
                                newStatus:
                                  message.reactionStatus === true ? null : true,
                              })
                            }
                          >
                            <ThumbsUp
                              isActive={Boolean(message.reactionStatus)}
                            />
                          </div>

                          {/* Dislike Button */}
                          <div
                            onClick={() =>
                              handleReaction({
                                messageId: message?.id || "",
                                newStatus:
                                  message.reactionStatus === false ? null : false,
                              })
                            }
                          >
                            <ThumbsDown
                              isActive={message.reactionStatus === false}
                            />
                          </div>
                        </div>
                        <ReportChat isFlag={message.isFlag} messageId={message?.id || ''} />
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div
                    ref={typingIndicatorRef}
                    className="p-4 bg-gray-100 text-gray-900 mr-auto rounded-lg flex items-center gap-2"
                  >
                    <span className="animate-pulse">Retrieving PID</span>
                    <LoadingSvg />
                  </div>
                )}
                {/* Spacer div to maintain gap */}
                <div className="h-20 w-full"></div>
              </div>

              {/* Fixed input box at the bottom */}
              <div className="mt-4 sticky bottom-0 bg-white w-full p-4 space-y-3">
                <SuggestionList
                  onSelect={(question) => onSubmit(question, () => { })}
                />
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
