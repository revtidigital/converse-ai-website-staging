import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import AdminShell from "@/components/admin/AdminShell";
import { useBlogAuthors, type BlogAuthor } from "@/hooks/useBlogAuthors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, Plus, Pencil, Trash2, Save, X, User
} from "lucide-react";

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
}

const EMPTY: Partial<BlogAuthor> = {
  name: "", slug: "", avatar_url: "", designation: "", bio: "",
  social_links: { twitter: "", linkedin: "", website: "" },
};

const AdminBlogAuthors = () => {
  const { toast } = useToast();
  const { authors, loading, saveAuthor, deleteAuthor } = useBlogAuthors();
  const [form, setForm] = useState<Partial<BlogAuthor>>(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const openCreate = () => { setForm(EMPTY); setShowForm(true); };
  const openEdit = (a: BlogAuthor) => {
    setForm({
      ...a,
      social_links: typeof a.social_links === "object" && a.social_links !== null
        ? a.social_links as Record<string, string>
        : { twitter: "", linkedin: "", website: "" },
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name?.trim()) { toast({ title: "Name is required", variant: "destructive" }); return; }
    setSaving(true);
    try {
      await saveAuthor({
        ...form,
        name: form.name!.trim(),
        slug: form.slug?.trim() || slugify(form.name!),
      } as any);
      toast({ title: form.id ? "Author updated" : "Author created" });
      setShowForm(false);
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  const handleDelete = async (a: BlogAuthor) => {
    if (!window.confirm(`Delete author "${a.name}"? Posts will lose their author association.`)) return;
    try {
      await deleteAuthor(a.id);
      toast({ title: "Author deleted" });
    } catch (err: any) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    }
  };

  const setSocial = (key: string, val: string) =>
    setForm((f) => ({ ...f, social_links: { ...(f.social_links as Record<string, string>), [key]: val } }));

  return (
    <AdminShell>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/blog"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Blog Authors</h1>
              <p className="text-sm text-muted-foreground">{authors.length} author{authors.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
          <Button onClick={openCreate} className="bg-violet-600 hover:bg-violet-700">
            <Plus className="h-4 w-4 mr-1.5" /> New Author
          </Button>
        </div>

        {/* Inline form */}
        {showForm && (
          <div className="rounded-xl border border-violet-200 bg-violet-50 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{form.id ? "Edit Author" : "New Author"}</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}><X className="h-4 w-4" /></Button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Full Name *</Label>
                <Input placeholder="e.g. Janvi Shah" value={form.name ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))} />
              </div>
              <div className="space-y-1.5">
                <Label>URL Slug</Label>
                <Input placeholder="auto-generated" value={form.slug ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Designation / Title</Label>
                <Input placeholder="e.g. AI Research Lead" value={form.designation ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, designation: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Avatar URL</Label>
                <Input placeholder="https://..." value={form.avatar_url ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, avatar_url: e.target.value }))} />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Bio</Label>
                <Textarea rows={3} placeholder="Short author bio..." value={form.bio ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} />
              </div>
              {/* Social links */}
              <div className="space-y-1.5">
                <Label>Twitter / X URL</Label>
                <Input placeholder="https://twitter.com/..." value={(form.social_links as any)?.twitter ?? ""}
                  onChange={(e) => setSocial("twitter", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>LinkedIn URL</Label>
                <Input placeholder="https://linkedin.com/in/..." value={(form.social_links as any)?.linkedin ?? ""}
                  onChange={(e) => setSocial("linkedin", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Personal Website</Label>
                <Input placeholder="https://..." value={(form.social_links as any)?.website ?? ""}
                  onChange={(e) => setSocial("website", e.target.value)} />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-violet-600 hover:bg-violet-700">
                <Save className="h-4 w-4 mr-1.5" /> {saving ? "Saving…" : "Save Author"}
              </Button>
            </div>
          </div>
        )}

        {/* Author grid */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-xl bg-secondary/40" />
            ))}
          </div>
        ) : authors.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-border/60 py-16 text-center text-muted-foreground">
            <User className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>No authors yet. Create your first author.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {authors.map((a) => (
              <div key={a.id} className="flex gap-4 rounded-xl border border-border/60 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                {a.avatar_url ? (
                  <img src={a.avatar_url} alt={a.name} className="h-14 w-14 rounded-full object-cover shrink-0 border border-border/40" />
                ) : (
                  <div className="h-14 w-14 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-lg shrink-0">
                    {a.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{a.name}</p>
                  {a.designation && <p className="text-xs text-muted-foreground truncate">{a.designation}</p>}
                  {a.bio && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.bio}</p>}
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => openEdit(a)}>
                      <Pencil className="h-3 w-3 mr-1" /> Edit
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(a)}>
                      <Trash2 className="h-3 w-3 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
};

export default AdminBlogAuthors;
