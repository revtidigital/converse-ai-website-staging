import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import AdminShell from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, Plus, Pencil, Trash2, Search, RefreshCw, Save, X,
  ArrowRight, ChevronLeft, ChevronRight, Toggle3Right
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Redirect {
  id: number; old_url: string; new_url: string;
  redirect_type: number; is_active: boolean; source: string; created_at: string;
}

const AdminRedirects = () => {
  const { toast } = useToast();
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [oldUrl, setOldUrl] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [type, setType] = useState<301 | 302>(301);
  const [saving, setSaving] = useState(false);

  const fetchRedirects = useCallback(async () => {
    setLoading(true);
    let q = supabase
      .from("blog_redirects")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
    if (search.trim()) q = q.or(`old_url.ilike.%${search}%,new_url.ilike.%${search}%`);
    const { data, count } = await q;
    setRedirects((data ?? []) as Redirect[]);
    setTotal(count ?? 0);
    setLoading(false);
  }, [page, search]);

  useEffect(() => { fetchRedirects(); }, [fetchRedirects]);

  const openCreate = () => { setEditId(null); setOldUrl(""); setNewUrl(""); setType(301); setShowForm(true); };
  const openEdit = (r: Redirect) => { setEditId(r.id); setOldUrl(r.old_url); setNewUrl(r.new_url); setType(r.redirect_type as 301 | 302); setShowForm(true); };

  const save = async () => {
    if (!oldUrl.trim() || !newUrl.trim()) { toast({ title: "Both URLs are required", variant: "destructive" }); return; }
    if (oldUrl.trim() === newUrl.trim()) { toast({ title: "Old and new URL cannot be the same", variant: "destructive" }); return; }
    setSaving(true);
    try {
      if (editId) {
        const { error } = await supabase.from("blog_redirects").update({ old_url: oldUrl.trim(), new_url: newUrl.trim(), redirect_type: type }).eq("id", editId);
        if (error) throw error;
        toast({ title: "Redirect updated" });
      } else {
        const { error } = await supabase.from("blog_redirects").insert({ old_url: oldUrl.trim(), new_url: newUrl.trim(), redirect_type: type });
        if (error) throw error;
        toast({ title: "Redirect created" });
      }
      setShowForm(false);
      fetchRedirects();
    } catch (err: any) {
      toast({ title: "Failed to save redirect", description: err.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  const toggleActive = async (r: Redirect) => {
    await supabase.from("blog_redirects").update({ is_active: !r.is_active }).eq("id", r.id);
    fetchRedirects();
  };

  const deleteRedirect = async (id: number) => {
    if (!window.confirm("Delete this redirect?")) return;
    await supabase.from("blog_redirects").delete().eq("id", id);
    toast({ title: "Redirect deleted" });
    fetchRedirects();
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <AdminShell>
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild><Link to="/admin/blog"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Link></Button>
            <div>
              <h1 className="text-2xl font-bold">301 Redirects</h1>
              <p className="text-sm text-muted-foreground">{total} redirect rules</p>
            </div>
          </div>
          <Button onClick={openCreate} className="bg-violet-600 hover:bg-violet-700">
            <Plus className="h-4 w-4 mr-1.5" /> New Redirect
          </Button>
        </div>

        {/* Inline form */}
        {showForm && (
          <div className="rounded-xl border border-violet-200 bg-violet-50 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{editId ? "Edit Redirect" : "Create Redirect"}</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}><X className="h-4 w-4" /></Button>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto_1fr_auto]  items-end">
              <div className="space-y-1.5">
                <Label>Old URL (from)</Label>
                <Input placeholder="/old-blog-post-slug" value={oldUrl} onChange={(e) => setOldUrl(e.target.value)} />
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground hidden md:block mb-2" />
              <div className="space-y-1.5">
                <Label>New URL (to)</Label>
                <Input placeholder="/new-blog-post-slug" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Type</Label>
                <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={type} onChange={(e) => setType(Number(e.target.value) as 301 | 302)}>
                  <option value={301}>301 Permanent</option>
                  <option value={302}>302 Temporary</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={save} disabled={saving} className="bg-violet-600 hover:bg-violet-700">
                <Save className="h-4 w-4 mr-1.5" /> {saving ? "Saving…" : "Save Redirect"}
              </Button>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search URLs…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Button variant="ghost" size="sm" onClick={fetchRedirects}><RefreshCw className="h-4 w-4" /></Button>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border/60 bg-white shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-secondary/20">
                <th className="px-4 py-3 text-left font-semibold">From (Old URL)</th>
                <th className="px-4 py-3 text-left font-semibold">To (New URL)</th>
                <th className="px-4 py-3 text-left font-semibold hidden md:table-cell">Type</th>
                <th className="px-4 py-3 text-left font-semibold hidden lg:table-cell">Source</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/30">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 animate-pulse rounded bg-secondary/60" /></td>
                    ))}
                  </tr>
                ))
              ) : redirects.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-16 text-center text-muted-foreground">
                  {search ? "No redirects match your search." : "No redirects yet. Create your first redirect rule."}
                </td></tr>
              ) : redirects.map((r) => (
                <tr key={r.id} className={cn("border-b border-border/30 hover:bg-secondary/10", !r.is_active && "opacity-50")}>
                  <td className="px-4 py-3 font-mono text-xs max-w-[180px] truncate">{r.old_url}</td>
                  <td className="px-4 py-3 font-mono text-xs text-violet-600 max-w-[180px] truncate">{r.new_url}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={cn("rounded px-1.5 py-0.5 text-xs font-semibold", r.redirect_type === 301 ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700")}>
                      {r.redirect_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground capitalize">{r.source}</td>
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => toggleActive(r)}
                      className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", r.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500")}>
                      {r.is_active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => deleteRedirect(r.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {total > PAGE_SIZE && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Showing {page * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE + PAGE_SIZE, total)} of {total}</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
};

export default AdminRedirects;
