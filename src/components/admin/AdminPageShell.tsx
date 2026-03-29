import Link from "next/link";
import type { ReactNode } from "react";

type AdminView = "chat-logs" | "site-visits" | "projects";

type AdminPageShellProps = {
  activeView: AdminView;
  children: ReactNode;
};

const NAV_ITEMS: Array<{ href: string; label: string; view: AdminView }> = [
  { href: "/admin/chat-logs", label: "Chat Logs", view: "chat-logs" },
  { href: "/admin/site-visits", label: "Site Visits", view: "site-visits" },
  { href: "/admin/projects", label: "Projects", view: "projects" },
];

function getNavButtonClass(isActive: boolean) {
  if (isActive) {
    return "admin-grid-button border-white/20 bg-white/[0.08] text-white";
  }

  return "admin-grid-button admin-grid-button-secondary";
}

export default function AdminPageShell({ activeView, children }: AdminPageShellProps) {
  return (
    <main className="min-h-screen w-full px-3 pb-8 pt-4 sm:px-4 lg:px-6">
      <section className="admin-grid-page">
        <div className="admin-grid-header">
          <div>
            <div className="admin-grid-kicker">Protected Admin</div>
            <h1 className="section-title mt-2 text-3xl font-normal md:text-4xl">Admin Dashboard</h1>
          </div>
          <form action="/admin/logout" method="post">
            <button type="submit" className="admin-grid-button admin-grid-button-secondary">
              Log Out
            </button>
          </form>
        </div>

        <div className="flex flex-wrap gap-3 border-b border-white/8 px-5 py-4">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className={getNavButtonClass(item.view === activeView)}>
              {item.label}
            </Link>
          ))}
        </div>

        {children}
      </section>
    </main>
  );
}
