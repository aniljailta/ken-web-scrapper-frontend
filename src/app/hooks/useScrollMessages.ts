import { RefObject, useEffect } from "react";

type Message = {
  role: string;
  content: string;
  reactionStatus?: boolean | null;
  id?: string;
};

interface UseScrollMessagesProps {
  messageContainerRef: RefObject<HTMLDivElement>;
  typingIndicatorRef: RefObject<HTMLDivElement>;
  messages: Message[];
  isTyping: boolean;
}

export const useScrollMessages = ({
  messageContainerRef,
  typingIndicatorRef,
  messages,
  isTyping,
}: UseScrollMessagesProps) => {
  // Scroll to typing indicator
  const scrollToTypingIndicator = () => {
    if (typingIndicatorRef.current) {
      setTimeout(() => {
        typingIndicatorRef.current?.scrollIntoView({
          block: "start",
          behavior: "smooth",
        });
      }, 0);
    }
  };

  // Scroll to last message
  const scrollToLastMessage = () => {
    if (messageContainerRef.current) {
      const lastMessage = messageContainerRef.current.lastElementChild;
      lastMessage?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  };

  // Watch for typing status changes
  useEffect(() => {
    if (isTyping) {
      scrollToTypingIndicator();
    }
  }, [isTyping]);

  // Watch for message changes
  useEffect(() => {
    scrollToLastMessage();
  }, [messages]);

  return {
    scrollToTypingIndicator,
    scrollToLastMessage,
  };
};
