export interface Conversation {
  id: string;
  userId?: string | null;
  isGuest: boolean;
  createdAt: string;
  productName?: string | null;
  messages: Message[];
}

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  conversationId: string;
  createdAt: string;
  reactionStatus?: boolean | null;
}
