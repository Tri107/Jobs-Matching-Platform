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
      },
    },
  });

  configured = true;
}