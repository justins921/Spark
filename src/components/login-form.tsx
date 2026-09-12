"use client";

import { useActionState } from "react";
import { login } from "@/app/actions";

export function LoginForm() {
  const [error, formAction, pending] = useActionState(login, null);

  return (
    <form action={formAction} className="space-y-3">
      <input
        type="password"
        name="password"
        autoFocus
        autoComplete="current-password"
        placeholder="Password"
        className="w-full rounded-xl border border-line bg-panel-2 px-3 py-3 text-base text-text placeholder:text-muted/60 focus:border-accent focus:outline-none"
      />
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-accent py-3.5 text-base font-semibold text-ink active:opacity-90 disabled:opacity-60"
      >
        {pending ? "Checking…" : "Unlock"}
      </button>
      {error && <p className="text-sm text-bad">{error}</p>}
    </form>
  );
}
