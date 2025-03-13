import { useSocket } from "@/providers/SocketProvider";
import { useState, useEffect } from "react";
import { ChatStreamChunk } from "./type";
import MarkdownText from "../Markdown";
import { LoadingSvg } from "@/svg";


export const StreamingChat = () => {
    const [message, setMessage] = useState("");
    const { socket } = useSocket()

    useEffect(() => {
        if (socket) {

            socket.on("stream-chat", ({ message }: ChatStreamChunk) => {
                if (message?.finish_reason !== 'stop') {
                    setMessage((prev) => prev + message?.delta?.content || '');
                }
            });


            return () => {
                socket.off("stream-chat");
            };

        }
    }, []);

    return (
        <>
            {
                message ?
                    <div className="p-4 rounded-lg break-words text-black/75 text-base font-light">
                        <MarkdownText text={message || 'Waiting for Response'} />
                    </div> :
                    <div
                        className="p-4 bg-gray-100 text-gray-900 mr-auto rounded-lg flex items-center gap-2"
                    >
                        <span className="animate-pulse">Retrieving PID</span>
                        <LoadingSvg />
                    </div>
            }

        </>
    );
};

