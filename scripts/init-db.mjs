import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is required.");
  process.exit(1);
}

const sql = postgres(databaseUrl, { max: 1 });

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

const defaults = [
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

for (const template of defaults) {
  await sql`
    insert into templates ${sql(template)}
    on conflict (id) do nothing
  `;
}

await sql.end();
console.log("Database is ready.");
