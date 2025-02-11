import httpService from "@/utils/httpService";
import { signOut, useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

type ConversationProviderProps = {
  children: React.ReactNode;
};

type Message = {
  role: string;
  content: string;
  reactionStatus?: boolean | null;
  id?: string;
};

type ConversationState = {
  messages: Message[];
  conversationId: string;
  messageLoading: boolean;
};

type ConversationContextType = {
  conversationState: ConversationState;
  setConversationState: React.Dispatch<React.SetStateAction<ConversationState>>;
  handleLogout: () => void;
};

const ConversationContext = createContext<ConversationContextType | undefined>(
  undefined
);

export const ConversationProvider: React.FC<ConversationProviderProps> = ({
  children,
}) => {
  const { data: sessionUser } = useSession();
  const router = useRouter();
  const params = useParams();
  const queryChatId = params?.chatId as string;

  const [conversationState, setConversationState] = useState<ConversationState>(
    {
      messages: [],
      conversationId: queryChatId || "",
      messageLoading: false,
    }
  );

  const fetchMessages = async () => {
    if (!sessionUser?.user?.access_token || !queryChatId) return;

    try {
      setConversationState((prev) => ({ ...prev, messageLoading: true }));

      const response = await httpService.get(
        `conversation/messages?conversationId=${queryChatId}`,
        {
          headers: {
            Authorization: `Bearer ${sessionUser.user.access_token}`,
          },
        }
      );

      const data = await response.data;

      if (!data) {
        router.push("/");
        return;
      }

      setConversationState((prev) => ({
        ...prev,
        conversationId: queryChatId,
        messages: data.messages,
        messageLoading: false,
      }));
    } catch (error) {
      console.error("Error fetching messages:", error);
      setConversationState((prev) => ({
        ...prev,
        messageLoading: false,
        conversationId: "",
        messages: [],
      }));
      router.push("/");
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [sessionUser?.user?.access_token, queryChatId, router]);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
    setConversationState({
      messages: [],
      conversationId: "",
      messageLoading: false,
    });
  };

  return (
    <ConversationContext.Provider
      value={{ conversationState, setConversationState, handleLogout }}
    >
      {children}
    </ConversationContext.Provider>
  );
};

export const useConversation = () => {
  const context = useContext(ConversationContext);
  if (context === undefined) {
    throw new Error(
      "useConversation must be used within a ConversationProvider"
    );
  }
  return context;
};
