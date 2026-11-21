import { LoginForm } from "@/modules/auth/components/login-form";

export const metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Log in to your business journal.
        </p>
      </div>
      <LoginForm />
    </>
  );
}
