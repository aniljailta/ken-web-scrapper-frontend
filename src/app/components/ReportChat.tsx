import { ReportIcon } from '@/svg/Report'
import httpService from '@/utils/httpService';
import { useSession } from 'next-auth/react';
import React, { useState } from 'react'
import { toast } from 'sonner'

interface ReportChatProps {
    messageId: string;
    isFlag: boolean;
}

export const ReportChat: React.FC<ReportChatProps> = ({ messageId, isFlag }) => {
    const { data: session } = useSession();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleClick = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            await httpService.post(`conversation/flag/message/${messageId}`, {}, {
                headers: {
                    Authorization: `Bearer ${session ? session?.user?.access_token : ""}`,
                },
            });
            toast.success("Message has been reported");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div onClick={isLoading ? handleClick : undefined} role='button' className='cursor-pointer'>
            <ReportIcon isActive={isFlag} />
        </div>
    )
}
