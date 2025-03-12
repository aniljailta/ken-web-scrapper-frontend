import httpService from '@/utils/httpService';
import DashboardTable from './DashboardTable';
import { getFlaggedMessagesColumnValue } from '@/utils/tableComponents';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { FlaggedData } from '../types';
import { ConversationDrawer } from './ConversationDrawer';

const flaggedHeaders = ['User', 'Report', 'Message', 'Action'];
export const FlaggedMessagesTable = () => {
    const [flaggedData, setFlaggedData] = useState<FlaggedData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const { data: session, status } = useSession()

    const fetchAdminReports = async () => {
        try {
            const response = await httpService.get("conversation/flag/messages", {
                headers: {
                    Authorization: `Bearer ${session ? session?.user?.access_token : ""}`,
                },
            });
            const { data } = await response.data;

            setFlaggedData(data);
        } catch (err) {
            setFlaggedData([]);
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


    if (status === "loading" || isLoading) {
        return (
            <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="flex items-center justify-center">
                <div className="text-red-500">Error: {error}</div>
            </div>
        );
    }

    return (
        <>
            {
                session &&
                <DashboardTable
                    data={flaggedData}
                    headers={flaggedHeaders}
                    columnValue={getFlaggedMessagesColumnValue}
                    session={session}
                />
            }

            <ConversationDrawer />
        </>
    )
}
