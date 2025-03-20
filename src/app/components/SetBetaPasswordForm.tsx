
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import httpService from "@/utils/httpService";
import { AxiosError } from "axios";
import { toast } from "sonner";


export default function SetBetaPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams()
  const [newPassword, setNewPassword] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string>("");


  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateFields = (
    fields: { email: string; newPassword: string }
  ): string | null => {
    const { newPassword, email } = fields;


    if ((!email || !newPassword)) {
      return "Fields Can't be empty!";
    }

    if (!validateEmail(email)) {
      return "Please enter a valid email address.";
    }

    return null;
  };

  // API calls
  const resetUserPassword = async (email: string, newPassword: string) => {
    const res = await httpService.post("auth/set-beta-password", {
      email,
      password: newPassword,
    });

    return res.data;
  };

  // Main submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate form fields
    const validationError = validateFields({ newPassword, email });
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const result = await resetUserPassword(email, newPassword);
      if (result) {
        if (result.message) {
          toast.success(result.message);
        }
        router.push("/login");
        router.refresh();
      }

    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data.message || "An error occurred");
      } else {

        setError(err instanceof Error ? err?.message : "An error occurred");
      }
    }
  };

  useEffect(() => {
    const betaEmail = searchParams.get('beta-email')
    if (betaEmail) {
      setEmail(betaEmail);
    } else {
      router.replace("/");
      router.refresh();
    }
  }, [])

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 w-full max-w-[360px] mx-auto"
    >
      <div>
        <input
          placeholder="New Password"
          type="password"
          required
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
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
