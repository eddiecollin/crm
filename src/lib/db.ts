import postgres from "postgres";
import { unstable_noStore as noStore } from "next/cache";
import type { Prospect, ProspectFilters, ProspectStatus, Stats, Template, TimelineEntry } from "./types";
import { STATUSES } from "./types";
import { todayIso } from "./utils";

let client: postgres.Sql | null = null;
let schemaReady = false;

const defaultTemplates = [
  {
    id: "initial-demo",
    name: "Initial demo message",
    type: "Initial",
    body: "Hi {company}, I put together a quick website demo for your {trade} business in {city}: {demoUrl}\n\nI noticed a few places where a sharper site could help turn more local visitors into calls. Would you be open to taking a look?\n\nBest,\n{myName}"
  },
  {
    id: "follow-up-1",
    name: "Follow-up 1",
    type: "Follow-up",
    body: "Hi {company}, just checking that you saw the demo I made for your {trade} business: {demoUrl}\n\nHappy to adjust it around your services or preferred style if useful.\n\n{myName}"
  },
  {
    id: "follow-up-2",
    name: "Follow-up 2",
    type: "Follow-up",
    body: "Hi {company}, quick follow-up from me. The demo for your {trade} business in {city} is still here: {demoUrl}\n\nIf improving the site is on your radar, I can walk you through what I changed and why.\n\n{myName}"
  },
  {
    id: "final-soft-follow-up",
    name: "Final soft follow-up",
    type: "Final",
    body: "Hi {company}, I do not want to crowd your inbox, so this is my last note for now.\n\nIf you ever want to revisit the demo for your {trade} business, it is here: {demoUrl}\n\nThanks,\n{myName}"
  }
];

function getSql() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set. Add a Postgres connection string to .env.local.");
  }
  if (!client) client = postgres(databaseUrl, { max: 3, prepare: false });
  return client;
}

function mapProspect(row: Record<string, unknown>): Prospect {
  return {
    id: String(row.id),
    companyName: String(row.company_name ?? ""),
    trade: String(row.trade ?? ""),
    city: String(row.city ?? ""),
    contactPerson: String(row.contact_person ?? ""),
    phone: String(row.phone ?? ""),
    email: String(row.email ?? ""),
    websiteUrl: String(row.website_url ?? ""),
    demoUrl: String(row.demo_url ?? ""),
    source: String(row.source ?? ""),
    status: String(row.status ?? "New lead") as ProspectStatus,
    lastContactedDate: String(row.last_contacted_date ?? ""),
    nextFollowUpDate: String(row.next_follow_up_date ?? ""),
    notes: String(row.notes ?? ""),
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? "")
  };
}

function mapTemplate(row: Record<string, unknown>): Template {
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    type: String(row.type ?? ""),
    body: String(row.body ?? "")
  };
}

function mapTimeline(row: Record<string, unknown>): TimelineEntry {
  return {
    id: String(row.id),
    prospectId: String(row.prospect_id ?? ""),
    entryDate: String(row.entry_date ?? ""),
    actionType: String(row.action_type ?? ""),
    messageSent: String(row.message_sent ?? ""),
    notes: String(row.notes ?? ""),
    createdAt: String(row.created_at ?? "")
  };
}

export async function ensureSchema() {
  if (schemaReady) return;
  const sql = getSql();

  await sql`
    create table if not exists prospects (
      id text primary key,
      company_name text not null,
      trade text not null,
      city text not null,
      contact_person text,
      phone text,
      email text,
      website_url text,
      demo_url text,
      source text,
      status text not null default 'New lead',
      last_contacted_date date,
      next_follow_up_date date,
      notes text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `;
  await sql`
    create table if not exists templates (
      id text primary key,
      name text not null,
      type text not null,
      body text not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `;
  await sql`
    create table if not exists timeline_entries (
      id text primary key,
      prospect_id text not null references prospects(id) on delete cascade,
      entry_date date not null default current_date,
      action_type text not null,
      message_sent text,
      notes text,
      created_at timestamptz not null default now()
    )
  `;
  await sql`create index if not exists prospects_status_idx on prospects(status)`;
  await sql`create index if not exists prospects_city_idx on prospects(city)`;
  await sql`create index if not exists prospects_trade_idx on prospects(trade)`;
  await sql`create index if not exists prospects_next_follow_up_idx on prospects(next_follow_up_date)`;
  await sql`create index if not exists timeline_entries_prospect_idx on timeline_entries(prospect_id)`;

  for (const template of defaultTemplates) {
    await sql`
      insert into templates ${sql(template)}
      on conflict (id) do nothing
    `;
  }

  schemaReady = true;
}

export async function listProspects(filters: ProspectFilters = {}) {
  noStore();
  await ensureSchema();
  const sql = getSql();
  const clauses = [];
  if (filters.status) clauses.push(sql`status = ${filters.status}`);
  if (filters.city) clauses.push(sql`city = ${filters.city}`);
  if (filters.trade) clauses.push(sql`trade = ${filters.trade}`);
  if (filters.due === "today") clauses.push(sql`next_follow_up_date <= ${todayIso()}`);

  const where = clauses.length
    ? sql`where ${clauses.reduce((prev, clause) => sql`${prev} and ${clause}`)}`
    : sql``;
  const order =
    filters.sort === "nextFollowUp"
      ? sql`next_follow_up_date asc nulls last, company_name asc`
      : filters.sort === "status"
        ? sql`status asc, company_name asc`
        : filters.sort === "city"
          ? sql`city asc, company_name asc`
          : filters.sort === "trade"
            ? sql`trade asc, company_name asc`
            : sql`created_at desc`;

  const rows = await sql`select * from prospects ${where} order by ${order}`;
  return rows.map(mapProspect);
}

export async function getFilterOptions() {
  noStore();
  await ensureSchema();
  const sql = getSql();
  const [cities, trades] = await Promise.all([
    sql`select distinct city from prospects where city <> '' order by city`,
    sql`select distinct trade from prospects where trade <> '' order by trade`
  ]);
  return {
    cities: cities.map((row) => String(row.city)),
    trades: trades.map((row) => String(row.trade)),
    statuses: [...STATUSES]
  };
}

export async function getProspect(id: string) {
  noStore();
  await ensureSchema();
  const sql = getSql();
  const rows = await sql`select * from prospects where id = ${id} limit 1`;
  return rows[0] ? mapProspect(rows[0]) : null;
}

export async function createProspect(data: FormData) {
  await ensureSchema();
  const sql = getSql();
  const id = crypto.randomUUID();
  const status = String(data.get("status") || "New lead") as ProspectStatus;
  await sql`
    insert into prospects (
      id, company_name, trade, city, contact_person, phone, email, website_url,
      demo_url, source, status, next_follow_up_date, notes
    ) values (
      ${id}, ${String(data.get("companyName") || "")}, ${String(data.get("trade") || "")},
      ${String(data.get("city") || "")}, ${String(data.get("contactPerson") || "")},
      ${String(data.get("phone") || "")}, ${String(data.get("email") || "")},
      ${String(data.get("websiteUrl") || "")}, ${String(data.get("demoUrl") || "")},
      ${String(data.get("source") || "")}, ${status},
      ${String(data.get("nextFollowUpDate") || "") || null}, ${String(data.get("notes") || "")}
    )
  `;
  await addTimelineEntry(id, "Created", "", "Prospect added.");
  return id;
}

export async function updateProspect(id: string, data: FormData) {
  await ensureSchema();
  const sql = getSql();
  await sql`
    update prospects set
      company_name = ${String(data.get("companyName") || "")},
      trade = ${String(data.get("trade") || "")},
      city = ${String(data.get("city") || "")},
      contact_person = ${String(data.get("contactPerson") || "")},
      phone = ${String(data.get("phone") || "")},
      email = ${String(data.get("email") || "")},
      website_url = ${String(data.get("websiteUrl") || "")},
      demo_url = ${String(data.get("demoUrl") || "")},
      source = ${String(data.get("source") || "")},
      status = ${String(data.get("status") || "New lead")},
      last_contacted_date = ${String(data.get("lastContactedDate") || "") || null},
      next_follow_up_date = ${String(data.get("nextFollowUpDate") || "") || null},
      notes = ${String(data.get("notes") || "")},
      updated_at = now()
    where id = ${id}
  `;
}

export async function quickUpdateStatus(id: string, status: ProspectStatus) {
  await ensureSchema();
  const sql = getSql();
  const today = todayIso();
  await sql`
    update prospects set
      status = ${status},
      last_contacted_date = ${today},
      updated_at = now()
    where id = ${id}
  `;
  await addTimelineEntry(id, status, "", `Status changed to ${status}.`);
}

export async function listTemplates() {
  noStore();
  await ensureSchema();
  const sql = getSql();
  const rows = await sql`select * from templates order by created_at asc`;
  return rows.map(mapTemplate);
}

export async function upsertTemplate(data: FormData) {
  await ensureSchema();
  const sql = getSql();
  const id = String(data.get("id") || crypto.randomUUID());
  await sql`
    insert into templates (id, name, type, body)
    values (${id}, ${String(data.get("name") || "")}, ${String(data.get("type") || "")}, ${String(data.get("body") || "")})
    on conflict (id) do update set
      name = excluded.name,
      type = excluded.type,
      body = excluded.body,
      updated_at = now()
  `;
}

export async function listTimeline(prospectId: string) {
  noStore();
  await ensureSchema();
  const sql = getSql();
  const rows = await sql`
    select * from timeline_entries
    where prospect_id = ${prospectId}
    order by entry_date desc, created_at desc
  `;
  return rows.map(mapTimeline);
}

export async function addTimelineEntry(prospectId: string, actionType: string, messageSent: string, notes: string) {
  await ensureSchema();
  const sql = getSql();
  await sql`
    insert into timeline_entries (id, prospect_id, entry_date, action_type, message_sent, notes)
    values (${crypto.randomUUID()}, ${prospectId}, ${todayIso()}, ${actionType}, ${messageSent}, ${notes})
  `;
}

export async function addManualTimelineEntry(prospectId: string, data: FormData) {
  await ensureSchema();
  const sql = getSql();
  await sql`
    insert into timeline_entries (id, prospect_id, entry_date, action_type, message_sent, notes)
    values (
      ${crypto.randomUUID()},
      ${prospectId},
      ${String(data.get("entryDate") || todayIso())},
      ${String(data.get("actionType") || "Note")},
      ${String(data.get("messageSent") || "")},
      ${String(data.get("notes") || "")}
    )
  `;
}

export async function getStats(): Promise<Stats> {
  noStore();
  await ensureSchema();
  const sql = getSql();
  const [rows] = await sql`
    select
      count(*)::int as total_prospects,
      count(*) filter (where status in ('Demo sent', 'Follow-up 1 sent', 'Follow-up 2 sent', 'Replied', 'Interested', 'Meeting booked', 'Won', 'Lost', 'Not now'))::int as demos_sent,
      count(*) filter (where status in ('Replied', 'Interested', 'Meeting booked', 'Won'))::int as replies,
      count(*) filter (where status in ('Interested', 'Meeting booked', 'Won'))::int as interested_leads,
      count(*) filter (where status = 'Won')::int as won_clients,
      count(*) filter (where next_follow_up_date <= current_date and status not in ('Won', 'Lost', 'Not now'))::int as follow_ups_due_today
    from prospects
  `;
  const totalProspects = Number(rows.total_prospects || 0);
  const demosSent = Number(rows.demos_sent || 0);
  const replies = Number(rows.replies || 0);
  const interestedLeads = Number(rows.interested_leads || 0);
  const wonClients = Number(rows.won_clients || 0);
  const followUpsDueToday = Number(rows.follow_ups_due_today || 0);
  return {
    totalProspects,
    demosSent,
    replies,
    interestedLeads,
    wonClients,
    followUpsDueToday,
    demoToReplyRate: demosSent ? (replies / demosSent) * 100 : 0,
    replyToInterestedRate: replies ? (interestedLeads / replies) * 100 : 0,
    interestedToWonRate: interestedLeads ? (wonClients / interestedLeads) * 100 : 0
  };
}
