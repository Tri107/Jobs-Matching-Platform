"use client";

import { Amplify } from "aws-amplify";

let configured = false;

export function configureAmplify() {
  if (configured) return;

  const region = process.env.NEXT_PUBLIC_AWS_REGION;
  const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
  const userPoolClientId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID;

  if (!region || !userPoolId || !userPoolClientId) {
    throw new Error("Missing Cognito environment variables");
  }

  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId,
        userPoolClientId,
        loginWith: {
          email: true,
          oauth: {
            domain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN ?? "",
            scopes: ["openid", "email", "profile", "aws.cognito.signin.user.admin"],
            redirectSignIn: [
              process.env.NEXT_PUBLIC_COGNITO_REDIRECT_SIGN_IN ??
                "http://localhost:3000/auth/callback",
            ],
            redirectSignOut: [
              process.env.NEXT_PUBLIC_COGNITO_REDIRECT_SIGN_OUT ??
                "http://localhost:3000/login",
            ],
            responseType: "code",
          },
        },
      },
    },
  });

  configured = true;
}
