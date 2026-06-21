"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus_Jakarta_Sans } from "next/font/google";

import { AuthBrandPanel } from "@/features/auth/components/AuthBrandPanel";
import { EyeIcon, GoogleIcon, MailIcon } from "@/features/auth/components/AuthIcons";
import { AuthTextField } from "@/features/auth/components/AuthTextField";
import { useLoginForm } from "@/features/auth/hooks/useLoginForm";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
});

export function LoginForm() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const {
    email,
    password,
    isLoading,
    error,
    setEmail,
    setPassword,
    handleSubmit,
  } = useLoginForm();

  return (
    <main
      className={`${plusJakartaSans.className} min-h-screen bg-[radial-gradient(circle_at_top,_#f8fbff,_#ecf2ff_55%,_#e3ebff)] px-4 py-6 text-slate-900 sm:px-6 lg:px-10 lg:py-8`}
    >
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-7xl overflow-hidden rounded-[28px] border border-[#c8d6ff] bg-white shadow-[0_28px_80px_rgba(66,99,235,0.18)]">
        <AuthBrandPanel />

        <section className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10 lg:px-16">
          <div className="w-full max-w-[430px]">
            <div className="mb-10 flex justify-center gap-10 text-lg font-semibold">
              <Link
                href="/login"
                className="relative pb-3 text-[#2d64ef] transition-colors"
              >
                Đăng Nhập
                <span className="absolute bottom-0 left-1/2 h-0.5 w-[120px] -translate-x-1/2 rounded-full bg-[#2d64ef]" />
              </Link>
              <Link
                href="/register"
                className="relative pb-3 text-slate-500 transition-colors hover:text-slate-800"
              >
                Đăng Ký
              </Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AuthTextField
                label="Email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="email@example.com"
                icon={<MailIcon />}
              />

              <AuthTextField
                label="Mật khẩu"
                type={isPasswordVisible ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                icon={
                  <button
                    type="button"
                    aria-label={
                      isPasswordVisible ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                    }
                    aria-pressed={isPasswordVisible}
                    className="-mr-1 rounded-md p-1 transition hover:bg-slate-100 hover:text-slate-600"
                    onClick={() =>
                      setIsPasswordVisible((currentValue) => !currentValue)
                    }
                  >
                    <EyeIcon />
                  </button>
                }
              />

              <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  Lưu tài khoản
                </label>
                <a href="#" className="font-medium text-[#2d64ef] hover:text-[#214fc9]">
                  Quên mật khẩu?
                </a>
              </div>

              {error && (
                <p className="mt-3 text-sm font-medium text-red-500">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="mt-5 h-12 w-full rounded-xl bg-[linear-gradient(180deg,#3f74f6,#2f63e8)] text-sm font-semibold text-white shadow-[0_12px_24px_rgba(47,99,232,0.28)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? "Đang đăng nhập..." : "Đăng nhập ngay"}
              </button>
            </form>

            <div className="my-7 flex items-center gap-3 text-xs text-slate-400">
              <span className="h-px flex-1 bg-slate-200" />
              <span>Hoặc đăng nhập với</span>
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            <button
              type="button"
              onClick={() => alert("Google login will be added later")}
              className="flex h-16 w-full items-center justify-center gap-4 rounded-2xl border border-slate-200 bg-white px-6 text-[1.05rem] font-semibold text-slate-700 shadow-[0_8px_20px_rgba(15,23,42,0.05)] transition hover:border-slate-300 hover:bg-slate-50"
            >
              <GoogleIcon />
              <span>Tiếp tục với Google</span>
            </button>

            <div className="mt-8 text-center text-xs text-slate-400">
              <p>&copy; 2024 AI Match Platform. Bảo lưu mọi quyền.</p>
              <div className="mt-3 flex justify-center gap-5">
                <a href="#" className="hover:text-slate-600">
                  Trợ giúp
                </a>
                <a href="#" className="hover:text-slate-600">
                  Bảo mật
                </a>
                <a href="#" className="hover:text-slate-600">
                  Điều khoản
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
