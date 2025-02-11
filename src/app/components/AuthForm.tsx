"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import httpService from "@/utils/httpService";
import { ROLE_TYPE } from "@/utils/constant";

type AuthFormProps = {
  mode: "login" | "signup";
};

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateFields = (
    mode: "login" | "signup",
    fields: { email: string; password: string; name?: string }
  ): string | null => {
    const { email, password, name } = fields;

    if (mode === "login" && (!email || !password)) {
      return "Email and password are required.";
    }

    if (mode === "signup" && (!name || !email || !password)) {
      return "Name, email, and password are required.";
    }

    if (!validateEmail(email)) {
      return "Please enter a valid email address.";
    }

    return null;
  };

  // API calls
  const signupUser = async (email: string, password: string, name: string) => {
    const res = await httpService.post("users/register", {
      email,
      password,
      name,
      role: ROLE_TYPE.USER,
    });

    if (!res) {
      throw new Error("Invalid credentials");
    }

    const data = await res.data;
    if (!data) {
      throw new Error("Invalid response from server");
    }

    return data;
  };

  // Main submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate form fields
    const validationError = validateFields(mode, { email, password, name });
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      if (mode === "login") {
        const result = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });
        if (result?.error) {
          setError("Invalid credentials");
        } else {
          router.push("/");
          router.refresh();
        }
      } else {
        const data = await signupUser(email, password, name);

        if (!data.user) {
          setError(data?.message || "An error occurred");
          throw new Error(data?.message);
        } else {
          const result = await signIn("credentials", {
            redirect: false,
            email,
            password,
          });

          if (result?.error) {
            setError("Invalid credentials");
          } else {
            router.push("/");
            router.refresh();
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err?.message : "An error occurred");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 w-full max-w-[360px] mx-auto"
    >
      {mode === "signup" && (
        <div>
          <input
            placeholder="Full Name"
            type="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full max-w-[360px] h-[45px] rounded-[10px] border border-neutral-400 px-4 py-3 "
          />
        </div>
      )}
      <div>
        <input
          placeholder="Work Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full max-w-[360px] h-[45px] rounded-[10px] border border-neutral-400 px-4 py-3"
        />
      </div>
      <div>
        <input
          placeholder="Password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full max-w-[360px] h-[45px] rounded-[10px] border border-neutral-400 px-4 py-3"
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        className="w-full max-w-[360px] h-[45px] bg-neutral-300 text-white px-4 py-3 rounded-[10px] hover:bg-black cursor-pointer"
      >
        Continue
      </button>
    </form>
  );
}
