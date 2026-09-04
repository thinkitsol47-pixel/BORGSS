import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Reset your password",
  description: "Request a link to set a new BORJSS password.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <ForgotPasswordForm />;
}
