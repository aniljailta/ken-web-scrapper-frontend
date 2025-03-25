"use client"
import Link from 'next/link'
import React, { Suspense } from 'react'
import Image from "next/image";
import SetBetaPasswordForm from '../components/SetBetaPasswordForm';
import { LoadingSvg } from '@/svg';

const SetBetaPassword = () => {
    return (
        <div className="flex min-h-[78vh] flex-col items-center justify-center">
            <div className="w-full max-w-md space-y-8 py-12 px-4 sm:px-6 lg:px-8 relative">
                <Link href={"/"} passHref>
                    <div className="absolute top-1 right-1 cursor-pointer">
                        <Image src="/images/cross.svg" alt="arrow" width={24} height={24} />
                    </div>
                </Link>
                <div>
                    <h2 className="text-left text-2xl font-medium tracking-tight text-gray-900">
                        <span className='block'>
                            Welcome!
                        </span>
                        Let&apos;s setup your Password!
                    </h2>
                </div>
                <Suspense fallback={<LoadingSvg />}>
                    <SetBetaPasswordForm />
                </Suspense>
            </div>
        </div >
    )
}

export default SetBetaPassword