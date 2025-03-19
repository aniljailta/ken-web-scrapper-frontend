import { orderByOptions, sortByOptions } from "@/utils/constant";

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
  isFlag: boolean;
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
  users: {
    id: string | null;
    name: string | null;
    email: string | null;
  }[];
}

export interface AdminReportData {
  totalChat: number;
  totalThread: number;
  totalRegisterUser: number;
  totalNonRegisterUser: number;
  userList: User[];
  conversationList: ProductData[];
}

export interface FlaggedData {
  id: string;
  content: string;
  role: string;
  conversationId: string;
  isFlag: boolean;
  createdAt: Date;
  reactionStatus: null;
  conversation: Conversation;
}

export type SortByType = (typeof sortByOptions)[number]["value"];
export type OrderByType = (typeof orderByOptions)[number]["value"];

export type FiltersType = {
  sortBy: SortByType | null;
  orderBy: OrderByType | null;
};
