import React from 'react'
import BetaJoinForm from './BetaJoinForm'

export const BetaJoin = () => {
    return (
        <div className='space-y-7 py-4'>
            <div className='space-y-6'>
                <h2 className='font-medium text-[32px] tracking-[0.25px] leading-12'>
                    Find hardware replacements
                    <br />
                    in seconds,not hours.
                </h2>
                <p className='font-light text-[20px] tracking-[0.25px] leading-12'>
                    Instant answers for part replacements, EOL status, and upgrade paths
                    <br />
                    without the PDFs, guesswork, or chasing reps.
                </p>

            </div>
            <div className="space-y-2">
                <p className='font-light text-[20px] tracking-[0.25px] leading-12'>
                    Join the early access Beta.
                </p>
                <BetaJoinForm />
            </div>
        </div>
    )
}
