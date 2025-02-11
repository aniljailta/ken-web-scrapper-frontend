import { ROLE_TYPE } from "@/utils/constant";

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
  role: ROLE_TYPE;
  conversationId: string;
  createdAt: string;
  reactionStatus?: boolean | null;
}
