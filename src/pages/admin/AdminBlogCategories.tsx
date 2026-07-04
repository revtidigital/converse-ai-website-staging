import { useState } from "react";
import { Link } from "react-router-dom";
import AdminShell from "@/components/admin/AdminShell";
import { useBlogCategories } from "@/hooks/useBlogCategories";
import { useBlogTags } from "@/hooks/useBlogTags";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Trash2, Save, X, Hash, FolderOpen } from "lucide-react";

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
}

const AdminBlogCategories = () => {
  const { toast } = useToast();
  const { categories, upsertCategory, deleteCategory } = useBlogCategories();
  const { tags, upsertTag, deleteTag } = useBlogTags();

  const [newCatName, setNewCatName] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [savingCat, setSavingCat] = useState(false);
  const [savingTag, setSavingTag] = useState(false);

  const addCategory = async () => {
    if (!newCatName.trim()) return;
    setSavingCat(true);
    try {
      await upsertCategory(newCatName.trim(), slugify(newCatName));
      setNewCatName("");
      toast({ title: "Category added" });
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    } finally { setSavingCat(false); }
  };

  const addTag = async () => {
    if (!newTagName.trim()) return;
    setSavingTag(true);
    try {
      await upsertTag(newTagName.trim(), slugify(newTagName));
      setNewTagName("");
      toast({ title: "Tag added" });
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    } finally { setSavingTag(false); }
  };

  const removeCat = async (id: number, name: string) => {
    if (!window.confirm(`Delete category "${name}"? This will remove it from all posts.`)) return;
    try { await deleteCategory(id); toast({ title: "Category deleted" }); }
    catch (err: any) { toast({ title: "Delete failed", description: err.message, variant: "destructive" }); }
  };

  const removeTag = async (id: number, name: string) => {
    if (!window.confirm(`Delete tag "${name}"? This will remove it from all posts.`)) return;
    try { await deleteTag(id); toast({ title: "Tag deleted" }); }
    catch (err: any) { toast({ title: "Delete failed", description: err.message, variant: "destructive" }); }
  };

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/blog"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Link>
          </Button>
          <h1 className="text-2xl font-bold">Categories & Tags</h1>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* ─── Categories ────────────────────────────────────────────── */}
          <div className="rounded-xl border border-border/60 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-border/40 bg-secondary/10">
              <FolderOpen className="h-4 w-4 text-violet-600" />
              <h2 className="font-semibold">Categories</h2>
              <span className="ml-auto text-xs text-muted-foreground">{categories.length} total</span>
            </div>

            {/* Add form */}
            <div className="px-5 py-4 border-b border-border/40 flex gap-2">
              <Input
                placeholder="New category name…"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCategory()}
                className="flex-1"
              />
              <Button onClick={addCategory} disabled={savingCat || !newCatName.trim()} className="bg-violet-600 hover:bg-violet-700 shrink-0">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* List */}
            <ul className="divide-y divide-border/40 max-h-80 overflow-y-auto">
              {categories.length === 0 ? (
                <li className="px-5 py-8 text-center text-sm text-muted-foreground">No categories yet</li>
              ) : categories.map((cat) => (
                <li key={cat.id} className="flex items-center gap-3 px-5 py-2.5 hover:bg-secondary/10">
                  <FolderOpen className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{cat.name}</p>
                    <p className="text-xs text-muted-foreground truncate">/{cat.slug}</p>
                  </div>
                  <button type="button" onClick={() => removeCat(cat.id, cat.name)}
                    className="shrink-0 text-red-400 hover:text-red-600 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* ─── Tags ──────────────────────────────────────────────────── */}
          <div className="rounded-xl border border-border/60 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-border/40 bg-secondary/10">
              <Hash className="h-4 w-4 text-blue-500" />
              <h2 className="font-semibold">Tags</h2>
              <span className="ml-auto text-xs text-muted-foreground">{tags.length} total</span>
            </div>

            {/* Add form */}
            <div className="px-5 py-4 border-b border-border/40 flex gap-2">
              <Input
                placeholder="New tag name…"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTag()}
                className="flex-1"
              />
              <Button onClick={addTag} disabled={savingTag || !newTagName.trim()} className="bg-blue-600 hover:bg-blue-700 shrink-0">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Cloud display */}
            <div className="px-5 py-4 flex flex-wrap gap-2 max-h-80 overflow-y-auto">
              {tags.length === 0 ? (
                <p className="text-sm text-muted-foreground w-full text-center py-8">No tags yet</p>
              ) : tags.map((tag) => (
                <span key={tag.id}
                  className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 group">
                  <Hash className="h-3 w-3" />
                  {tag.name}
                  <button type="button" onClick={() => removeTag(tag.id, tag.name)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600 ml-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Info note */}
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <strong>Note:</strong> Deleting a category or tag removes it from all associated blog posts. This action cannot be undone.
        </div>
      </div>
    </AdminShell>
  );
};

export default AdminBlogCategories;
