"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addManualTimelineEntry,
  createProspect,
  quickUpdateStatus,
  updateProspect,
  upsertTemplate
} from "@/lib/db";
import { getCurrentUser, signIn, signOut, signUp } from "@/lib/auth";
import type { ProspectStatus } from "@/lib/types";

export async function createProspectAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const id = await createProspect(formData, user.id);
  revalidatePath("/");
  revalidatePath("/prospects");
  redirect(`/prospects/${id}`);
}

export async function updateProspectAction(id: string, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  await updateProspect(id, formData, user.id);
  revalidatePath("/");
  revalidatePath("/prospects");
  revalidatePath(`/prospects/${id}`);
  redirect(`/prospects/${id}`);
}

export async function quickStatusAction(id: string, status: ProspectStatus) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  await quickUpdateStatus(id, status, user.id);
  revalidatePath("/");
  revalidatePath("/prospects");
  revalidatePath("/follow-ups");
  revalidatePath(`/prospects/${id}`);
}

export async function saveTemplateAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  await upsertTemplate(formData, user.id);
  revalidatePath("/templates");
}

export async function addTimelineAction(id: string, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  await addManualTimelineEntry(id, formData, user.id);
  revalidatePath(`/prospects/${id}`);
}

export async function signUpAction(formData: FormData) {
  const result = await signUp(formData);
  if (!result.ok) redirect(`/signup?error=${encodeURIComponent(result.error)}`);
  revalidatePath("/");
  redirect("/");
}

export async function signInAction(formData: FormData) {
  const result = await signIn(formData);
  if (!result.ok) redirect(`/login?error=${encodeURIComponent(result.error)}`);
  revalidatePath("/");
  redirect("/");
}

export async function signOutAction() {
  await signOut();
  revalidatePath("/");
  redirect("/login");
}
