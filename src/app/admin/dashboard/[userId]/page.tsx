"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";

import httpService from "@/utils/httpService";

import DashboardTable from "@/app/components/DashboardTable";
import { Conversation } from "@/app/types";
import { getConversationColumnValue } from "@/utils/tableComponents";
import Image from "next/image";

function AdminUserChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [conversationList, setConversationList] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const params = useParams();
  const queryUserId = params?.userId as string;

  useEffect(() => {
    // Redirect if user is not admin
    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/");
    }
  }, [session, status, router]);

  const fetchUserReports = async () => {
    try {
      const response = await httpService.get(
        `users/conversation-by-user-id?userId=${queryUserId}`,
        {
          headers: {
            Authorization: `Bearer ${
              session ? session?.user?.access_token : ""
            }`,
          },
        }
      );

      const { data } = await response.data;

      setConversationList(data);
    } catch (err) {
      setConversationList([]);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.role === "admin" && queryUserId) {
      fetchUserReports();
    }
  }, [session, queryUserId]);

  // Show loading state
  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  // Only render if user is admin
  if (session?.user?.role !== "admin") {
    return null;
  }

  const userHeaders = ["User Name", "Product report", "Date", "Messages"];

  return (
    <div className="container mx-auto flex flex-col">
      <div className="bg-white rounded-lg overflow-hidden flex-1">
        <div className="flex flex-col p-4 gap-4">
          <div
            className="cursor-pointer flex justify-end"
            onClick={() => router.back()}
          >
            <Image src="/images/cross.svg" alt="arrow" width={18} height={18} />
          </div>

          <div className="my-4 lg:my-8">
            <DashboardTable
              data={conversationList}
              headers={userHeaders}
              columnValue={getConversationColumnValue}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminUserChatPage;
