"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

type AuthFormProps = {
  mode: "login" | "signup";
};

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

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
      // Handle signup
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}users/register`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, name, role: "user" }),
          }
        );

        if (res.ok) {
          // Automatically sign in after successful signup
          await signIn("credentials", {
            redirect: false,
            name,
            email,
            password,
            role: "user",
          });
          router.push("/login");
          router.refresh();
        } else {
          setError("Signup failed");
        }
      } catch (err) {
        console.log({ err });
        setError("An error occurred");
      }
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
            className="mt-1 block w-[360px] h-[45px] rounded-[10px] border border-[#A2A2A2] px-4 py-3 "
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
          className="mt-1 block w-[360px] h-[45px] rounded-[10px] border border-[#A2A2A2] px-4 py-3"
        />
      </div>
      <div>
        <input
          placeholder="Password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-[360px] h-[45px] rounded-[10px] border border-[#A2A2A2] px-4 py-3"
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        className="w-[360px] h-[45px] bg-[#BFBFBF] text-white px-4 py-3 rounded-[10px] hover:bg-black cursor-pointer"
      >
        Continue
      </button>
    </form>
  );
}
