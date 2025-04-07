"use client"
import Image from "next/image";
import React, { useEffect, useState } from 'react'
import { useRouter } from "next/navigation";
import DashboardTable from "@/app/components/DashboardTable";
import { formatDate } from "@/utils/tableComponents";
import httpService from "@/utils/httpService";
import { useSession } from "next-auth/react";
import { ScrapingLog } from "@/app/types";

const ScrapingLogs = () => {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [scrapingLogs, setScrapingLogs] = useState<{
        data: ScrapingLog[],
        total: number
    }>({
        data: [],
        total: 0
    });
    const [error, setError] = useState<string>("");

    const productHeader = [
        "Product Name",
        "Error",
        "Date",
    ];

    const getProductDataColumnValue = ({
        header,
        data,
    }: {
        header: string;
        data: ScrapingLog
    }) => {
        switch (header) {
            case "Product Name":
                return (
                    <div className="flex justify-between gap-2">
                        <p>{data.productName}</p>
                    </div>
                );

            case "Error":
                return <p className="text-red-400">
                    {
                        data.error
                    }
                </p>;
            case "Date":
                return formatDate(data.createdAt);
            default:
                return "";
        }
    };

    const fetchScrapingLogs = async () => {
        try {
            const response = await httpService.get(
                `products/scraping-logs`,
                {
                    headers: {
                        Authorization: `Bearer ${session ? session?.user?.access_token : ""
                            }`,
                    },
                }
            );

            const { data, total } = await response.data;

            setScrapingLogs({
                data, total
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (session?.user?.role === "admin") {
            fetchScrapingLogs();
        }
    }, [session])

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

    return (
        <div className="container mx-auto flex flex-col">
            <div className="bg-white rounded-lg overflow-hidden flex-1">
                <div className="flex flex-col p-4 space-y-4">
                    <div
                        className="cursor-pointer flex justify-end items-center"
                        onClick={() => router.back()}
                    >
                        <h2 className="font-bold flex-1 text-center">
                            Failed Scraped Products
                        </h2>
                        <Image src="/images/cross.svg" alt="arrow" width={18} height={18} />
                    </div>

                    <div className="my-4 lg:my-8 space-y-8">
                        <h4 className="font-normal flex-1 text-center">
                            Total - <span className="font-bold">
                                {scrapingLogs.total}</span>
                        </h4>
                        <DashboardTable
                            data={scrapingLogs.data}
                            headers={productHeader}
                            columnValue={getProductDataColumnValue}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ScrapingLogs