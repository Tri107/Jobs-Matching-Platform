import {
  signUp,
  confirmSignUp,
  signIn,
  signOut,
  getCurrentUser,
  fetchAuthSession,
  resetPassword,
  confirmResetPassword,
} from "aws-amplify/auth";

import { configureAmplify } from "@/lib/amplifyClient";

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

export async function getIdToken() {
  configureAmplify();

  const session = await fetchAuthSession();
  return session.tokens?.idToken?.toString();
}
