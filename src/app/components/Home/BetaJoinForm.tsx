"use client"

import { generateInviteLink } from '@/utils/helper';
import httpService from '@/utils/httpService';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { toast } from 'sonner';

const BetaJoinForm = () => {
    const router = useRouter();
    const [email, setEmail] = useState<string>("");
    const [name, setName] = useState<string>("");
    const [error, setError] = useState<string>("");

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateFields = (
        fields: { email: string; name?: string }
    ): string | null => {
        const { email, name } = fields;

        if (!email || !name) {
            return "Email & Name are required.";
        }

        if (!validateEmail(email)) {
            return "Please enter a valid email address.";
        }

        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        // Validate form fields
        const validationError = validateFields({ email, name });
        if (validationError) {
            setError(validationError);
            return;
        }
        try {
            const { data } = await httpService.post("users/invite-beta-user", {
                email,
                firstName: name
            });

            if (data.message) {
                toast.success(data.message)
            }

            if (data?.user) {
                const link = await generateInviteLink(data?.user?.email);
                router.replace(link);
                router.refresh();
            }
            if (data?.error) {
                setError("Invalid credentials");
            }

        } catch (err) {
            setError(err instanceof Error ? err?.message : "An error occurred");
        }
    };


    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            <div className='flex flex-col md:flex-row gap-4'>
                <div>
                    <input
                        placeholder="First Name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full md:max-w-[180px] h-[45px] rounded-[10px] border border-neutral-400 px-4 py-3"
                    />
                </div>
                <div>
                    <input
                        placeholder="Work Email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 block w-full md:max-w-[360px] min-w-[360px] h-[45px] rounded-[10px] border border-neutral-400 px-4 py-3"
                    />
                </div>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
                type="submit"
                className="w-full max-w-[175px] h-[45px]  text-white px-4 py-3 rounded-[10px] bg-black cursor-pointer"
            >
                Join!
            </button>
        </form>
    )
}

export default BetaJoinForm