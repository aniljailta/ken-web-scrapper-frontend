import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type ConversationProviderProps = {
  children: React.ReactNode;
};

type Message = {
  role: string;
  content: string;
};

type ConversationState = {
  messages: Message[];
  conversationId: string;
  messageLoading: boolean;
};

type ConversationContextType = {
  conversationState: ConversationState;
  setConversationState: React.Dispatch<React.SetStateAction<ConversationState>>;
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

  const sessionAccessToken = useRef<string | undefined>(undefined);

  useEffect(() => {
    sessionAccessToken.current = sessionUser?.user?.access_token;
  }, [sessionUser?.user?.access_token]);

  const fetchMessages = useCallback(
    async () => {
      if (sessionAccessToken.current && queryChatId) {
        try {
          setConversationState((prev) => ({ ...prev, messageLoading: true }));

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}conversation/messages?conversationId=${queryChatId}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${sessionAccessToken.current || ""}`,
              },
            }
          );

          if (!response.ok) {
            router.push("/");
            return;
          }

          const data = await response.json();
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
      }
    },
    [queryChatId, router] // Dependencies
  );

  useEffect(() => {
    if (sessionAccessToken.current) {
      fetchMessages();
    }
  }, [fetchMessages]);

  return (
    <ConversationContext.Provider
      value={{ conversationState, setConversationState }}
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
