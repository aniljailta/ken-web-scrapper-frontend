"use client";
import { Message } from '@/providers/ConversationProvider';
import { Drawer } from 'vaul';
import Image from "next/image";
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import httpService from '@/utils/httpService';
import { toast } from 'sonner';

export type ConversationState = {
    messages: Message[];
    conversationId: string;
    isGuest: boolean;
    name: string;
    createdAt: string;
};

export const BetaInviteDrawer = ({ setOpen, open, onFinish }: {
    open: boolean,
    setOpen: React.Dispatch<React.SetStateAction<boolean>>,
    onFinish: () => void,
}) => {
    const { data: session } = useSession();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [inviteForm, setInviteForm] = useState({
        firstName: '',
        email: ''
    });

    const handleClose = () => {
        setOpen(false);
        setInviteForm({
            firstName: '',
            email: ''
        });
    }

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const isValidEmail = validateEmail(inviteForm.email);
        if (!isValidEmail) {
            setError('Not An Valid Email')
        }
        try {
            setIsLoading(true);
            await httpService.post("users/invite-beta-user", inviteForm, {
                headers: {
                    Authorization: `Bearer ${session ? session?.user?.access_token : ""}`,
                },
            });
            onFinish();
            handleClose();
            toast.success("New Beta User Created");
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
            toast.error(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Drawer.Root direction="bottom" open={open} onOpenChange={handleClose}>
            <div className="relative">
                <Drawer.Portal>
                    <Drawer.Overlay className="fixed inset-0 bg-black/40" />
                    <Drawer.Content className="left-[50%] -translate-x-[50%] top-0.5 bottom-2 fixed z-10 outline-none w-[800px] h-screen flex rounded-lg bg-zinc-50 border border-gray-400">
                        <div className="p-3 xl:p-5 space-y-4 w-full flex-1 flex flex-col justify-between gap-4">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center gap-2">
                                    <div className="flex justify-start items-end gap-4">
                                        <Drawer.Title className="grid place-content-center  text-black rounded-full">
                                            Invite User
                                        </Drawer.Title>
                                    </div>
                                    <div
                                        className="cursor-pointer"
                                        onClick={handleClose}
                                    >
                                        <Image
                                            src="/images/cross.svg"
                                            alt="arrow"
                                            width={18}
                                            height={18}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 max-h-[65vh] overflow-auto">
                                    {
                                        error &&
                                        <div className="flex items-center justify-center min-h-screen">
                                            <div className="text-red-500">Error: {error}</div>
                                        </div>
                                    }
                                    <div
                                        className="flex-1 overflow-y-auto space-y-4 max-w-3xl p-4"
                                    >
                                        <form
                                            onSubmit={handleSubmit}
                                            className="space-y-4 w-full max-w-[360px] mx-auto"
                                        >
                                            <div>
                                                <input
                                                    placeholder="First Name"
                                                    type="text"
                                                    required
                                                    disabled={isLoading}
                                                    value={inviteForm.firstName}
                                                    onChange={(e) => setInviteForm((prev) => ({ ...prev, firstName: e.target.value }))}
                                                    className="disabled:cursor-not-allowed mt-1 block w-full max-w-[360px] h-[45px] rounded-[10px] border border-neutral-400 px-4 py-3"
                                                />
                                            </div>
                                            <div>
                                                <input
                                                    placeholder="Invite User Email"
                                                    type="email"
                                                    required
                                                    disabled={isLoading}
                                                    value={inviteForm.email}
                                                    onChange={(e) => setInviteForm((prev) => ({ ...prev, email: e.target.value }))}
                                                    className="disabled:cursor-not-allowed mt-1 block w-full max-w-[360px] h-[45px] rounded-[10px] border border-neutral-400 px-4 py-3"
                                                />
                                            </div>
                                            {error && <p className="text-red-500 text-sm">{error}</p>}
                                            <button
                                                type="submit"
                                                disabled={!inviteForm.email || !inviteForm.firstName || isLoading}
                                                onClick={handleSubmit}
                                                className="disabled:cursor-not-allowed w-full max-w-[360px] h-[45px] bg-neutral-300 text-white px-4 py-3 rounded-[10px] hover:bg-black cursor-pointer"
                                            >
                                                Create Invite Link
                                            </button>
                                        </form>
                                        {/* Spacer div to maintain gap */}
                                        <div className="h-20 w-full"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-4">

                            </div>
                        </div>
                    </Drawer.Content>
                </Drawer.Portal>
            </div>
        </Drawer.Root>

    )
}
