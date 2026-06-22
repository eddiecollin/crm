import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  eyebrow,
  action
}: {
  title: string;
  eyebrow?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? <div className="text-sm font-medium uppercase tracking-[0.16em] text-pine">{eyebrow}</div> : null}
        <h1 className="mt-1 text-2xl font-semibold text-ink">{title}</h1>
      </div>
      {action}
    </div>
  );
}

export function Button({
  children,
  className,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-pine text-white hover:bg-[#254c3e]",
        variant === "secondary" && "border border-line bg-white text-ink hover:bg-field",
        variant === "ghost" && "text-slate-600 hover:bg-field hover:text-ink",
        variant === "danger" && "bg-coral text-white hover:bg-[#cb574d]",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  children,
  className,
  variant = "primary",
  href
}: {
  children: ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
  href: string;
}) {
  return (
    <a
      href={href}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold transition",
        variant === "primary" && "bg-pine text-white hover:bg-[#254c3e]",
        variant === "secondary" && "border border-line bg-white text-ink hover:bg-field",
        variant === "ghost" && "text-slate-600 hover:bg-field hover:text-ink",
        className
      )}
    >
      {children}
    </a>
  );
}

export function Card({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={cn("rounded-lg border border-line bg-white shadow-soft", className)}>{children}</section>;
}

export function Field({
  label,
  children
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-slate-700">
      <span>{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-pine focus:ring-2 focus:ring-mint";

export const textareaClass =
  "min-h-28 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-pine focus:ring-2 focus:ring-mint";
