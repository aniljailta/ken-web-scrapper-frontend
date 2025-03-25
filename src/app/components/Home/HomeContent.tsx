"use client"
import React from 'react'
import { BetaJoin } from './BetaJoin'
import { Chat } from './Chat'
import { useSession } from 'next-auth/react'
import { LoadingSvg } from '@/svg'

export const HomeContent = () => {
    const { status, data } = useSession()

    if (status === 'loading') {
        return <div
            className="p-4 w-full text-gray-900 mr-auto rounded-lg flex justify-center items-center gap-2"
        >
            <span className="animate-pulse">Loading</span>
            <LoadingSvg />
        </div>
    }

    return (
        <>
            {
                data ?
                    <Chat /> :
                    <BetaJoin />
            }
        </>
    )
}
