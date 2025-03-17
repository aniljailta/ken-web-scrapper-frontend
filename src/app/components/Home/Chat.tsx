"use client";
import { useConversation } from '@/providers/ConversationProvider';
import { ROLE_TYPE, initialSuggestions } from '@/utils/constant';
import httpService from '@/utils/httpService';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { MessageList } from '../Chat/MessageList';
import { StreamingChat } from '../Chat/StreamChat';
import { InputComponent } from '../InputComponent';
import SuggestionList from '../SuggestionList';
import { generateUrlParam, getGuestToken } from '@/utils/helper';

export const Chat = () => {

    const { data: sessionUser } = useSession();
    const router = useRouter();
    const [chatProgressing, setChatProgressing] = useState<boolean>(false);
    const { conversationState, setConversationState } = useConversation();
    const { messages, isLoadingRequest } = conversationState;

    const onSubmit = async (productQuestion: string, reset: () => void) => {
        if (!productQuestion || isLoadingRequest) return;

        try {
            setConversationState((prev) => ({
                ...prev,
                messages: [
                    ...prev.messages,
                    { role: ROLE_TYPE.USER, content: productQuestion, isFlag: false },
                ],
                isLoadingRequest: true,
            }));

            setChatProgressing(true);

            const guestToken = getGuestToken()
            let token = null;

            if (guestToken && !sessionUser?.user) {
                token = generateUrlParam('token', guestToken);
            }

            const res = await httpService.post(
                `conversation/chat?${token ? token : ''}`,
                { question: productQuestion },
                {
                    headers: {
                        Authorization: `Bearer ${sessionUser ? sessionUser.user.access_token : ""
                            }`,
                    },
                }
            );

            const responseData = await res.data;

            setChatProgressing(false);
            reset(); // Reset form after submission

            if (responseData.data) {
                if (responseData?.conversationId) {
                    // Perform the redirect only after the typing effect finishes
                    setConversationState((prev) => ({
                        ...prev,
                        conversationId: responseData.conversationId
                    }));
                    router.push(`/search/${responseData?.conversationId}`);
                }
                setConversationState((prev) => ({
                    ...prev,
                    messages: [...prev.messages, { role: ROLE_TYPE.ASSISTANT, content: "", isFlag: false }],
                }));
                setConversationState((prev) => ({
                    ...prev,
                    messages: prev.messages.map((msg, i) =>
                        i === prev.messages.length - 1 && msg.role === ROLE_TYPE.ASSISTANT
                            ? { ...msg, content: responseData.data }
                            : msg
                    ),
                }));

            } else {
                setConversationState((prev) => ({
                    ...prev,
                    messages: [
                        ...prev.messages,
                        {
                            role: ROLE_TYPE.ASSISTANT,
                            content: responseData.message || "No response received",
                            isFlag: false
                        },
                    ],
                }));
            }
        } catch (err) {
            console.error(err);
            setConversationState((prev) => ({
                ...prev,
                messages: [
                    ...prev.messages,
                    { role: ROLE_TYPE.ASSISTANT, content: "Something went wrong.", isFlag: false },
                ],
            }));
        } finally {
            setConversationState((prev) => ({
                ...prev,
                isLoadingRequest: false,
            }));
        }
    };
    return (
        <div className="w-full h-full max-w-xl space-y-8">
            {messages.length === 0 && (
                <div className="space-y-9">
                    <h1 className="text-center text-3xl text-[32px] font-medium tracking-tight text-gray-900">
                        What can I help you find?
                    </h1>
                    <SuggestionList
                        suggestionList={initialSuggestions}
                        onSelect={(question) => onSubmit(question, () => { })}
                    />
                    <InputComponent onSubmit={onSubmit} />
                </div>
            )}

            {messages.length > 0 && (
                <div className="flex flex-col h-full">
                    <div className="flex-1 space-y-4 max-w-3xl">
                        <MessageList data={messages} />
                        {
                            chatProgressing &&
                            <StreamingChat />
                        }
                    </div>
                    <div className="mt-4">
                        <InputComponent onSubmit={onSubmit} />
                    </div>
                </div>
            )}
        </div>
    )
}
