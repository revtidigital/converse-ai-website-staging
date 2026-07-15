import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { blogHref, getSubdomainHosts } from "@/lib/blogUrl";
import AdminShell from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Plus, Pencil, Trash2, Eye, Search, Filter, ChevronLeft, ChevronRight,
  CheckSquare, Square, BarChart2, RefreshCw, Archive, Globe, Clock, FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 25;

type PostStatus = "all" | "draft" | "published" | "scheduled" | "archived";

interface BlogPostRow {
  id: number; title: string; slug: string; status: string; seo_score: number;
  reading_time: number; publish_date: string | null; created_at: string;
  view_count: number; deleted_at: string | null;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    published: "bg-green-100 text-green-700",
    draft:     "bg-gray-100 text-gray-600",
    scheduled: "bg-blue-100 text-blue-700",
    archived:  "bg-orange-100 text-orange-700",
  };
  const icons: Record<string, React.ElementType> = {
    published: Globe, draft: FileText, scheduled: Clock, archived: Archive,
  };
  const Icon = icons[status] ?? FileText;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize", map[status] ?? map.draft)}>
      <Icon className="h-3 w-3" /> {status}
    </span>
  );
}

function SEOScore({ score }: { score: number }) {
  const color = score >= 75 ? "text-green-600 bg-green-50" : score >= 50 ? "text-yellow-600 bg-yellow-50" : "text-red-600 bg-red-50";
  return <span className={cn("text-xs font-semibold rounded px-1.5 py-0.5", color)}>{score}</span>;
}

const AdminBlog = () => {
  const { toast } = useToast();
  const { blogHost } = getSubdomainHosts();
  const cleanBlogHost = blogHost ? blogHost.replace(/^https?:\/\//, "") : "blog.theconverseai.com";
  const [posts, setPosts] = useState<BlogPostRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PostStatus>("all");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkAction, setBulkAction] = useState("");

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    let q = supabase
      .from("blog_posts")
      .select("id, title, slug, status, seo_score, reading_time, publish_date, created_at, view_count, deleted_at", { count: "exact" })
      .is("deleted_at", null)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

    if (statusFilter !== "all") q = q.eq("status", statusFilter);
    if (search.trim()) q = q.ilike("title", `%${search.trim()}%`);

    const { data, error, count } = await q;
    setLoading(false);
    if (error) toast({ title: "Failed to load posts", description: error.message, variant: "destructive" });
    else { setPosts((data ?? []) as BlogPostRow[]); setTotal(count ?? 0); }
  }, [page, search, statusFilter, toast]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);
  useEffect(() => { setPage(0); }, [search, statusFilter]);

  const softDelete = async (id: number, title: string) => {
    if (!window.confirm(`Are you sure you want to move "${title}" to the trash?`)) return;
    await supabase.from("blog_posts").update({ deleted_at: new Date().toISOString() }).eq("id", id);
    await supabase.from("blog_activity_log").insert({ action: "blog.deleted", resource_type: "blog", resource_id: id, resource_title: title });
    toast({ title: "Moved to trash" });
    fetchPosts();
  };

  const toggleSelect = (id: number) => setSelectedIds((s) => {
    const n = new Set(s);
    if (n.has(id)) n.delete(id);
    else n.add(id);
    return n;
  });
  const toggleAll = () => setSelectedIds(selectedIds.size === posts.length ? new Set() : new Set(posts.map((p) => p.id)));

  const runBulkAction = async () => {
    if (!bulkAction || selectedIds.size === 0) return;
    const ids = [...selectedIds];
    if (bulkAction === "trash") {
      if (!window.confirm(`Are you sure you want to move ${ids.length} selected post(s) to the trash?`)) return;
      await supabase.from("blog_posts").update({ deleted_at: new Date().toISOString() }).in("id", ids);
      toast({ title: `${ids.length} post(s) moved to trash` });
    } else if (["published", "draft", "archived"].includes(bulkAction)) {
      await supabase.from("blog_posts").update({ status: bulkAction }).in("id", ids);
      toast({ title: `${ids.length} post(s) set to ${bulkAction}` });
    }
    setSelectedIds(new Set()); setBulkAction("");
    fetchPosts();
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const from = page * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE + PAGE_SIZE, total);

  return (
    <AdminShell>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">Blog Posts</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{total} total posts</p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild className="bg-violet-600 hover:bg-violet-700">
              <Link to="/admin/blog/new"><Plus className="h-4 w-4 mr-1.5" /> New Post</Link>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search posts..." className="pl-9" value={search}
              onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            {(["all", "published", "draft", "scheduled", "archived"] as PostStatus[]).map((s) => (
              <button key={s} type="button"
                onClick={() => setStatusFilter(s)}
                className={cn("rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors",
                  statusFilter === s ? "bg-violet-600 text-white" : "bg-secondary text-muted-foreground hover:bg-secondary/80")}>
                {s}
              </button>
            ))}
          </div>
          <Button variant="ghost" size="sm" onClick={fetchPosts}><RefreshCw className="h-4 w-4" /></Button>
        </div>

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-3 rounded-lg border border-violet-200 bg-violet-50 px-4 py-2.5">
            <span className="text-sm font-medium text-violet-800">{selectedIds.size} selected</span>
            <select value={bulkAction} onChange={(e) => setBulkAction(e.target.value)}
              className="rounded border border-violet-300 bg-white px-2 py-1 text-sm">
              <option value="">Choose action...</option>
              <option value="published">Set Published</option>
              <option value="draft">Set Draft</option>
              <option value="archived">Set Archived</option>
              <option value="trash">Move to Trash</option>
            </select>
            <Button size="sm" disabled={!bulkAction} onClick={runBulkAction}
              className="bg-violet-600 hover:bg-violet-700">Apply</Button>
            <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>Clear</Button>
          </div>
        )}

        {/* Table */}
        <div className="rounded-xl border border-border/60 bg-white shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-secondary/20">
                <th className="px-4 py-3 text-left w-8">
                  <button type="button" onClick={toggleAll}>
                    {selectedIds.size === posts.length && posts.length > 0
                      ? <CheckSquare className="h-4 w-4 text-violet-600" />
                      : <Square className="h-4 w-4 text-muted-foreground" />}
                  </button>
                </th>
                <th className="px-4 py-3 text-left font-semibold">Title</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">SEO</th>
                <th className="px-4 py-3 text-left font-semibold hidden md:table-cell">Views</th>
                <th className="px-4 py-3 text-left font-semibold hidden lg:table-cell">Date</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/30">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 w-full animate-pulse rounded bg-secondary/60" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : posts.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-16 text-center text-muted-foreground">
                  {search ? "No posts match your search." : "No blog posts yet. Create your first one!"}
                </td></tr>
              ) : posts.map((post) => {
                const isPublished = post.status === "published";

                return (
                  <tr key={post.id} className={cn("border-b border-border/30 hover:bg-secondary/10 transition-colors", selectedIds.has(post.id) && "bg-violet-50/50")}>
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => toggleSelect(post.id)}>
                        {selectedIds.has(post.id)
                          ? <CheckSquare className="h-4 w-4 text-violet-600" />
                          : <Square className="h-4 w-4 text-muted-foreground" />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium line-clamp-1">{post.title}</p>
                        <p className="text-xs text-muted-foreground">{cleanBlogHost}/{post.slug}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={post.status} /></td>
                    <td className="px-4 py-3"><SEOScore score={post.seo_score} /></td>
                    <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{post.view_count.toLocaleString()}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs">
                      {post.publish_date ? new Date(post.publish_date).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {isPublished ? (
                          <Button size="sm" variant="ghost" asChild title="View published post">
                            <a href={blogHref(post.slug)} target="_blank" rel="noopener noreferrer"><Eye className="h-3.5 w-3.5" /></a>
                          </Button>
                        ) : (
                          <Button size="sm" variant="ghost" disabled title="Only published posts can be viewed">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" asChild>
                          <Link to={`/admin/blog/${post.id}/edit`}><Pencil className="h-3.5 w-3.5" /></Link>
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => softDelete(post.id, post.title)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > PAGE_SIZE && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Showing {from}–{to} of {total}</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">Page {page + 1} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Quick nav to sub-pages */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { to: "/admin/blog/trash", label: "🗑 Trash" },
            { to: "/admin/redirects", label: "↩ Redirects" },
            { to: "/admin/blog/categories", label: "#️⃣ Categories" },
          ].map((link) => (
            <Button key={link.to} variant="outline" className="w-full" asChild>
              <Link to={link.to}>{link.label}</Link>
            </Button>
          ))}
        </div>
      </div>
    </AdminShell>
  );
};

export default AdminBlog;
