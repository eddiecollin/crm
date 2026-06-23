import { cookies } from "next/headers";
import { createHash } from "node:crypto";
import { ensureSchema, getSql } from "./db";

const sessionCookie = "crm_session";
const sessionDays = 30;

export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

function hashPassword(password: string) {
  return createHash("sha256").update(password).digest("hex");
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  await ensureSchema();
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(sessionCookie)?.value;
  if (!sessionId) return null;

  const sql = getSql();
  const [row] = await sql`
    select users.id, users.name, users.email
    from sessions
    join users on users.id = sessions.user_id
    where sessions.id = ${sessionId}
      and sessions.expires_at > now()
    limit 1
  `;

  if (!row) return null;
  return {
    id: String(row.id),
    name: String(row.name),
    email: String(row.email)
  };
}

export async function signUp(data: FormData) {
  await ensureSchema();
  const name = String(data.get("name") || "").trim();
  const email = String(data.get("email") || "").trim().toLowerCase();
  const password = String(data.get("password") || "");
  if (!name || !email || password.length < 6) {
    return { ok: false, error: "Use a name, email, and password with at least 6 characters." };
  }

  const sql = getSql();
  const existing = await sql`select id from users where email = ${email} limit 1`;
  if (existing.length) return { ok: false, error: "That email already has an account. Log in instead." };

  const userId = crypto.randomUUID();
  await sql`
    insert into users (id, name, email, password_hash)
    values (${userId}, ${name}, ${email}, ${hashPassword(password)})
  `;
  await createSession(userId);
  return { ok: true, error: "" };
}

export async function signIn(data: FormData) {
  await ensureSchema();
  const email = String(data.get("email") || "").trim().toLowerCase();
  const password = String(data.get("password") || "");
  const sql = getSql();
  const [user] = await sql`
    select id from users
    where email = ${email} and password_hash = ${hashPassword(password)}
    limit 1
  `;
  if (!user) return { ok: false, error: "Email or password is wrong." };
  await createSession(String(user.id));
  return { ok: true, error: "" };
}

export async function signOut() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(sessionCookie)?.value;
  if (sessionId) {
    await ensureSchema();
    await getSql()`delete from sessions where id = ${sessionId}`;
  }
  cookieStore.delete(sessionCookie);
}

async function createSession(userId: string) {
  const sessionId = crypto.randomUUID();
  const expires = new Date(Date.now() + sessionDays * 24 * 60 * 60 * 1000);
  await getSql()`
    insert into sessions (id, user_id, expires_at)
    values (${sessionId}, ${userId}, ${expires})
  `;
  const cookieStore = await cookies();
  cookieStore.set(sessionCookie, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires
  });
}
