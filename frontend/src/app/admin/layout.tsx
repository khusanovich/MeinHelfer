"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import { isAuthenticated } from "@/lib/auth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (pathname === "/admin/login") {
      setReady(true);
      return;
    }
    if (!isAuthenticated()) {
      router.replace("/admin/login");
    } else {
      setReady(true);
    }
  }, [pathname, router]);

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900">
        <div className="text-slate-400">Laden…</div>
      </div>
    );
  }

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-muted/20">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
