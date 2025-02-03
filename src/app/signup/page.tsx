import Link from "next/link";
import AuthForm from "../components/AuthForm";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
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
              <span className="cursor-pointer text-[#0000FF]">Login</span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
