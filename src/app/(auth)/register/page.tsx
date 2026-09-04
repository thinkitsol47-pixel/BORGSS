import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create an account",
  description:
    "Create a BORJSS account to submit manuscripts, review for the journal, or both.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <RegisterForm />;
}
