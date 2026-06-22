"use client";

import { useEffect, useState } from "react";

import { getAuthUserDisplayName } from "@/features/auth/services/cognitoAuthService";

export function useCurrentUserEmail() {
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadCurrentUserEmail() {
      try {
        const displayName = await getAuthUserDisplayName();

        if (isMounted) {
          setUserEmail(displayName);
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
