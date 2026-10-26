import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  LayoutDashboard, Megaphone, Users, Table2, Lightbulb, Info, PanelLeftClose, PanelLeftOpen, Upload, Landmark, Menu, Database,
} from "lucide-react";
import { useDataset } from "@/lib/dataset-store";
import { Button } from "@/components/ui/button";
import { UploadDialog } from "./UploadDialog";
import { cn } from "@/lib/utils";

export const NAV = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/campaigns", label: "Campaign Analysis", icon: Megaphone },
  { to: "/segments", label: "Customer Segmentation", icon: Users },
  { to: "/explorer", label: "Data Explorer", icon: Table2 },
  { to: "/insights", label: "Insights & Recommendations", icon: Lightbulb },
  { to: "/about", label: "About Project", icon: Info },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const current = NAV.find((n) => n.to === path) ?? NAV[0];
  const { dataset, setUploadOpen } = useDataset();

  const nav = (
    <nav className="flex flex-col gap-1 px-3" aria-label="Main">
      {NAV.map((n) => {
        const active = n.to === path;
        return (
          <Link
            key={n.to}
            to={n.to}
            onClick={() => setMobileOpen(false)}
            title={collapsed ? n.label : undefined}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            )}
          >
            <n.icon className={cn("h-4 w-4 shrink-0", active && "text-sidebar-primary")} />
            {!collapsed && <span className="truncate">{n.label}</span>}
          </Link>
        );
      })}
    </nav>
  );

  const brand = (
    <div className="flex h-16 items-center gap-3 px-5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
        <Landmark className="h-4 w-4" />
      </div>
      {!collapsed && (
        <div className="leading-tight">
          <div className="font-display text-sm font-bold text-sidebar-accent-foreground">CampaignLens</div>
          <div className="text-[11px] text-sidebar-foreground/60">Bank Marketing Analytics</div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 md:flex",
          collapsed ? "w-[72px]" : "w-64",
        )}
      >
        {brand}
        <div className="mt-4 flex-1">{nav}</div>
        <div className="p-3">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            {!collapsed && "Collapse"}
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-sidebar">
            {brand}
            <div className="mt-4">{nav}</div>
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-card/90 px-4 backdrop-blur md:px-8">
          <button className="md:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="truncate text-base font-bold md:text-lg">{current.label}</h1>
          <div className="ml-auto flex items-center gap-3">
            <DatasetStatus />
            <Button size="sm" onClick={() => setUploadOpen(true)}>
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">{dataset ? "Replace data" : "Upload CSV"}</span>
            </Button>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
      <UploadDialog />
    </div>
  );
}

function DatasetStatus() {
  const { dataset } = useDataset();
  if (!dataset)
    return (
      <span className="hidden items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground sm:flex">
        <span className="h-2 w-2 rounded-full bg-muted-foreground/40" /> No dataset loaded
      </span>
    );
  const demo = dataset.source === "demo";
  return (
    <span
      className={cn(
        "hidden max-w-[280px] items-center gap-2 rounded-full border px-3 py-1 text-xs sm:flex",
        demo ? "border-warning bg-warning-soft text-warning-foreground" : "border-primary/30 bg-accent text-accent-foreground",
      )}
    >
      <Database className="h-3 w-3 shrink-0" />
      <span className="truncate">{demo ? "DEMO DATA · synthetic" : dataset.name}</span>
      <span className="opacity-70">· {dataset.rows.length.toLocaleString()} rows</span>
    </span>
  );
}
