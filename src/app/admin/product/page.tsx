"use client";
import React, { Suspense, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

import Image from "next/image";
import httpService from "@/utils/httpService";
import { Conversation } from "@/app/types";
import DashboardTable from "@/app/components/DashboardTable";
import { formatDate } from "@/utils/tableComponents";

function AdminProductPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [conversationList, setConversationList] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const searchParams = useSearchParams();
  const queryProductName = searchParams.get("productName");

  useEffect(() => {
    // Redirect if user is not admin
    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/");
    }
  }, [session, status, router]);

  const fetchUserReports = async () => {
    try {
      const response = await httpService.get(
        `users/conversation-by-product-name?productName=${queryProductName}`,
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
    if (session?.user?.role === "admin" && queryProductName) {
      fetchUserReports();
    }
  }, [session, queryProductName]);

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

  const productHeader = [
    "Product Name",
    "User Name",
    "User Email",
    "Date",
    "Messages",
  ];

  const getProductDataColumnValue = ({
    header,
    data,
  }: {
    header: string;
    data: Conversation;
  }) => {
    switch (header) {
      case "Product Name":
        return (
          <div className="flex justify-between gap-2">
            <p>{data.productName}</p>
          </div>
        );

      case "User Name":
        return data.user?.name || "Guest";
      case "User Email":
        return data.user?.email || "";
      case "Date":
        return formatDate(data.createdAt);
      case "Messages":
        return data.messages.length;
      default:
        return "";
    }
  };

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
              headers={productHeader}
              columnValue={getProductDataColumnValue}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const Page = () => {
  return (
    <Suspense>
      <AdminProductPage />
    </Suspense>
  );
};

export default Page;
