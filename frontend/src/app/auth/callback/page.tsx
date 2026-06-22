"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { getAuthUser } from "@/features/auth/services/cognitoAuthService";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    async function handleCallback() {
      try {
        await getAuthUser();
        router.replace("/");
      } catch {
        setError("Không thể hoàn tất đăng nhập Google. Vui lòng thử lại.");
      }
    }

    handleCallback();
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-slate-900">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        {error ? (
          <>
            <h1 className="text-xl font-semibold">Đăng nhập thất bại</h1>
            <p className="mt-3 text-sm text-slate-600">{error}</p>
            <Link
              href="/login"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[#2d64ef] px-5 text-sm font-semibold text-white transition hover:bg-[#214fc9]"
            >
              Quay lại đăng nhập
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold">Đang hoàn tất đăng nhập...</h1>
            <p className="mt-3 text-sm text-slate-600">
              Vui lòng chờ trong giây lát.
            </p>
          </>
        )}
      </section>
    </main>
  );
}
