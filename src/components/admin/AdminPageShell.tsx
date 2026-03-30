import Link from "next/link";
import type { ReactNode } from "react";
import AdminSessionGuard from "@/components/admin/AdminSessionGuard";

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
    return "admin-grid-tab admin-grid-tab-active";
  }

  return "admin-grid-tab";
}

function AdminNavGlyph({ view }: { view: AdminView }) {
  if (view === "chat-logs") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]">
        <path
          d="M7.75 8.25h8.5M7.75 12h6.5M8.75 18.25h6.5a3.5 3.5 0 0 0 3.5-3.5V8.75a3.5 3.5 0 0 0-3.5-3.5h-6.5a3.5 3.5 0 0 0-3.5 3.5v8.5l2.2-1.78a2 2 0 0 1 1.3-.47Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (view === "site-visits") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]">
        <path
          d="M12 20.25c4.56 0 8.25-3.69 8.25-8.25S16.56 3.75 12 3.75 3.75 7.44 3.75 12 7.44 20.25 12 20.25Z"
          stroke="currentColor"
          strokeWidth="1.7"
        />
        <path d="M12 3.75c2.1 2.3 3.25 5.23 3.25 8.25S14.1 17.95 12 20.25" stroke="currentColor" strokeWidth="1.7" />
        <path d="M12 3.75C9.9 6.05 8.75 8.98 8.75 12S9.9 17.95 12 20.25" stroke="currentColor" strokeWidth="1.7" />
        <path d="M4.25 12h15.5" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]">
      <path
        d="M3.75 7.75A2.75 2.75 0 0 1 6.5 5h3.18c.55 0 1.07.21 1.46.59l1.11 1.07c.39.38.92.59 1.46.59h3.79a2.75 2.75 0 0 1 2.75 2.75v6.75A2.75 2.75 0 0 1 17.5 19.5h-11A2.75 2.75 0 0 1 3.75 16.75v-9Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

export default function AdminPageShell({ activeView, children }: AdminPageShellProps) {
  return (
    <main className="admin-shell w-full px-3 pb-8 pt-4 sm:px-4 lg:px-6">
      <AdminSessionGuard />
      <section className="admin-grid-page">
        <div className="admin-grid-header">
          <div className="admin-shell-title-block">
            <div>
              <h1 className="section-title text-3xl font-normal md:text-4xl">Admin Dashboard</h1>
              <p className="admin-shell-subtitle">Portfolio logs, traffic insights, and managed project content.</p>
            </div>
          </div>
          <form action="/admin/logout" method="post">
            <button type="submit" className="admin-grid-button admin-grid-button-secondary">
              Log Out
            </button>
          </form>
        </div>

        <div className="admin-grid-nav">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className={getNavButtonClass(item.view === activeView)}>
              <span className="admin-grid-tab-icon">
                <AdminNavGlyph view={item.view} />
              </span>
              {item.label}
            </Link>
          ))}
        </div>

        {children}
      </section>
    </main>
  );
}
