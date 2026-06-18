import { Suspense } from "react";
import { ConfirmSignUpForm } from "@/features/auth/components/ConfirmSignUpForm";

export default function ConfirmSignUpPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConfirmSignUpForm />
    </Suspense>
  );
}