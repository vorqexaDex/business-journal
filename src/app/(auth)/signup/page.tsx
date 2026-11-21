import { SignUpForm } from "@/modules/auth/components/signup-form";

export const metadata = { title: "Create account" };

export default function SignUpPage() {
  return (
    <>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Create your account</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Start tracking your sales, stock and profit.
        </p>
      </div>
      <SignUpForm />
    </>
  );
}
