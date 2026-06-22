import { clsx, type ClassValue } from "clsx";
import type { Prospect, Template } from "./types";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

export function percent(value: number) {
  return `${Math.round(value)}%`;
}

export function personalizeTemplate(
  template: Template | Pick<Template, "body">,
  prospect: Prospect,
  myName = "Your Name"
) {
  return template.body
    .replaceAll("{company}", prospect.companyName || "")
    .replaceAll("{trade}", prospect.trade || "")
    .replaceAll("{city}", prospect.city || "")
    .replaceAll("{demoUrl}", prospect.demoUrl || "")
    .replaceAll("{myName}", myName || "Your Name");
}

export function statusTone(status: string) {
  if (status === "Won") return "bg-mint text-pine";
  if (status === "Lost") return "bg-red-50 text-coral";
  if (status === "Interested" || status === "Meeting booked") return "bg-yellow-50 text-amber";
  if (status.includes("Follow-up")) return "bg-blue-50 text-steel";
  if (status === "Replied") return "bg-purple-50 text-purple-700";
  return "bg-field text-ink";
}
