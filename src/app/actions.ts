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
import type { ProspectStatus } from "@/lib/types";

export async function createProspectAction(formData: FormData) {
  const id = await createProspect(formData);
  revalidatePath("/");
  revalidatePath("/prospects");
  redirect(`/prospects/${id}`);
}

export async function updateProspectAction(id: string, formData: FormData) {
  await updateProspect(id, formData);
  revalidatePath("/");
  revalidatePath("/prospects");
  revalidatePath(`/prospects/${id}`);
  redirect(`/prospects/${id}`);
}

export async function quickStatusAction(id: string, status: ProspectStatus) {
  await quickUpdateStatus(id, status);
  revalidatePath("/");
  revalidatePath("/prospects");
  revalidatePath("/follow-ups");
  revalidatePath(`/prospects/${id}`);
}

export async function saveTemplateAction(formData: FormData) {
  await upsertTemplate(formData);
  revalidatePath("/templates");
}

export async function addTimelineAction(id: string, formData: FormData) {
  await addManualTimelineEntry(id, formData);
  revalidatePath(`/prospects/${id}`);
}
