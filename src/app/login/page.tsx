import { LoginForm } from "@/components/login-form";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Spark Tracker</h1>
      <p className="mt-1 mb-6 text-sm text-muted">Enter the password.</p>
      <LoginForm />
    </main>
  );
}
