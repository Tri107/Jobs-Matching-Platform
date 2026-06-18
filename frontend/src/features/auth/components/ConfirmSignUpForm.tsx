"use client";

import { type FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { confirmRegister } from "@/features/auth/services/cognitoAuthService";

export function ConfirmSignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setIsLoading(true);

    try {
      await confirmRegister(email, code);
      alert("Account verified");
      router.push("/login");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Confirm sign up failed";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow"
      >
        <h1 className="text-2xl font-bold text-slate-900">
          Xác nhận tài khoản
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Nhập mã xác nhận đã được gửi về email của bạn.
        </p>

        <label className="mt-6 block">
          <span className="mb-2 block text-sm font-medium text-slate-600">
            Email
          </span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#2d64ef]"
            placeholder="email@example.com"
          />
        </label>

        <label className="mt-4 block">
          <span className="mb-2 block text-sm font-medium text-slate-600">
            Mã xác nhận
          </span>
          <input
            type="text"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#2d64ef]"
            placeholder="Nhập mã xác nhận"
          />
        </label>

        {error && (
          <p className="mt-4 text-sm font-medium text-red-500">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="mt-6 h-12 w-full rounded-xl bg-[#2d64ef] text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading ? "Đang xác nhận..." : "Xác nhận"}
        </button>
      </form>
    </main>
  );
}