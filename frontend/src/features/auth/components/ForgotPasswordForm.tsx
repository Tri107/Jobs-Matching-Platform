"use client";

import Link from "next/link";
import { Plus_Jakarta_Sans } from "next/font/google";

import { AuthTextField } from "@/features/auth/components/AuthTextField";
import { usePasswordRecoveryForm } from "@/features/auth/hooks/usePasswordRecoveryForm";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
});

export function ForgotPasswordForm() {
  const {
    step,
    email,
    code,
    newPassword,
    confirmNewPassword,
    isLoading,
    error,
    message,
    setEmail,
    setCode,
    setNewPassword,
    setConfirmNewPassword,
    handleRequestCode,
    handleConfirmReset,
  } = usePasswordRecoveryForm();

  const isRequestStep = step === "request-code";

  return (
    <main
      className={`${plusJakartaSans.className} flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#f8fbff,_#ecf2ff_55%,_#e3ebff)] px-4 py-8 text-slate-900`}
    >
      <section className="w-full max-w-md rounded-[28px] border border-[#c8d6ff] bg-white p-8 shadow-[0_28px_80px_rgba(66,99,235,0.18)]">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2d64ef]">
            AI Match
          </p>
          <h1 className="mt-3 text-2xl font-extrabold text-slate-900">
            Khôi phục mật khẩu
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            {isRequestStep
              ? "Nhập email đã đăng ký để nhận mã đặt lại mật khẩu."
              : "Nhập mã xác nhận và mật khẩu mới để hoàn tất đặt lại mật khẩu."}
          </p>
        </div>

        {isRequestStep ? (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <AuthTextField
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="email@example.com"
            />

            {error && (
              <p className="text-sm font-medium text-red-500">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="h-12 w-full rounded-xl bg-[linear-gradient(180deg,#3f74f6,#2f63e8)] text-sm font-semibold text-white shadow-[0_12px_24px_rgba(47,99,232,0.28)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? "Đang gửi mã..." : "Gửi mã đặt lại mật khẩu"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleConfirmReset} className="space-y-4">
            {message && (
              <p className="rounded-xl bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
                {message}
              </p>
            )}

            <AuthTextField
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="email@example.com"
            />

            <AuthTextField
              label="Mã xác nhận"
              type="text"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="Nhập mã xác nhận"
            />

            <AuthTextField
              label="Mật khẩu mới"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="Nhập mật khẩu mới"
            />

            <AuthTextField
              label="Xác nhận mật khẩu mới"
              type="password"
              value={confirmNewPassword}
              onChange={(event) => setConfirmNewPassword(event.target.value)}
              placeholder="Nhập lại mật khẩu mới"
            />

            <p className="text-xs leading-5 text-slate-500">
              Mật khẩu cần ít nhất 8 ký tự, gồm chữ hoa, chữ thường và số.
            </p>

            {error && (
              <p className="text-sm font-medium text-red-500">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="h-12 w-full rounded-xl bg-[linear-gradient(180deg,#3f74f6,#2f63e8)] text-sm font-semibold text-white shadow-[0_12px_24px_rgba(47,99,232,0.28)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? "Đang đặt lại mật khẩu..." : "Đặt lại mật khẩu"}
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-sm">
          <Link href="/login" className="font-semibold text-[#2d64ef]">
            Quay lại đăng nhập
          </Link>
        </div>
      </section>
    </main>
  );
}
