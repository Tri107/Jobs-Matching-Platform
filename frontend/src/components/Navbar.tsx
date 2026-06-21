"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  HiOutlineBell,
  HiOutlineBars3,
  HiOutlineXMark,
  HiOutlineUserCircle,
  HiOutlineArrowRightOnRectangle,
  HiOutlineChevronDown,
} from "react-icons/hi2";
import { useState } from "react";
import { HiOutlineBell, HiOutlineBars3, HiOutlineXMark } from "react-icons/hi2";
import { useCurrentUserEmail } from "@/features/auth/hooks/useCurrentUserEmail";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { mockNotifications } from "@/mock/notifications";

const navLinks = [
  { label: "Tìm việc làm", href: "/jobs" },
  { label: "Phân tích CV", href: "/cv-analysis" },
  { label: "Lịch sử", href: "/matching" },
  { label: "Yêu thích", href: "/favorites" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const { userEmail } = useCurrentUserEmail();
  const { isLoggingOut, logoutError, handleLogout } = useLogout();

  const unreadCount = mockNotifications.filter((n) => !n.read).length;
  const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : "?";
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <span className="text-sm font-black text-white">▲</span>
          </div>
          <span className="text-lg font-extrabold text-slate-900">NOVA</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-blue-600"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 h-0.5 w-4/5 -translate-x-1/2 rounded-full bg-blue-600" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button
            type="button"
            className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
          >
            <HiOutlineBell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User dropdown — Desktop */}
          {userEmail && (
            <div className="relative hidden md:block" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-slate-50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                  {userInitial}
                </div>
                <span className="max-w-48 truncate text-sm font-medium text-slate-700">
                  {userEmail}
                </span>
                <HiOutlineChevronDown
                  className={`h-4 w-4 text-slate-400 transition-transform ${
                    userMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 animate-fadeIn rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl shadow-slate-200/50">
                  <Link
                    href="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-blue-600"
                  >
                    <HiOutlineUserCircle className="h-5 w-5 text-slate-400" />
                    Hồ sơ cá nhân
                  </Link>

                  <div className="my-1 border-t border-slate-100" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <HiOutlineArrowRightOnRectangle className="h-5 w-5" />
                    {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
                  </button>

                  {logoutError && (
                    <p className="px-4 py-2 text-xs font-medium text-red-500">
                      {logoutError}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-2 text-slate-500 md:hidden"
          >
            {mobileOpen ? (
              <HiOutlineXMark className="h-5 w-5" />
            ) : (
              <HiOutlineBars3 className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <nav className="border-t border-slate-100 bg-white px-4 py-3 md:hidden">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block rounded-lg px-3 py-2.5 text-sm font-medium ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          {userEmail && (
            <div className="mt-2 border-t border-slate-100 pt-3">
              <Link
                href="/profile"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                  {userInitial}
                </div>
                <span className="truncate">{userEmail}</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <HiOutlineArrowRightOnRectangle className="h-5 w-5" />
                {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
              </button>

              {logoutError && (
                <p className="mt-2 px-3 text-sm font-medium text-red-500">
                  {logoutError}
                </p>
              )}
            </div>
          )}
        </nav>
      )}
    </header>
  );
}
