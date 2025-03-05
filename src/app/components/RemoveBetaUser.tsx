import httpService from '@/utils/httpService';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { toast } from 'sonner';

const RemoveBetaUser = ({ id }: {
    id: string
}) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { data: session } = useSession();
    const deleteBetaUser = async () => {
        try {
            setIsLoading(true);
            const { data } = await httpService.delete(`users/beta-user/${id}`, {
                headers: {
                    Authorization: `Bearer ${session ? session?.user?.access_token : ""}`,
                },
            });
            if (data.message) {
                toast.info(data.message, {
                    onAutoClose: () => {
                        // Refreshing Page
                        window.location.reload();
                    }
                });
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <button onClick={deleteBetaUser} disabled={isLoading} className="disabled:cursor-not-allowed bg-neutral-300 text-white p-2  rounded-[10px] hover:bg-black cursor-pointer">
            Delete
        </button>
    )
}

export default RemoveBetaUser