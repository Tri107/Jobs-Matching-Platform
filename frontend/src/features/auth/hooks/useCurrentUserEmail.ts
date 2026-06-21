"use client";

import { useEffect, useState } from "react";

import { getAuthUser } from "@/features/auth/services/cognitoAuthService";

export function useCurrentUserEmail() {
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadCurrentUserEmail() {
      try {
        const user = await getAuthUser();
        const loginId = user.signInDetails?.loginId ?? "";
        const username = user.username.includes("@") ? user.username : "";

        if (isMounted) {
          setUserEmail(loginId || username);
        }
      } catch {
        if (isMounted) {
          setUserEmail("");
        }
      }
    }

    void loadCurrentUserEmail();

    return () => {
      isMounted = false;
    };
  }, []);

  return { userEmail };
}
