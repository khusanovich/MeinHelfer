"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, ClipboardList, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { removeToken } from "@/lib/auth";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/requests", label: "Anfragen", icon: ClipboardList },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function logout() {
    removeToken();
    router.replace("/admin/login");
  }

  return (
    <aside className="flex h-full w-56 flex-col border-r bg-slate-900 text-slate-100">
      <div className="flex h-16 items-center border-b border-slate-700 px-5">
        <span className="text-lg font-bold text-white">MeinHelfer</span>
        <span className="ml-2 rounded bg-slate-700 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-300">
          Admin
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname.startsWith(href)
                ? "bg-primary text-white"
                : "text-slate-300 hover:bg-slate-800 hover:text-white",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-slate-700 p-3">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Abmelden
        </button>
      </div>
    </aside>
  );
}
