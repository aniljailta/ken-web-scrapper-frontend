import ProductTableDoc from "@/app/components/PDFDocumentComponent/ProductTableDoc";
import { ToggleConversationButton } from "@/app/components/ToggleConversationButton";
import { Conversation, FlaggedData, ProductData, User } from "@/app/types";
import { Session } from "next-auth";
import Link from "next/link";
import RemoveBetaUser from "@/app/components/RemoveBetaUser";
import { copyToClipboard, generateInviteLink } from "./helper";
import { toast } from "sonner";

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
    // default:
    //   return <UserTableDoc dataId={data.id} session={session} />;
  }
};

export const getInviteColumnValue = ({
  header,
  data,
}: {
  header: string;
  data: User;
  session?: Session;
}) => {
  switch (header) {
    case "Name":
      return (
        <Link href={`/admin/dashboard/${data.id}`} passHref>
          <div className="flex justify-between gap-2 underline hover:text-blue-800">
            <p>{data.name}</p>
          </div>
        </Link>
      );
    case "Email":
      return (
        <Link href={`/admin/dashboard/${data.id}`} passHref>
          <div className="flex justify-between gap-2 underline hover:text-blue-800">
            <p>{data.email}</p>
          </div>
        </Link>
      );
    case "Status":
      return (
        data.password ? <span>
          Logged In
        </span> : <span>
          Not Logged In
        </span>
      )
    case "Created At":
      return formatDate(data.created_date);
    default:
      return <div className="flex items-center justify-center gap-2">
        <button onClick={async () => {
          const content = await generateInviteLink(data.email);

          if (content) {

            copyToClipboard(content)
              .then(() => {
                toast.success('Invite Link Copied to Clipboard')
              }).catch((error) => {
                toast.error(error instanceof Error ? error.message : 'Something Went wrong while Copying invite link')
              });
          }
        }} className=" bg-neutral-300 text-white p-2  rounded-[10px] hover:bg-black cursor-pointer">
          Copy Invite Link
        </button>
        <RemoveBetaUser id={data.id} />
      </div>;
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
    case "Action":
      return <ToggleConversationButton conversationId={data.id} />;
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

export const getFlaggedMessagesColumnValue = ({
  header,
  data,
  session,
}: {
  header: string;
  data: FlaggedData;
  session?: Session;
}) => {
  switch (header) {
    case "User":
      return (
        <Link href={`/admin/dashboard/${encodeURIComponent(data.conversation.user?.id || '')}`} passHref>
          <div className="flex justify-between gap-2 underline hover:text-blue-800">
            {data.conversation.user?.name}
          </div>
        </Link>
      );
    case "Report":
      return <Link href={`/admin/product?productName=${data.conversation.productName}`} passHref>
        <div className="flex justify-between gap-2 underline hover:text-blue-800">
          {data.conversation.productName}
        </div>
      </Link>
    case "Message":
      return 'Message Here';
    case "Action":
      return <ToggleConversationButton conversationId={data.conversationId} />;
    default:
      return (
        <ProductTableDoc productName={data?.conversation?.productName || ''} session={session} />
      );
  }
};