"use client";

import { type FormEvent, useState } from "react";

import { loginWithEmail } from "@/features/auth/services/cognitoAuthService";

export function useLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setIsLoading(true);

    try {
      await loginWithEmail(email, password);
      alert("Login success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return {
    email,
    password,
    isLoading,
    error,
    setEmail,
    setPassword,
    handleSubmit,
  };
}
