import type { Metadata } from "next";
import type { ReactNode } from "react";
import { BarChart3, CalendarClock, LayoutDashboard, Send, Settings2, UsersRound, Video } from "lucide-react";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Outreach CRM",
  description: "Track prospects, demos, follow-ups, replies, and outreach templates."
};

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/prospects", label: "Prospects", icon: UsersRound },
  { href: "/follow-ups", label: "Follow-ups", icon: CalendarClock },
  { href: "/meetings", label: "Meetings", icon: Video },
  { href: "/templates", label: "Templates", icon: Send },
  { href: "/stats", label: "Stats", icon: BarChart3 }
];

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-sans">
        <div className="min-h-screen lg:grid lg:grid-cols-[248px_1fr]">
          <aside className="border-b border-line bg-white lg:min-h-screen lg:border-b-0 lg:border-r">
            <div className="flex items-center gap-3 px-5 py-5">
              <div className="grid size-10 place-items-center rounded-lg bg-pine text-white">
                <Settings2 size={20} />
              </div>
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-pine">Outreach</div>
                <div className="text-lg font-semibold text-ink">Pipeline CRM</div>
              </div>
            </div>
            <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:block lg:space-y-1 lg:overflow-visible lg:px-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className="flex min-w-fit items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-field hover:text-ink"
                  >
                    <Icon size={18} />
                    {item.label}
                  </a>
                );
              })}
            </nav>
          </aside>
          <main className="min-w-0 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
