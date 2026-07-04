import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminShell from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, RotateCcw, Trash2, Search, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";

interface TrashedPost { id: number; title: string; slug: string; deleted_at: string; status: string; }

const PAGE_SIZE = 25;

const AdminBlogTrash = () => {
  const { toast } = useToast();
  const [posts, setPosts] = useState<TrashedPost[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");

  const fetchPosts = async () => {
    setLoading(true);
    let q = supabase.from("blog_posts")
      .select("id, title, slug, deleted_at, status", { count: "exact" })
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
    if (search.trim()) q = q.ilike("title", `%${search.trim()}%`);
    const { data, count } = await q;
    setPosts((data ?? []) as TrashedPost[]);
    setTotal(count ?? 0);
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, [page, search]);

  const restore = async (id: number, title: string) => {
    await supabase.from("blog_posts").update({ deleted_at: null, deleted_by: null }).eq("id", id);
    toast({ title: `"${title}" restored` });
    fetchPosts();
  };

  const permanentDelete = async (id: number, title: string) => {
    if (!window.confirm(`Permanently delete "${title}"? This cannot be undone.`)) return;
    await supabase.from("blog_posts").delete().eq("id", id);
    toast({ title: "Post permanently deleted" });
    fetchPosts();
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <AdminShell>
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild><Link to="/admin/blog"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Link></Button>
          <div>
            <h1 className="text-2xl font-bold">Trash</h1>
            <p className="text-sm text-muted-foreground">Posts are auto-purged after 30 days</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search trash..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Button variant="ghost" size="sm" onClick={fetchPosts}><RefreshCw className="h-4 w-4" /></Button>
        </div>

        <div className="rounded-xl border border-border/60 bg-white shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-secondary/20">
                <th className="px-4 py-3 text-left font-semibold">Title</th>
                <th className="px-4 py-3 text-left font-semibold hidden md:table-cell">Deleted</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/30">
                    <td className="px-4 py-3"><div className="h-4 w-48 animate-pulse rounded bg-secondary/60" /></td>
                    <td className="px-4 py-3 hidden md:table-cell"><div className="h-4 w-24 animate-pulse rounded bg-secondary/60" /></td>
                    <td className="px-4 py-3"><div className="h-8 w-32 animate-pulse rounded bg-secondary/60 ml-auto" /></td>
                  </tr>
                ))
              ) : posts.length === 0 ? (
                <tr><td colSpan={3} className="px-4 py-16 text-center text-muted-foreground">Trash is empty</td></tr>
              ) : posts.map((post) => (
                <tr key={post.id} className="border-b border-border/30 hover:bg-secondary/10">
                  <td className="px-4 py-3">
                    <p className="font-medium line-clamp-1">{post.title}</p>
                    <p className="text-xs text-muted-foreground">/blog/{post.slug}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground">
                    {new Date(post.deleted_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => restore(post.id, post.title)}>
                        <RotateCcw className="h-3.5 w-3.5 mr-1" /> Restore
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50"
                        onClick={() => permanentDelete(post.id, post.title)}>
                        <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
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

export default AdminBlogTrash;
