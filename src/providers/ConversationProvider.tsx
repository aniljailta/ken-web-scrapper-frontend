import httpService from "@/utils/httpService";
import { signOut, useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

type ConversationProviderProps = {
  children: React.ReactNode;
};

export type Message = {
  role: string;
  content: string;
  isFlag: boolean;
  reactionStatus?: boolean | null;
  id?: string;
};

type ConversationState = {
  messages: Message[];
  conversationId: string;
  messageLoading: boolean;
  isLoadingRequest: boolean;
};

type AdminConversationPreviewType = {
  open: boolean;
  conversationId: string | null;
}

type ConversationContextType = {
  conversationState: ConversationState;
  setConversationState: React.Dispatch<React.SetStateAction<ConversationState>>;
  adminChatPanel: AdminConversationPreviewType;
  setAdminChatPanel: React.Dispatch<React.SetStateAction<AdminConversationPreviewType>>
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
      isLoadingRequest: false,
    }
  );

  const [adminChatPanel, setAdminChatPanel] = useState<AdminConversationPreviewType>(
    {
      open: false,
      conversationId: null
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
      isLoadingRequest: false,
    });
  };

  return (
    <ConversationContext.Provider
      value={{
        conversationState, setConversationState, handleLogout,
        adminChatPanel, setAdminChatPanel
      }}
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
