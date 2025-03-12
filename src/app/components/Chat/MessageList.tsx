import { ThumbsUp, ThumbsDown } from '@/svg'
import { ROLE_TYPE } from '@/utils/constant'
import React from 'react'
import MarkdownText from '../Markdown'
import { ReportChat } from '../ReportChat'
import { Message } from '@/providers/ConversationProvider'

interface MessageListProps {
    data: Message[];
    hideControls?: boolean;
    handleReaction?: (values: { messageId: string; newStatus: boolean | null; }) => void;
}

export const MessageList: React.FC<MessageListProps> = ({ data, handleReaction, hideControls = false }) => {

    return (
        <>
            {data.map((message, index) => (
                <div
                    key={index}
                    className={`p-4 rounded-lg break-words  text-black/75 ${message.role === ROLE_TYPE.USER
                        ? "text-xl font-normal"
                        : "text-base font-light"
                        }`}
                >
                    <MarkdownText text={message.content} />
                    {message.role !== ROLE_TYPE.USER && (
                        <>
                            <div className="flex gap-4 mt-4 items-center justify-start">
                                {
                                    !hideControls &&
                                    <div className="flex gap-8 cursor-pointer">
                                        {/* Like Button */}
                                        <div
                                            onClick={() => {
                                                if (handleReaction) {

                                                    handleReaction({
                                                        messageId: message?.id || "",
                                                        newStatus:
                                                            message.reactionStatus === true ? null : true,
                                                    })

                                                }

                                            }
                                            }
                                        >
                                            <ThumbsUp
                                                isActive={Boolean(message.reactionStatus)}
                                            />
                                        </div>

                                        {/* Dislike Button */}
                                        <div
                                            onClick={() => {
                                                if (handleReaction) {
                                                    handleReaction({
                                                        messageId: message?.id || "",
                                                        newStatus:
                                                            message.reactionStatus === false ? null : false,
                                                    })
                                                }
                                            }
                                            }
                                        >
                                            <ThumbsDown
                                                isActive={message.reactionStatus === false}
                                            />
                                        </div>
                                    </div>
                                }
                                <ReportChat isFlag={message.isFlag} messageId={message?.id || ''} />
                            </div>

                        </>
                    )}
                </div>
            ))}
        </>
    )
}
