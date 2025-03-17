"use client";

import { generateUniqueId, getGuestToken, setGuestToken } from "@/utils/helper";
import { useSession } from "next-auth/react";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;

interface SocketContextType {
    socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export const SocketProvider = ({ children }: { children: ReactNode }) => {
    const { data, status } = useSession()
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        if (status !== 'loading') {

            let userID = data?.user?.id ?? getGuestToken();

            if (!userID) {
                userID = generateUniqueId();
                setGuestToken(userID);
            }


            const socketInstance = io(SOCKET_URL, {
                path: "/socket",
                query: {
                    userID
                },
                transports: ['websocket'],

            });

            socketInstance.on("connect", () => {
                console.log("Connected to WebSocket:", socketInstance.id);
            });
            setSocket(socketInstance);

            return () => {
                socketInstance.disconnect();

            };

        }

    }, [data]);

    return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>;
};

export const useSocket = () => useContext(SocketContext);
