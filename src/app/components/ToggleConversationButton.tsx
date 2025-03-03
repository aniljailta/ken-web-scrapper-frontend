"use client";
import { useConversation } from '@/providers/ConversationProvider';
import React from 'react'

export const ToggleConversationButton = ({ conversationId }: {
    conversationId: string
}) => {
    const { setAdminChatPanel } = useConversation();
    return (
        <button
            onClick={() => {
                setAdminChatPanel({
                    open: true,
                    conversationId
                })
            }}
            className="bg-gray-300 px-3 py-1 rounded disabled:opacity-50 cursor-pointer"
        >
            View Chat
        </button>
    )
}

