import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminShell from "@/components/admin/AdminShell";
import { useAllBlogPosts } from "@/hooks/useBlogPosts";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, ExternalLink, Eye, EyeOff } from "lucide-react";

const AdminBlog = () => {
  const { posts, loading, error, refetch } = useAllBlogPosts();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteTitle, setDeleteTitle] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    const { error: deleteError } = await supabase.from("blog_posts").delete().eq("id", deleteId);
    setDeleting(false);
    setDeleteId(null);
    setDeleteTitle(null);
    if (deleteError) {
      toast({ title: "Delete failed", description: deleteError.message, variant: "destructive" });
    } else {
      toast({ title: "Blog post deleted" });
      refetch();
    }
  }

  async function togglePublish(id: number, currentVal: boolean) {
    const { error: updateError } = await supabase.from("blog_posts").update({ is_published: !currentVal }).eq("id", id);
    if (updateError) {
      toast({ title: "Failed to update", description: updateError.message, variant: "destructive" });
    } else {
      toast({ title: currentVal ? "Post unpublished" : "Post published!" });
      refetch();
    }
  }

  return (
    <AdminShell>
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Blog Posts</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Create and manage blog posts with rich text content, SEO fields, and related links.
            </p>
          </div>
          <Button asChild>
            <Link to="/admin/blog/new">
              <Plus className="mr-1.5 h-4 w-4" />
              New Post
            </Link>
          </Button>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
          </div>
        )}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
            Failed to load blog posts: {error}
          </div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className="rounded-xl border border-border/60 bg-white p-12 text-center">
            <p className="mb-4 text-muted-foreground">No blog posts yet.</p>
            <Button asChild>
              <Link to="/admin/blog/new">
                <Plus className="mr-1.5 h-4 w-4" />
                Create your first post
              </Link>
            </Button>
          </div>
        )}

        {!loading && !error && posts.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-border/60 bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="hidden lg:table-cell">Read Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <p className="text-sm font-semibold text-foreground line-clamp-1">{post.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">/blog/{post.slug}</p>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700">
                        {post.category}
                      </span>
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                      {post.published_date}
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                      {post.read_time}
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => togglePublish(post.id, post.is_published)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
                          post.is_published
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                        title={post.is_published ? "Click to unpublish" : "Click to publish"}
                      >
                        {post.is_published ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        {post.is_published ? "Published" : "Draft"}
                      </button>
                    </TableCell>
                    <TableCell className="text-right">
                      {post.is_published && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" aria-label="View live">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/admin/blog/${post.id}/edit`} aria-label="Edit">
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => { setDeleteId(post.id); setDeleteTitle(post.title); }}
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && (setDeleteId(null), setDeleteTitle(null))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete blog post?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deleteTitle}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700">
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminShell>
  );
};

export default AdminBlog;
