export interface Conversation {
  id: string;
  userId?: string | null;
  isGuest: boolean;
  createdAt: string;
  productName?: string | null;
  messages: Message[];
  user?: User;
}

export interface Message {
  id: string;
  content: string;
  role: string;
  conversationId: string;
  createdAt: string;
  reactionStatus?: boolean | null;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  created_date: string;
  tokensUsed: number;
  conversations: Conversation[];
}

export interface ProductData {
  productname: string;
  count: string;
  messages: Message[];
  user: {
    id: string | null;
    name: string | null;
    email: string | null;
  };
}

export interface AdminReportData {
  totalChat: number;
  totalThread: number;
  totalRegisterUser: number;
  totalNonRegisterUser: number;
  userList: User[];
  conversationList: ProductData[];
}
