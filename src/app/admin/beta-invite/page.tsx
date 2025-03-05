"use client";
import { BetaInviteDrawer } from '@/app/components/BetaInviteDrawer';
import DashboardTable from '@/app/components/DashboardTable';
import { User } from '@/app/types';
import { LoadingSvg } from '@/svg';
import httpService from '@/utils/httpService';
import { getInviteColumnValue } from '@/utils/tableComponents';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

const headers = [
    'Name',
    'Email',
    'Created At',
    'Action'
];

const BetaInvite = () => {
    const { data: session } = useSession()
    const [open, setOpen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [users, setUsers] = useState<User[]>([]);


    const fetchBetaUsers = async () => {
        try {
            setIsLoading(true);
            const response = await httpService.get("users/beta-users", {
                headers: {
                    Authorization: `Bearer ${session ? session?.user?.access_token : ""}`,
                },
            });

            const { data } = await response.data;

            setUsers(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
            setUsers([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBetaUsers();
    }, [])

    return (
        <div className="my-4 lg:my-8">
            <div className="w-full flex-items-center justify-end flex mb-2">
                <button
                    className="h-[45px] bg-neutral-300 text-white px-4 py-3 rounded-[10px] hover:bg-black cursor-pointer"
                    onClick={() => {
                        setOpen(true);
                    }}
                >
                    Invite New User
                </button>

            </div>

            {
                error && <div className="flex items-center justify-center min-h-screen">
                    <div className="text-red-500">Error: {error}</div>
                </div>
            }
            {
                isLoading ?
                    <div className="p-4 bg-gray-100 text-gray-900 mr-auto rounded-lg flex items-center gap-2">
                        <span className="animate-pulse">Fetching Beta Users</span>
                        <LoadingSvg />
                    </div> : <>
                        {
                            users && session &&
                            <DashboardTable
                                data={users}
                                headers={headers}
                                columnValue={getInviteColumnValue}
                                session={session}
                            />

                        }
                    </>

            }


            <BetaInviteDrawer onFinish={fetchBetaUsers} setOpen={setOpen} open={open} />
        </div>
    )
}

export default BetaInvite; 