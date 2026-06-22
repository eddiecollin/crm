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
);

create table if not exists templates (
  id text primary key,
  name text not null,
  type text not null,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists timeline_entries (
  id text primary key,
  prospect_id text not null references prospects(id) on delete cascade,
  entry_date date not null default current_date,
  action_type text not null,
  message_sent text,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists prospects_status_idx on prospects(status);
create index if not exists prospects_city_idx on prospects(city);
create index if not exists prospects_trade_idx on prospects(trade);
create index if not exists prospects_next_follow_up_idx on prospects(next_follow_up_date);
create index if not exists timeline_entries_prospect_idx on timeline_entries(prospect_id);
