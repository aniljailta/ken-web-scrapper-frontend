import ProductTableDoc from "@/app/components/PDFDocumentComponent/ProductTableDoc";
import UserTableDoc from "@/app/components/PDFDocumentComponent/UserTableDoc";
import { Conversation, ProductData, User } from "@/app/types";
import { Session } from "next-auth";
import Link from "next/link";

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Calculate total messages across all conversations
export const getTotalMessages = (conversations: Conversation[]) => {
  if (!conversations || !Array.isArray(conversations)) return 0;

  return conversations.reduce((total, conversation) => {
    // If conversation has messages array, add its length
    if (conversation.messages && Array.isArray(conversation.messages)) {
      return total + conversation.messages.length;
    }
    return total;
  }, 0);
};

// Map data to appropriate columns
export const getUserTableColumnValue = ({
  header,
  data,
  session,
}: {
  header: string;
  data: User;
  session?: Session;
}) => {
  switch (header) {
    case "Users by total queries":
      return (
        <Link href={`/admin/dashboard/${data.id}`} passHref>
          <div className="flex justify-between gap-2 underline hover:text-blue-800">
            <p>{data.name}</p> <p>{data.conversations?.length || 0}</p>
          </div>
        </Link>
      );

    case "User ID":
      return data.email;
    case "Date":
      return formatDate(data.created_date);
    case "Report":
      return data.conversations.length
        ? data.conversations[0].productName?.slice(0, 25) + "..."
        : "No reports till now";
    case "Messages":
      return getTotalMessages(data.conversations);
    case "Tokens":
      return data.tokensUsed;
    default:
      return <UserTableDoc dataId={data.id} session={session} />;
  }
};

export const getConversationColumnValue = ({
  header,
  data,
}: {
  header: string;
  data: Conversation;
}) => {
  switch (header) {
    case "Product report":
      return (
        <div className="flex justify-between gap-2">
          <p>{data.productName}</p>
        </div>
      );

    case "User Name":
      return data.user?.name || "Guest";
    case "Date":
      return formatDate(data.createdAt);
    case "Messages":
      return data.messages.length;
    default:
      return "";
  }
};

export const getConversationTableColumnValue = ({
  header,
  data,
  session,
}: {
  header: string;
  data: ProductData;
  session?: Session;
}) => {
  switch (header) {
    case "Report":
      return (
        <Link href={`/admin/product?productName=${data.productname}`} passHref>
          <div className="flex justify-between gap-2 underline hover:text-blue-800">
            <p>{data.productname}</p> <p>{data.count || 0}</p>
          </div>
        </Link>
      );
    case "User Name":
      return data.users?.length ? data.users[0]?.name || "Guest" : "Guest";
    case "Message":
      return data.messages.length || 0;
    default:
      return (
        <ProductTableDoc productName={data.productname} session={session} />
      );
  }
};
