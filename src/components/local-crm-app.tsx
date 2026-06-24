"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, CalendarClock, Copy, LogOut, Plus, Save, Send, UserPlus } from "lucide-react";
import { DEFAULT_TEMPLATES } from "@/lib/defaults";
import { STATUSES, type Prospect, type ProspectStatus, type Template, type TimelineEntry } from "@/lib/types";
import { formatDate, percent, personalizeTemplate, statusTone, todayIso } from "@/lib/utils";
import { Button, Card, Field, PageHeader, inputClass, textareaClass } from "./ui";

type View = "dashboard" | "prospects" | "followups" | "templates" | "stats" | "new" | "detail" | "edit";
type AuthMode = "login" | "signup";

type LocalState = {
  prospects: Prospect[];
  templates: Template[];
  timeline: TimelineEntry[];
};

const emptyState: LocalState = {
  prospects: [],
  templates: DEFAULT_TEMPLATES,
  timeline: []
};

const storageKey = "outreach-crm-local-v1";
const usersKey = "outreach-crm-users-v1";
const sessionKey = "outreach-crm-session-v1";

type LocalUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

export function LocalCrmApp({
  initialView = "dashboard",
  initialAuthMode = "login"
}: {
  initialView?: View;
  initialAuthMode?: AuthMode;
}) {
  const [state, setState] = useState<LocalState>(emptyState);
  const [view, setView] = useState<View>(initialView);
  const [authMode, setAuthMode] = useState<AuthMode>(initialAuthMode);
  const [user, setUser] = useState<LocalUser | null>(null);
  const [authError, setAuthError] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [filters, setFilters] = useState({ status: "", city: "", trade: "", sort: "newest" });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const sessionUserId = window.localStorage.getItem(sessionKey);
    const users = readUsers();
    const activeUser = users.find((item) => item.id === sessionUserId) ?? null;
    setUser(activeUser);
    if (activeUser) {
      const raw = window.localStorage.getItem(userStorageKey(activeUser.id));
      setState(raw ? { ...emptyState, ...JSON.parse(raw) } : emptyState);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded && user) window.localStorage.setItem(userStorageKey(user.id), JSON.stringify(state));
  }, [loaded, state, user]);

  async function handleAuth(formData: FormData) {
    setAuthError("");
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "");
    if (!email || !password || (authMode === "signup" && !name)) {
      setAuthError("Fill in all required fields.");
      return;
    }
    if (password.length < 6) {
      setAuthError("Use at least 6 characters for the password.");
      return;
    }
    const users = readUsers();
    const passwordHash = await hashPassword(password);

    if (authMode === "signup") {
      if (users.some((item) => item.email === email)) {
        setAuthError("That email already has an account. Log in instead.");
        return;
      }
      const nextUser = { id: crypto.randomUUID(), name, email, passwordHash, createdAt: new Date().toISOString() };
      window.localStorage.setItem(usersKey, JSON.stringify([...users, nextUser]));
      window.localStorage.setItem(sessionKey, nextUser.id);
      setUser(nextUser);
      setState(emptyState);
      setView("dashboard");
      return;
    }

    const existing = users.find((item) => item.email === email && item.passwordHash === passwordHash);
    if (!existing) {
      setAuthError("Email or password is wrong.");
      return;
    }
    window.localStorage.setItem(sessionKey, existing.id);
    setUser(existing);
    const raw = window.localStorage.getItem(userStorageKey(existing.id));
    setState(raw ? { ...emptyState, ...JSON.parse(raw) } : emptyState);
    setView("dashboard");
  }

  function logout() {
    window.localStorage.removeItem(sessionKey);
    setUser(null);
    setState(emptyState);
    setAuthMode("login");
  }

  const stats = useMemo(() => {
    const demosSent = state.prospects.filter((p) =>
      ["Demo sent", "Follow-up 1 sent", "Follow-up 2 sent", "Replied", "Interested", "Handed to closer", "Meeting booked", "Meeting completed", "Proposal sent", "Won", "Lost", "Not now"].includes(p.status)
    ).length;
    const replies = state.prospects.filter((p) => ["Replied", "Interested", "Handed to closer", "Meeting booked", "Meeting completed", "Proposal sent", "Won"].includes(p.status)).length;
    const interestedLeads = state.prospects.filter((p) => ["Interested", "Handed to closer", "Meeting booked", "Meeting completed", "Proposal sent", "Won"].includes(p.status)).length;
    const handoffsToCloser = state.prospects.filter((p) => ["Handed to closer", "Meeting booked", "Meeting completed", "Proposal sent", "Won"].includes(p.status)).length;
    const meetingsBooked = state.prospects.filter((p) => ["Meeting booked", "Meeting completed", "Proposal sent", "Won"].includes(p.status)).length;
    const meetingsCompleted = state.prospects.filter((p) => ["Meeting completed", "Proposal sent", "Won"].includes(p.status)).length;
    const proposalsSent = state.prospects.filter((p) => ["Proposal sent", "Won"].includes(p.status)).length;
    const wonClients = state.prospects.filter((p) => p.status === "Won").length;
    const followUpsDueToday = state.prospects.filter(
      (p) => p.nextFollowUpDate && p.nextFollowUpDate <= todayIso() && !["Won", "Lost", "Not now"].includes(p.status)
    ).length;
    return {
      totalProspects: state.prospects.length,
      demosSent,
      replies,
      interestedLeads,
      wonClients,
      followUpsDueToday,
      handoffsToCloser,
      meetingsBooked,
      meetingsCompleted,
      proposalsSent,
      demoToReplyRate: demosSent ? (replies / demosSent) * 100 : 0,
      replyToMeetingRate: replies ? (meetingsBooked / replies) * 100 : 0,
      meetingToWonRate: meetingsCompleted ? (wonClients / meetingsCompleted) * 100 : 0
    };
  }, [state.prospects]);

  const prospects = useMemo(() => {
    let rows = [...state.prospects];
    if (view === "followups") rows = rows.filter((p) => p.nextFollowUpDate && p.nextFollowUpDate <= todayIso() && !["Won", "Lost", "Not now"].includes(p.status));
    if (filters.status) rows = rows.filter((p) => p.status === filters.status);
    if (filters.city) rows = rows.filter((p) => p.city === filters.city);
    if (filters.trade) rows = rows.filter((p) => p.trade === filters.trade);
    rows.sort((a, b) => {
      if (filters.sort === "next") return (a.nextFollowUpDate || "9999").localeCompare(b.nextFollowUpDate || "9999");
      if (filters.sort === "status") return a.status.localeCompare(b.status);
      return b.createdAt.localeCompare(a.createdAt);
    });
    return rows;
  }, [filters, state.prospects, view]);

  const selected = state.prospects.find((p) => p.id === selectedId) ?? state.prospects[0];
  const cities = [...new Set(state.prospects.map((p) => p.city).filter(Boolean))].sort();
  const trades = [...new Set(state.prospects.map((p) => p.trade).filter(Boolean))].sort();

  function saveProspect(formData: FormData, id?: string) {
    const now = new Date().toISOString();
    const prospect: Prospect = {
      id: id || crypto.randomUUID(),
      companyName: String(formData.get("companyName") || ""),
      trade: String(formData.get("trade") || ""),
      city: String(formData.get("city") || ""),
      contactPerson: String(formData.get("contactPerson") || ""),
      phone: String(formData.get("phone") || ""),
      email: String(formData.get("email") || ""),
      websiteUrl: String(formData.get("websiteUrl") || ""),
      demoUrl: String(formData.get("demoUrl") || ""),
      source: String(formData.get("source") || ""),
      coldCaller: String(formData.get("coldCaller") || ""),
      closer: String(formData.get("closer") || ""),
      meetingDate: String(formData.get("meetingDate") || ""),
      meetingUrl: String(formData.get("meetingUrl") || ""),
      meetingOutcome: String(formData.get("meetingOutcome") || ""),
      dealValue: String(formData.get("dealValue") || ""),
      status: String(formData.get("status") || "New lead") as ProspectStatus,
      lastContactedDate: String(formData.get("lastContactedDate") || ""),
      nextFollowUpDate: String(formData.get("nextFollowUpDate") || ""),
      notes: String(formData.get("notes") || ""),
      createdAt: id ? state.prospects.find((p) => p.id === id)?.createdAt || now : now,
      updatedAt: now
    };
    setState((current) => ({
      ...current,
      prospects: id ? current.prospects.map((p) => (p.id === id ? prospect : p)) : [prospect, ...current.prospects],
      timeline: id
        ? current.timeline
        : [
            {
              id: crypto.randomUUID(),
              prospectId: prospect.id,
              entryDate: todayIso(),
              actionType: "Created",
              messageSent: "",
              notes: "Prospect added.",
              createdAt: now
            },
            ...current.timeline
          ]
    }));
    setSelectedId(prospect.id);
    setView("detail");
  }

  function quickStatus(id: string, status: ProspectStatus) {
    const today = todayIso();
    setState((current) => ({
      ...current,
      prospects: current.prospects.map((p) => (p.id === id ? { ...p, status, lastContactedDate: today, updatedAt: new Date().toISOString() } : p)),
      timeline: [
        {
          id: crypto.randomUUID(),
          prospectId: id,
          entryDate: today,
          actionType: status,
          messageSent: "",
          notes: `Status changed to ${status}.`,
          createdAt: new Date().toISOString()
        },
        ...current.timeline
      ]
    }));
  }

  function saveTemplate(formData: FormData, id?: string) {
    const template: Template = {
      id: id || crypto.randomUUID(),
      name: String(formData.get("name") || ""),
      type: String(formData.get("type") || ""),
      body: String(formData.get("body") || "")
    };
    setState((current) => ({
      ...current,
      templates: id ? current.templates.map((t) => (t.id === id ? template : t)) : [...current.templates, template]
    }));
  }

  function addTimeline(formData: FormData, prospectId: string) {
    setState((current) => ({
      ...current,
      timeline: [
        {
          id: crypto.randomUUID(),
          prospectId,
          entryDate: String(formData.get("entryDate") || todayIso()),
          actionType: String(formData.get("actionType") || "Note"),
          messageSent: String(formData.get("messageSent") || ""),
          notes: String(formData.get("notes") || ""),
          createdAt: new Date().toISOString()
        },
        ...current.timeline
      ]
    }));
  }

  if (!loaded) return null;

  if (!user) {
    return <LocalAuth mode={authMode} setMode={setAuthMode} error={authError} action={handleAuth} />;
  }

  const nav = (
    <div className="mb-5 rounded-md border border-line bg-mint px-4 py-3 text-sm text-pine">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span>Signed in as {user.name}. This version saves account data in this browser; add `DATABASE_URL` later for shared cloud storage.</span>
        <Button variant="secondary" className="h-8 bg-white px-2 text-xs" onClick={logout}>
          <LogOut size={14} />
          Log out
        </Button>
      </div>
    </div>
  );

  if (view === "new") {
    return (
      <>
        {nav}
        <PageHeader eyebrow="New lead" title="Add prospect" action={<Button variant="secondary" onClick={() => setView("prospects")}>Back</Button>} />
        <LocalProspectForm onSave={saveProspect} />
      </>
    );
  }

  if (view === "edit" && selected) {
    return (
      <>
        {nav}
        <PageHeader eyebrow="Edit prospect" title={selected.companyName} />
        <LocalProspectForm prospect={selected} onSave={(data) => saveProspect(data, selected.id)} />
      </>
    );
  }

  if (view === "detail" && selected) {
    return (
      <>
        {nav}
        <LocalDetail
          prospect={selected}
          templates={state.templates}
          timeline={state.timeline.filter((entry) => entry.prospectId === selected.id)}
          onEdit={() => setView("edit")}
          onBack={() => setView("prospects")}
          onQuick={quickStatus}
          onTimeline={(data) => addTimeline(data, selected.id)}
        />
      </>
    );
  }

  if (view === "templates") {
    return (
      <>
        {nav}
        <PageHeader eyebrow="Reusable messages" title="Templates" />
        <div className="grid gap-4 xl:grid-cols-2">
          {state.templates.map((template) => (
            <TemplateCard key={template.id} template={template} onSave={(data) => saveTemplate(data, template.id)} />
          ))}
          <TemplateCard onSave={saveTemplate} />
        </div>
      </>
    );
  }

  if (view === "stats") {
    return (
      <>
        {nav}
        <PageHeader eyebrow="Performance" title="Outreach stats" />
        <StatsPanel stats={stats} />
      </>
    );
  }

  const activeView: View = view;

  return (
    <>
      {nav}
      <PageHeader
        eyebrow={view === "followups" ? "Today" : "Sales pipeline"}
        title={view === "followups" ? "Needs follow-up" : "Website demo outreach"}
        action={<Button onClick={() => setView("new")}><Plus size={16} />Add prospect</Button>}
      />
      {view === "dashboard" ? <StatStrip stats={stats} /> : null}
      <div className="mb-4 mt-5 flex flex-wrap gap-2">
        <Button variant={activeView === "dashboard" ? "primary" : "secondary"} onClick={() => setView("dashboard")}>Dashboard</Button>
        <Button variant={activeView === "prospects" ? "primary" : "secondary"} onClick={() => setView("prospects")}>Prospects</Button>
        <Button variant={activeView === "followups" ? "primary" : "secondary"} onClick={() => setView("followups")}><CalendarClock size={16} />Follow-ups</Button>
        <Button variant="secondary" onClick={() => setView("templates")}><Send size={16} />Templates</Button>
        <Button variant="secondary" onClick={() => setView("stats")}><BarChart3 size={16} />Stats</Button>
      </div>
      <FilterControls filters={filters} setFilters={setFilters} cities={cities} trades={trades} />
      <LocalTable prospects={prospects} onOpen={(id) => { setSelectedId(id); setView("detail"); }} onEdit={(id) => { setSelectedId(id); setView("edit"); }} onQuick={quickStatus} />
    </>
  );
}

function readUsers(): LocalUser[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(usersKey);
  return raw ? JSON.parse(raw) : [];
}

function userStorageKey(userId: string) {
  return `${storageKey}:${userId}`;
}

async function hashPassword(password: string) {
  const bytes = new TextEncoder().encode(password);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function LocalAuth({
  mode,
  setMode,
  error,
  action
}: {
  mode: AuthMode;
  setMode: (mode: AuthMode) => void;
  error: string;
  action: (formData: FormData) => void;
}) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center">
      <Card className="w-full p-6">
        <div className="mb-5">
          <div className="grid size-11 place-items-center rounded-lg bg-pine text-white">
            <UserPlus size={20} />
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-ink">{mode === "signup" ? "Create your CRM account" : "Log in to your CRM"}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {mode === "signup"
              ? "Use this same link on any browser to create an account."
              : "Enter your email and password to get back to your pipeline."}
          </p>
        </div>
        <form action={action} className="grid gap-4">
          {mode === "signup" ? (
            <Field label="Name">
              <input name="name" autoComplete="name" className={inputClass} />
            </Field>
          ) : null}
          <Field label="Email">
            <input name="email" type="email" autoComplete="email" className={inputClass} />
          </Field>
          <Field label="Password">
            <input name="password" type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} className={inputClass} />
          </Field>
          {error ? <div className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-coral">{error}</div> : null}
          <Button>{mode === "signup" ? "Create account" : "Log in"}</Button>
        </form>
        <div className="mt-5 text-sm text-slate-600">
          {mode === "signup" ? "Already have an account?" : "Need an account?"}{" "}
          <button className="font-semibold text-pine" onClick={() => setMode(mode === "signup" ? "login" : "signup")}>
            {mode === "signup" ? "Log in" : "Create one"}
          </button>
        </div>
      </Card>
    </div>
  );
}

function FilterControls({
  filters,
  setFilters,
  cities,
  trades
}: {
  filters: { status: string; city: string; trade: string; sort: string };
  setFilters: (filters: { status: string; city: string; trade: string; sort: string }) => void;
  cities: string[];
  trades: string[];
}) {
  return (
    <Card className="mb-4 p-3">
      <div className="grid gap-3 md:grid-cols-4">
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className={inputClass}>
          <option value="">All statuses</option>
          {STATUSES.map((status) => <option key={status}>{status}</option>)}
        </select>
        <select value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })} className={inputClass}>
          <option value="">All cities</option>
          {cities.map((city) => <option key={city}>{city}</option>)}
        </select>
        <select value={filters.trade} onChange={(e) => setFilters({ ...filters, trade: e.target.value })} className={inputClass}>
          <option value="">All trades</option>
          {trades.map((trade) => <option key={trade}>{trade}</option>)}
        </select>
        <select value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })} className={inputClass}>
          <option value="newest">Newest first</option>
          <option value="next">Next follow-up</option>
          <option value="status">Status</option>
        </select>
      </div>
    </Card>
  );
}

function LocalTable({
  prospects,
  onOpen,
  onEdit,
  onQuick
}: {
  prospects: Prospect[];
  onOpen: (id: string) => void;
  onEdit: (id: string) => void;
  onQuick: (id: string, status: ProspectStatus) => void;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-[1300px] w-full text-left text-sm">
          <thead className="bg-field text-xs uppercase tracking-[0.08em] text-slate-500">
            <tr>
              {["Company", "Trade", "City", "Contact", "Phone", "Email", "Website", "Demo", "Status", "Last contacted", "Next follow-up", "Notes", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {prospects.map((p) => (
              <tr key={p.id} className="hover:bg-field/60">
                <td className="px-4 py-3"><button className="font-semibold text-ink hover:text-pine" onClick={() => onOpen(p.id)}>{p.companyName}</button></td>
                <td className="px-4 py-3 text-slate-600">{p.trade}</td>
                <td className="px-4 py-3 text-slate-600">{p.city}</td>
                <td className="px-4 py-3 text-slate-600">{p.contactPerson}</td>
                <td className="px-4 py-3 text-slate-600">{p.phone}</td>
                <td className="px-4 py-3 text-slate-600">{p.email}</td>
                <td className="px-4 py-3">{p.websiteUrl ? <a href={p.websiteUrl} target="_blank" className="text-pine">Site</a> : null}</td>
                <td className="px-4 py-3">{p.demoUrl ? <a href={p.demoUrl} target="_blank" className="text-pine">Demo</a> : null}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusTone(p.status)}`}>{p.status}</span></td>
                <td className="px-4 py-3 text-slate-600">{formatDate(p.lastContactedDate)}</td>
                <td className="px-4 py-3 text-slate-600">{formatDate(p.nextFollowUpDate)}</td>
                <td className="max-w-[240px] px-4 py-3 text-slate-600">{p.notes}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button variant="secondary" className="h-8 px-2 text-xs" onClick={() => onEdit(p.id)}>Edit</Button>
                    <Button className="h-8 px-2 text-xs" onClick={() => onQuick(p.id, "Demo sent")}>Demo</Button>
                    <Button variant="secondary" className="h-8 px-2 text-xs" onClick={() => onQuick(p.id, "Replied")}>Reply</Button>
                    <Button variant="secondary" className="h-8 px-2 text-xs" onClick={() => onQuick(p.id, "Won")}>Won</Button>
                  </div>
                </td>
              </tr>
            ))}
            {prospects.length === 0 ? <tr><td colSpan={13} className="px-4 py-10 text-center text-slate-500">No prospects yet.</td></tr> : null}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function LocalProspectForm({ prospect, onSave }: { prospect?: Prospect; onSave: (formData: FormData) => void }) {
  return (
    <form action={onSave}>
      <Card className="p-5">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Field label="Company name"><input required name="companyName" defaultValue={prospect?.companyName} className={inputClass} /></Field>
          <Field label="Trade/niche"><input required name="trade" defaultValue={prospect?.trade} className={inputClass} /></Field>
          <Field label="City"><input required name="city" defaultValue={prospect?.city} className={inputClass} /></Field>
          <Field label="Contact person"><input name="contactPerson" defaultValue={prospect?.contactPerson} className={inputClass} /></Field>
          <Field label="Phone"><input name="phone" defaultValue={prospect?.phone} className={inputClass} /></Field>
          <Field label="Email"><input name="email" type="email" defaultValue={prospect?.email} className={inputClass} /></Field>
          <Field label="Current website URL"><input name="websiteUrl" type="url" defaultValue={prospect?.websiteUrl} className={inputClass} /></Field>
          <Field label="Demo URL"><input name="demoUrl" type="url" defaultValue={prospect?.demoUrl} className={inputClass} /></Field>
          <Field label="Source"><input name="source" defaultValue={prospect?.source} className={inputClass} /></Field>
          <Field label="Cold caller"><input name="coldCaller" defaultValue={prospect?.coldCaller} className={inputClass} /></Field>
          <Field label="Closer"><input name="closer" defaultValue={prospect?.closer} className={inputClass} /></Field>
          <Field label="Status">
            <select name="status" defaultValue={prospect?.status ?? "New lead"} className={inputClass}>
              {STATUSES.map((status) => <option key={status}>{status}</option>)}
            </select>
          </Field>
          {prospect ? <Field label="Last contacted date"><input name="lastContactedDate" type="date" defaultValue={prospect.lastContactedDate} className={inputClass} /></Field> : null}
          <Field label="Next follow-up date"><input name="nextFollowUpDate" type="date" defaultValue={prospect?.nextFollowUpDate} className={inputClass} /></Field>
          <Field label="Teams meeting date"><input name="meetingDate" type="date" defaultValue={prospect?.meetingDate} className={inputClass} /></Field>
          <Field label="Teams meeting link"><input name="meetingUrl" type="url" defaultValue={prospect?.meetingUrl} className={inputClass} /></Field>
          <Field label="Deal value"><input name="dealValue" defaultValue={prospect?.dealValue} className={inputClass} /></Field>
          <div className="md:col-span-2 xl:col-span-3"><Field label="Meeting outcome / closer notes"><textarea name="meetingOutcome" defaultValue={prospect?.meetingOutcome} className={textareaClass} /></Field></div>
          <div className="md:col-span-2 xl:col-span-3"><Field label="Notes"><textarea name="notes" defaultValue={prospect?.notes} className={textareaClass} /></Field></div>
        </div>
        <div className="mt-5 flex justify-end"><Button><Save size={16} />Save prospect</Button></div>
      </Card>
    </form>
  );
}

function LocalDetail({
  prospect,
  templates,
  timeline,
  onEdit,
  onBack,
  onQuick,
  onTimeline
}: {
  prospect: Prospect;
  templates: Template[];
  timeline: TimelineEntry[];
  onEdit: () => void;
  onBack: () => void;
  onQuick: (id: string, status: ProspectStatus) => void;
  onTimeline: (formData: FormData) => void;
}) {
  const [templateId, setTemplateId] = useState(templates[0]?.id || "");
  const template = templates.find((t) => t.id === templateId) || templates[0];
  const message = template ? personalizeTemplate(template, prospect, "Your Name") : "";
  return (
    <>
      <PageHeader eyebrow={prospect.trade} title={prospect.companyName} action={<div className="flex gap-2"><Button variant="secondary" onClick={onEdit}>Edit</Button><Button variant="ghost" onClick={onBack}>Back</Button></div>} />
      <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <div className="grid gap-5">
          <Card className="p-5">
            <div className="mb-4 flex justify-between gap-3">
              <div><div className="text-sm text-slate-500">{prospect.city}</div><div className="font-semibold">{prospect.contactPerson || "No contact person"}</div></div>
              <span className={`h-fit rounded-full px-2 py-1 text-xs font-semibold ${statusTone(prospect.status)}`}>{prospect.status}</span>
            </div>
            {[
              ["Phone", prospect.phone],
              ["Email", prospect.email],
              ["Website", prospect.websiteUrl],
              ["Demo", prospect.demoUrl],
              ["Cold caller", prospect.coldCaller],
              ["Closer", prospect.closer],
              ["Last contacted", formatDate(prospect.lastContactedDate)],
              ["Next follow-up", formatDate(prospect.nextFollowUpDate)],
              ["Meeting date", formatDate(prospect.meetingDate)],
              ["Teams link", prospect.meetingUrl],
              ["Deal value", prospect.dealValue]
            ].map(([label, value]) => <div key={label} className="grid grid-cols-[130px_1fr] border-t border-line py-3 text-sm"><div className="text-slate-500">{label}</div><div>{value}</div></div>)}
            <div className="mt-4 flex flex-wrap gap-2">
              {(["Demo sent", "Follow-up 1 sent", "Follow-up 2 sent", "Replied", "Interested", "Handed to closer", "Meeting booked", "Meeting completed", "Proposal sent", "Won", "Lost"] as ProspectStatus[]).map((status) => (
                <Button key={status} variant={status === "Lost" ? "danger" : "secondary"} onClick={() => onQuick(prospect.id, status)}>{status}</Button>
              ))}
            </div>
          </Card>
          <Card className="p-5"><h2 className="font-semibold">Notes</h2><p className="mt-3 whitespace-pre-wrap text-sm text-slate-600">{prospect.notes || "No notes yet."}</p></Card>
          <Card className="p-5"><h2 className="font-semibold">Closer notes</h2><p className="mt-3 whitespace-pre-wrap text-sm text-slate-600">{prospect.meetingOutcome || "No meeting outcome recorded yet."}</p></Card>
        </div>
        <div className="grid gap-5">
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">Generated message</h2><Button variant="secondary" onClick={() => navigator.clipboard.writeText(message)}><Copy size={16} />Copy</Button></div>
            <Field label="Template"><select className={inputClass} value={templateId} onChange={(e) => setTemplateId(e.target.value)}>{templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></Field>
            <div className="mt-4"><Field label="Message"><textarea readOnly value={message} className={`${textareaClass} min-h-60 bg-field`} /></Field></div>
          </Card>
          <Card className="p-5">
            <h2 className="mb-4 font-semibold">Add timeline entry</h2>
            <form action={onTimeline} className="grid gap-4">
              <Field label="Date"><input name="entryDate" type="date" defaultValue={todayIso()} className={inputClass} /></Field>
              <Field label="Action type"><input name="actionType" className={inputClass} /></Field>
              <Field label="Message sent"><textarea name="messageSent" className={textareaClass} /></Field>
              <Field label="Notes"><textarea name="notes" className={textareaClass} /></Field>
              <Button>Add entry</Button>
            </form>
          </Card>
          <Card className="overflow-hidden">
            <div className="border-b border-line px-5 py-4 font-semibold">Communication history</div>
            {timeline.map((entry) => <div key={entry.id} className="border-b border-line px-5 py-4"><div className="flex justify-between"><b>{entry.actionType}</b><span className="text-sm text-slate-500">{formatDate(entry.entryDate)}</span></div><p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{entry.messageSent || entry.notes}</p></div>)}
            {timeline.length === 0 ? <div className="px-5 py-8 text-center text-slate-500">No timeline entries yet.</div> : null}
          </Card>
        </div>
      </div>
    </>
  );
}

function TemplateCard({ template, onSave }: { template?: Template; onSave: (formData: FormData) => void }) {
  return (
    <Card className="p-5">
      <form action={onSave} className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Template name"><input name="name" defaultValue={template?.name} className={inputClass} /></Field>
          <Field label="Type"><input name="type" defaultValue={template?.type} className={inputClass} /></Field>
        </div>
        <Field label="Message body"><textarea name="body" defaultValue={template?.body} className={`${textareaClass} min-h-56`} /></Field>
        <Button>{template ? "Save template" : "Add template"}</Button>
      </form>
    </Card>
  );
}

function StatStrip({ stats }: { stats: any }) {
  const items = [
    ["Total prospects", stats.totalProspects],
    ["Demos sent", stats.demosSent],
    ["Replies", stats.replies],
    ["Handed to closer", stats.handoffsToCloser],
    ["Meetings booked", stats.meetingsBooked],
    ["Proposals sent", stats.proposalsSent],
    ["Won", stats.wonClients],
    ["Due today", stats.followUpsDueToday]
  ];
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{items.map(([label, value]) => <Card key={label} className="p-4"><div className="text-2xl font-semibold">{value}</div><div className="text-sm text-slate-500">{label}</div></Card>)}</div>;
}

function StatsPanel({ stats }: { stats: any }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {[
        ["Demo sent to reply", stats.demoToReplyRate],
        ["Reply to meeting booked", stats.replyToMeetingRate],
        ["Meeting completed to won", stats.meetingToWonRate]
      ].map(([label, value]) => <Card key={label as string} className="p-5"><div className="text-sm text-slate-500">{label}</div><div className="mt-3 text-4xl font-semibold">{percent(value as number)}</div></Card>)}
    </div>
  );
}
