"use client";
import { BetaInviteDrawer } from '@/app/components/BetaInviteDrawer';
import DashboardTable from '@/app/components/DashboardTable';
import { TableFilters } from '@/app/components/TableFilters';
import { FiltersType, User } from '@/app/types';
import { LoadingSvg } from '@/svg';
import httpService from '@/utils/httpService';
import { getInviteColumnValue } from '@/utils/tableComponents';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

const headers = [
    'Name',
    'Email',
    'Created At',
    'Status',
    'Action'
];

const BetaInvite = () => {
    const { data: session, status } = useSession()
    const [open, setOpen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [users, setUsers] = useState<User[]>([]);
    const [filters, setFilters] = useState<FiltersType>({ sortBy: null, orderBy: null })


    const fetchBetaUsers = async (filters?: FiltersType) => {
        try {

            let queryParams = '';
            const urlParam = new URLSearchParams()
            if (filters?.orderBy) {
                urlParam.append('orderBy', filters.orderBy);
            }
            if (filters?.sortBy) {
                urlParam.append('sortBy', filters.sortBy);
            }
            queryParams = urlParam.toString();

            setIsLoading(true);
            const response = await httpService.get(`users/beta-users?${queryParams ? queryParams : ''}`, {
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
        if (session?.user?.role === "admin") {
            fetchBetaUsers();
        }
    }, [session])


    useEffect(() => {
        fetchBetaUsers(filters);
    }, [filters])

    if (status === "loading" || isLoading) {
        return (
            <div className="p-4 bg-gray-100 text-gray-900 mr-auto rounded-lg flex items-center gap-2">
                <span className="animate-pulse">Fetching Beta Users</span>
                <LoadingSvg />
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

            <TableFilters
                key='beta-filters' filters={filters} setFilters={setFilters} onChange={(values) => {
                    if (values?.orderBy || values?.sortBy) {
                        setFilters(values);
                    }
                }} />
            <>
                {
                    users && session &&
                    <>

                        <DashboardTable
                            data={users}
                            headers={headers}
                            columnValue={getInviteColumnValue}
                            session={session}
                        />
                    </>
                }
            </>


            <BetaInviteDrawer onFinish={fetchBetaUsers} setOpen={setOpen} open={open} />
        </div>
    )
}

export default BetaInvite; 