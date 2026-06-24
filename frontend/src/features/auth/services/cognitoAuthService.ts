import {
  signUp,
  confirmSignUp,
  signIn,
  signOut,
  getCurrentUser,
  fetchAuthSession,
  fetchUserAttributes,
  resetPassword,
  confirmResetPassword,
  signInWithRedirect,
  updateUserAttributes,
} from "aws-amplify/auth";

import { configureAmplify } from "@/lib/amplifyClient";

function getStringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

export async function registerWithEmail(email: string, password: string) {
  configureAmplify();

  return signUp({
    username: email,
    password,
    options: {
      userAttributes: {
        email,
      },
    },
  });
}

export async function confirmRegister(email: string, code: string) {
  configureAmplify();

  return confirmSignUp({
    username: email,
    confirmationCode: code,
  });
}

export async function loginWithEmail(email: string, password: string) {
  configureAmplify();

  return signIn({
    username: email,
    password,
  });
}

export async function loginWithGoogle() {
  configureAmplify();

  return signInWithRedirect({
    provider: "Google",
  });
}

export async function requestPasswordReset(email: string) {
  configureAmplify();

  return resetPassword({
    username: email,
  });
}

export async function confirmPasswordReset(
  email: string,
  code: string,
  newPassword: string
) {
  configureAmplify();

  return confirmResetPassword({
    username: email,
    confirmationCode: code,
    newPassword,
  });
}

export async function logout() {
  configureAmplify();

  return signOut();
}

export async function getAuthUser() {
  configureAmplify();

  return getCurrentUser();
}

export async function getAuthUserDisplayName() {
  configureAmplify();

  const user = await getCurrentUser();
  let attributes: Awaited<ReturnType<typeof fetchUserAttributes>> = {};
  let idTokenPayload: Record<string, unknown> = {};

  try {
    attributes = await fetchUserAttributes();
  } catch {
    attributes = {};
  }

  try {
    const session = await fetchAuthSession();
    idTokenPayload = session.tokens?.idToken?.payload ?? {};
  } catch {
    idTokenPayload = {};
  }

  const loginId = user.signInDetails?.loginId ?? "";
  const username = user.username ?? "";
  const emailUsername = username.includes("@") ? username : "";
  const federatedUsername = username ? username.replace(/^[^_]+_/, "") : "";

  return (
    attributes.name ||
    attributes.email ||
    getStringValue(idTokenPayload.name) ||
    getStringValue(idTokenPayload.email) ||
    loginId ||
    emailUsername ||
    federatedUsername ||
    "Tài khoản"
  );
}

export type AuthUserProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

export async function getAuthUserProfile(): Promise<AuthUserProfile> {
  configureAmplify();

  const user = await getCurrentUser();
  const attributes = await fetchUserAttributes();
  const loginId = user.signInDetails?.loginId ?? "";
  const username = user.username ?? "";
  const email =
    attributes.email ||
    loginId ||
    (username.includes("@") ? username : "");

  return {
    id: user.userId || username,
    name: attributes.name || email || username || "Tài khoản",
    email,
    phone: attributes.phone_number || "",
  };
}

export async function updateAuthUserProfile(profile: {
  name: string;
  phone?: string;
}) {
  configureAmplify();

  const userAttributes: Record<string, string> = {
    name: profile.name,
  };

  if (profile.phone) {
    userAttributes.phone_number = profile.phone;
  }

  return updateUserAttributes({
    userAttributes,
  });
}

export async function getIdToken() {
  configureAmplify();

  const session = await fetchAuthSession();
  return session.tokens?.idToken?.toString();
}
