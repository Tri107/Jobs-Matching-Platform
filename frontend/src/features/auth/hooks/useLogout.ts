"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { logout } from "@/features/auth/services/cognitoAuthService";

export function useLogout() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  async function handleLogout() {
    setLogoutError("");
    setIsLoggingOut(true);

    try {
      await logout();
      router.push("/login");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Logout failed";
      setLogoutError(message);
      alert(message);
    } finally {
      setIsLoggingOut(false);
    }
  }

  return {
    isLoggingOut,
    logoutError,
    handleLogout,
  };
}
