import { UserPlus } from "lucide-react";
import { signInAction, signUpAction } from "@/app/actions";
import { Button, Card, Field, inputClass } from "./ui";

export function AuthForm({
  mode,
  error
}: {
  mode: "login" | "signup";
  error?: string;
}) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center">
      <Card className="w-full p-6">
        <div className="mb-5">
          <div className="grid size-11 place-items-center rounded-lg bg-pine text-white">
            <UserPlus size={20} />
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-ink">
            {mode === "signup" ? "Create your CRM account" : "Log in to your CRM"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {mode === "signup"
              ? "Create an account from this link and start tracking your own outreach pipeline."
              : "Log in to get back to your saved prospects, templates, and follow-ups."}
          </p>
        </div>
        <form action={mode === "signup" ? signUpAction : signInAction} className="grid gap-4">
          {mode === "signup" ? (
            <Field label="Name">
              <input name="name" autoComplete="name" className={inputClass} />
            </Field>
          ) : null}
          <Field label="Email">
            <input name="email" type="email" autoComplete="email" className={inputClass} />
          </Field>
          <Field label="Password">
            <input
              name="password"
              type="password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              className={inputClass}
            />
          </Field>
          {error ? <div className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-coral">{error}</div> : null}
          <Button>{mode === "signup" ? "Create account" : "Log in"}</Button>
        </form>
        <div className="mt-5 text-sm text-slate-600">
          {mode === "signup" ? "Already have an account?" : "Need an account?"}{" "}
          <a className="font-semibold text-pine" href={mode === "signup" ? "/login" : "/signup"}>
            {mode === "signup" ? "Log in" : "Create one"}
          </a>
        </div>
      </Card>
    </div>
  );
}
