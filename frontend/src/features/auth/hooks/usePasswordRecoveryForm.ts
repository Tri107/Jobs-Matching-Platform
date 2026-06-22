"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import {
  confirmPasswordReset,
  requestPasswordReset,
} from "@/features/auth/services/cognitoAuthService";

type PasswordRecoveryStep = "request-code" | "confirm-reset";

export function usePasswordRecoveryForm() {
  const router = useRouter();

  const [step, setStep] = useState<PasswordRecoveryStep>("request-code");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleRequestCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Email không được để trống.");
      return;
    }

    setIsLoading(true);

    try {
      await requestPasswordReset(email.trim());
      setMessage("Mã đặt lại mật khẩu đã được gửi đến email của bạn.");
      setStep("confirm-reset");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Không thể gửi mã đặt lại mật khẩu.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleConfirmReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Email không được để trống.");
      return;
    }

    if (!code.trim()) {
      setError("Mã xác nhận không được để trống.");
      return;
    }

    if (!newPassword) {
      setError("Mật khẩu mới không được để trống.");
      return;
    }

    if (!confirmNewPassword) {
      setError("Xác nhận mật khẩu mới không được để trống.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError("Mật khẩu mới và xác nhận mật khẩu không trùng nhau.");
      return;
    }

    setIsLoading(true);

    try {
      await confirmPasswordReset(email.trim(), code.trim(), newPassword);
      router.push("/login");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Không thể đặt lại mật khẩu.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return {
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
  };
}
