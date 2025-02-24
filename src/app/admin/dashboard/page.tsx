"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import httpService from "@/utils/httpService";

import DashboardTable from "@/app/components/DashboardTable";
import { AdminReportData } from "@/app/types";
import {
  getConversationTableColumnValue,
  getUserTableColumnValue,
} from "@/utils/tableComponents";

const initialAdminReport = {
  totalChat: 0,
  totalThread: 0,
  totalRegisterUser: 0,
  totalNonRegisterUser: 0,
  userList: [],
  conversationList: [],
};

function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [adminReportsData, setAdminReportData] =
    useState<AdminReportData>(initialAdminReport);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // Redirect if user is not admin
    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/");
    }
  }, [session, status, router]);

  const fetchAdminReports = async () => {
    try {
      const response = await httpService.get("users/admin-reports", {
        headers: {
          Authorization: `Bearer ${session ? session?.user?.access_token : ""}`,
        },
      });

      const { data } = await response.data;

      setAdminReportData(data);
    } catch (err) {
      setAdminReportData(initialAdminReport);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.role === "admin") {
      fetchAdminReports();
    }
  }, [session]);

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

  const userHeaders = [
    "Users by total queries",
    "User ID",
    "Date",
    "Report",
    "Messages",
    "Tokens",
    "",
  ];

  const conversationHeaders = ["Report", "User Name", "Message", ""];

  return (
    <div className="container mx-auto flex flex-col">
      <div className="bg-white rounded-lg overflow-hidden flex-1">
        <div className="flex flex-col p-4 gap-4">
          <div className="mb-4">
            <h2 className="text-base font-medium text-black">Dashboard</h2>
          </div>
          <div className="grid grid-col-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col gap-4 items-center justify-center">
              <div className="text-2xl font-normal">
                {adminReportsData.totalThread}{" "}
              </div>
              <div className="text-base font-normal">Total Queries</div>
            </div>
            <div className="flex flex-col gap-4 items-center justify-center">
              <div className="text-2xl font-normal">
                {Number(
                  adminReportsData.totalChat /
                    adminReportsData.totalRegisterUser
                ).toFixed(3)}
              </div>
              <div className="text-base font-normal">Avg. Queries</div>
            </div>
            <div className="flex flex-col gap-4 items-center justify-center">
              <div className="text-2xl font-normal">
                {adminReportsData.totalChat}
              </div>
              <div className="text-base font-normal">Total Reports</div>
            </div>
            {/* <div className="flex flex-col gap-4 items-center justify-center">
              <div className="text-2xl font-normal">00</div>
              <div className="text-base font-normal">Avg. Response Time</div>
            </div> */}
            <div className="flex flex-col gap-4 items-center justify-center">
              <div className="text-2xl font-normal">
                {adminReportsData.totalRegisterUser}/
                {adminReportsData.totalNonRegisterUser}
              </div>
              <div className="text-base font-normal">Registered/Non Users</div>
            </div>
          </div>
          <div className="my-4 lg:my-8">
            <DashboardTable
              data={adminReportsData.userList}
              headers={userHeaders}
              columnValue={getUserTableColumnValue}
              session={session}
            />
          </div>

          <div className="my-4 lg:my-8">
            <DashboardTable
              data={adminReportsData.conversationList}
              headers={conversationHeaders}
              columnValue={getConversationTableColumnValue}
              session={session}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
