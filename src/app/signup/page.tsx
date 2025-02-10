"use client";
import Link from "next/link";
import AuthForm from "../components/AuthForm";
import Image from "next/image";

export default function SignupPage() {
  return (
    <div className="flex min-h-[78vh] flex-col items-center justify-center ">
      <div className="w-full max-w-md space-y-8 py-12 px-4 sm:px-6 lg:px-8 relative">
        <Link href={"/"} passHref>
          <div className="absolute top-1 right-1 cursor-pointer">
            <Image src="/images/cross.svg" alt="arrow" width={24} height={24} />
          </div>
        </Link>
        <div>
          <h2 className="text-center text-2xl font-medium tracking-tight text-gray-900">
            Create an account
          </h2>
        </div>
        <AuthForm mode="signup" />

        <div>
          <p className="text-sm text-center font-light">
            Already have an account?{" "}
            <Link passHref href="/login">
              {" "}
              <span className="cursor-pointer text-indigo-700/75">Login</span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
