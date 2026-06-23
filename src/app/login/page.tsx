import { LocalCrmApp } from "@/components/local-crm-app";
import { AuthForm } from "@/components/auth-form";
import { hasDatabase } from "@/lib/config";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  if (hasDatabase()) return <AuthForm mode="login" error={params.error} />;
  return <LocalCrmApp initialAuthMode="login" />;
}
