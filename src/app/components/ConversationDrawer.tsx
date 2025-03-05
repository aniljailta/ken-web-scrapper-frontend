"use client";
import { Message, useConversation } from '@/providers/ConversationProvider';
import { Drawer } from 'vaul';
import Image from "next/image";
import httpService from '@/utils/httpService';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { LoadingSvg } from '@/svg';
import MarkdownText from './Markdown';
import { ROLE_TYPE } from '@/utils/constant';
import { formatDate } from '@/utils/tableComponents';

export type ConversationState = {
    messages: Message[];
    conversationId: string;
    isGuest: boolean;
    name: string;
    createdAt: string;
};

export const ConversationDrawer = () => {
    const { adminChatPanel, setAdminChatPanel } = useConversation();
    const { data: session } = useSession();
    const { conversationId, open } = adminChatPanel;
    const [conversationState, setConversationState] = useState<ConversationState>(
        {
            messages: [],
            conversationId: "",
            name: '',
            isGuest: false,
            createdAt: ''
        }
    );
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");

    const handleClose = () => {
        setAdminChatPanel({ conversationId: null, open: false })
        setConversationState(
            {
                messages: [],
                conversationId: "",
                name: '',
                isGuest: false,
                createdAt: ''
            });
    }

    const fetchConversationById = async (chatId: string) => {
        try {
            setIsLoading(true);
            setError('');
            const response = await httpService.get(
                `/conversation/chat/${chatId}`,
                {
                    headers: {
                        Authorization: `Bearer ${session ? session?.user?.access_token : ""
                            }`,
                    },
                }
            );


            const { data } = await response.data;

            const mappedData = {
                name: data.productName,
                messages: data.messages,
                conversationId: data.id,
                isGuest: data.isGuest,
                createdAt: data.createdAt,
            }

            setConversationState(mappedData);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (open && conversationId) {
            fetchConversationById(conversationId);

        }
    }, [session, conversationId]);

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
                                            {conversationState.name ? conversationState.name : "Conversation"}
                                            {
                                                conversationState.createdAt &&
                                                <div className='text-black text-xs font-bold mt-2 ml-2'>
                                                    {formatDate(conversationState.createdAt)}
                                                </div>

                                            }
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
                                <div className="space-y-2 max-h-[85vh] overflow-auto">
                                    {
                                        isLoading &&
                                        <div className="p-4 bg-gray-100 text-gray-900 mr-auto rounded-lg flex items-center gap-2">
                                            <span className="animate-pulse">Loading Conversation</span>
                                            <LoadingSvg />
                                        </div>

                                    }
                                    {
                                        error &&
                                        <div className="flex items-center justify-center min-h-screen">
                                            <div className="text-red-500">Error: {error}</div>
                                        </div>
                                    }
                                    <div
                                        // ref={messageContainerRef}
                                        className="flex-1 overflow-y-auto space-y-4 max-w-3xl p-4"
                                    >
                                        {conversationState.messages.map((message, index) => (
                                            <div
                                                key={index}
                                                className={`p-4 rounded-lg break-words  text-black/75 ${(message.role === ROLE_TYPE.USER || message.role === ROLE_TYPE.BETA)
                                                    ? "text-xl font-normal"
                                                    : "text-base font-light"
                                                    }`}
                                            >
                                                <MarkdownText text={message.content} />

                                                {(message.role !== ROLE_TYPE.USER && message.role !== ROLE_TYPE.BETA) && (
                                                    <div className="flex gap-8 mt-4 cursor-pointer">

                                                    </div>
                                                )}
                                            </div>
                                        ))}
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
