"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus_Jakarta_Sans } from "next/font/google";
import { registerWithEmail } from "@/features/auth/services/cognitoAuthService";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
});

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-6 w-6" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.192 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.27 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917Z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691 12.88 19.51C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.27 4 24 4 16.318 4 9.656 8.337 6.306 14.691Z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.144 35.091 26.671 36 24 36c-5.171 0-9.626-3.329-11.291-7.957l-6.525 5.025C9.498 39.556 16.227 44 24 44Z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.05 12.05 0 0 1-4.084 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917Z"
      />
    </svg>
  );
}

const stats = [
  { value: "50k+", label: "Công việc" },
  { value: "98%", label: "Độ chính xác" },
  { value: "10k+", label: "Công ty" },
];

const benefits = [
  "Hồ sơ được AI gợi ý việc phù hợp",
  "Theo dõi trạng thái ứng tuyển dễ dàng",
  "Kết nối nhanh với nhà tuyển dụng uy tín",
];

export function RegisterForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setIsLoading(true);

    try {
      await registerWithEmail(email, password);
      router.push(`/confirm-signup?email=${encodeURIComponent(email)}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Register failed";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main
      className={`${plusJakartaSans.className} min-h-screen bg-[radial-gradient(circle_at_top,_#f8fbff,_#ecf2ff_55%,_#e3ebff)] px-4 py-6 text-slate-900 sm:px-6 lg:px-10 lg:py-8`}
    >
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-7xl overflow-hidden rounded-[28px] border border-[#c8d6ff] bg-white shadow-[0_28px_80px_rgba(66,99,235,0.18)]">
        <section className="relative hidden w-[47%] overflow-hidden bg-[linear-gradient(180deg,#3973ff_0%,#2858df_100%)] px-10 py-14 text-white lg:flex lg:flex-col">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.28),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(255,255,255,0.1),_transparent_28%)]" />
          <div className="relative z-10 max-w-sm">
            <p className="text-[2rem] font-extrabold tracking-[-0.03em]">
              AI Match
            </p>
            <p className="mt-4 text-sm leading-6 text-blue-100">
              Khám phá cơ hội nghề nghiệp tương lai với công nghệ trí tuệ nhân
              tạo. Kết nối hoàn hảo giữa ứng viên và nhà tuyển dụng.
            </p>
          </div>

          <div className="relative z-10 mt-12 overflow-hidden rounded-[18px] border border-white/12 bg-[#0f245f]/55 p-5 shadow-[0_18px_44px_rgba(6,18,55,0.4)] backdrop-blur-sm">
            <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_center,_rgba(55,202,255,0.38),_transparent_70%)]" />
            <div className="relative h-[300px] rounded-[14px] border border-cyan-400/10 bg-[linear-gradient(160deg,#102154_5%,#0b1c48_42%,#14396f_100%)] p-4">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(89,211,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(89,211,255,0.08)_1px,transparent_1px)] bg-[size:20px_20px]" />
              <div className="absolute left-8 top-8 h-20 w-20 rounded-full border border-cyan-300/40 shadow-[0_0_40px_rgba(53,223,255,0.4)]" />
              <div className="absolute left-16 top-16 h-36 w-36 rounded-full border border-cyan-300/20" />
              <div className="absolute right-8 top-10 flex gap-2">
                <span className="h-14 w-8 rounded-full bg-cyan-300/15" />
                <span className="h-20 w-8 rounded-full bg-cyan-300/20" />
                <span className="h-12 w-8 rounded-full bg-cyan-300/25" />
              </div>
              <div className="absolute bottom-0 left-1/2 h-[255px] w-[160px] -translate-x-1/2 rounded-t-[80px] bg-[linear-gradient(180deg,rgba(255,255,255,0.22),rgba(255,255,255,0.08))]" />
              <div className="absolute bottom-16 left-1/2 h-[110px] w-[110px] -translate-x-1/2 rounded-full border border-cyan-100/40 bg-[radial-gradient(circle,_rgba(102,231,255,0.45),_rgba(31,70,154,0.06)_60%,_transparent_72%)] shadow-[0_0_50px_rgba(82,244,255,0.35)]" />
              
            </div>
          </div>

          <div className="relative z-10 mt-auto grid grid-cols-3 gap-6 pt-10">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-[1.75rem] font-extrabold tracking-[-0.03em]">
                  {stat.value}
                </p>
                <p className="text-sm text-blue-100">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10 lg:px-16">
          <div className="w-full max-w-[430px]">
            <div className="mb-10 flex justify-center gap-10 text-lg font-semibold">
              <Link
                href="/login"
                className="relative pb-3 text-slate-500 transition-colors hover:text-slate-800"
              >
                Đăng Nhập
              </Link>
              <Link
                href="/register"
                className="relative pb-3 text-[#2d64ef] transition-colors"
              >
                Đăng Ký
                <span className="absolute bottom-0 left-1/2 h-0.5 w-[96px] -translate-x-1/2 rounded-full bg-[#2d64ef]" />
              </Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-xs font-medium text-slate-500">
                  Email
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="email@example.com"
                  className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm shadow-[0_2px_6px_rgba(15,23,42,0.03)] outline-none transition placeholder:text-slate-400 focus:border-[#2d64ef]"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs font-medium text-slate-500">
                    Mật khẩu
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Nhập mật khẩu"
                    className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm shadow-[0_2px_6px_rgba(15,23,42,0.03)] outline-none transition placeholder:text-slate-400 focus:border-[#2d64ef]"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-medium text-slate-500">
                    Xác nhận
                  </span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Nhập lại mật khẩu"
                    className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm shadow-[0_2px_6px_rgba(15,23,42,0.03)] outline-none transition placeholder:text-slate-400 focus:border-[#2d64ef]"
                  />
                </label>
              </div>

              <div className="mt-5 rounded-2xl border border-[#dbe5ff] bg-[#f6f9ff] p-4">
                <p className="text-sm font-semibold text-slate-800">
                  Tạo tài khoản để nhận:
                </p>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  {benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-2">
                      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#2d64ef]" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <label className="mt-5 flex items-start gap-3 text-sm text-slate-500">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-slate-300"
                />
                <span>
                  Tôi đồng ý với Điều khoản sử dụng và Chính sách bảo mật của AI
                  Match.
                </span>
              </label>

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
                {isLoading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
              </button>
            </form>

            <div className="my-7 flex items-center gap-3 text-xs text-slate-400">
              <span className="h-px flex-1 bg-slate-200" />
              <span>Hoặc tiếp tục với</span>
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

            <p className="mt-5 text-center text-sm text-slate-500">
              Đã có tài khoản?{" "}
              <Link href="/login" className="font-semibold text-[#2d64ef]">
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
