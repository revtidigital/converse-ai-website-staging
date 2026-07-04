import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import AdminShell from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, RefreshCw, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityEntry {
  id: number; user_email: string; action: string; resource_type: string;
  resource_id: number | null; resource_title: string; metadata: Record<string, unknown>; created_at: string;
}

function actionColor(action: string): string {
  if (action.includes("created") || action.includes("import")) return "bg-green-100 text-green-700";
  if (action.includes("updated") || action.includes("restored")) return "bg-blue-100 text-blue-700";
  if (action.includes("deleted") || action.includes("trash")) return "bg-red-100 text-red-700";
  if (action.includes("scheduler") || action.includes("system")) return "bg-purple-100 text-purple-700";
  return "bg-gray-100 text-gray-600";
}

const PAGE_SIZE = 50;

const AdminActivityLog = () => {
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    let q = supabase
      .from("blog_activity_log")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
    if (search.trim()) q = q.or(`action.ilike.%${search}%,resource_title.ilike.%${search}%,user_email.ilike.%${search}%`);
    if (typeFilter !== "all") q = q.eq("resource_type", typeFilter);
    const { data, count } = await q;
    setEntries((data ?? []) as ActivityEntry[]);
    setTotal(count ?? 0);
    setLoading(false);
  }, [page, search, typeFilter]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);
  useEffect(() => { setPage(0); }, [search, typeFilter]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const from = page * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE + PAGE_SIZE, total);

  return (
    <AdminShell>
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild><Link to="/admin/blog"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Link></Button>
          <div>
            <h1 className="text-2xl font-bold">Activity Log</h1>
            <p className="text-sm text-muted-foreground">{total} events recorded</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search actions, emails…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            {["all", "blog", "system"].map((t) => (
              <button key={t} type="button" onClick={() => setTypeFilter(t)}
                className={cn("rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors",
                  typeFilter === t ? "bg-violet-600 text-white" : "bg-secondary text-muted-foreground hover:bg-secondary/80")}>
                {t}
              </button>
            ))}
          </div>
          <Button variant="ghost" size="sm" onClick={fetchEntries}><RefreshCw className="h-4 w-4" /></Button>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border/60 bg-white shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-secondary/20">
                <th className="px-4 py-3 text-left font-semibold">Time</th>
                <th className="px-4 py-3 text-left font-semibold">Action</th>
                <th className="px-4 py-3 text-left font-semibold">Resource</th>
                <th className="px-4 py-3 text-left font-semibold hidden lg:table-cell">User</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/30">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 animate-pulse rounded bg-secondary/60" /></td>
                    ))}
                  </tr>
                ))
              ) : entries.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-16 text-center text-muted-foreground">No activity recorded yet</td></tr>
              ) : entries.map((entry) => (
                <tr key={entry.id} className="border-b border-border/30 hover:bg-secondary/10">
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(entry.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", actionColor(entry.action))}>
                      {entry.action}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium line-clamp-1">{entry.resource_title || "—"}</p>
                    {entry.resource_id && <p className="text-xs text-muted-foreground">#{entry.resource_id}</p>}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground">{entry.user_email || "system"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {total > PAGE_SIZE && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Showing {from}–{to} of {total}</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
              <span className="text-sm font-medium">{page + 1} / {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
};

export default AdminActivityLog;
