import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import AdminShell from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";
import RichTextEditor from "@/components/admin/RichTextEditor";

const CATEGORIES = [
  "AI Chatbots",
  "Automation",
  "Voice AI",
  "Marketing",
  "WhatsApp",
  "Customer Support",
  "Analytics",
  "Case Study",
];

interface RelatedLink {
  label: string;
  url: string;
  description: string;
}

interface FormValues {
  slug: string;
  title: string;
  seo_title: string;
  meta_description: string;
  category: string;
  excerpt: string;
  content: string;
  hero_image: string;
  author_name: string;
  author_role: string;
  author_avatar: string;
  read_time: string;
  published_date: string;
  tags: string;
  is_published: boolean;
  display_order: number;
  related_page_links: RelatedLink[];
  canonical_url: string;
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const AdminBlogForm = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loadingData, setLoadingData] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [titleChanged, setTitleChanged] = useState(false);
  
  // WordPress Import States
  const [wpUrl, setWpUrl] = useState("");
  const [importing, setImporting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      slug: "",
      title: "",
      seo_title: "",
      meta_description: "",
      category: CATEGORIES[0],
      excerpt: "",
      content: "",
      hero_image: "",
      author_name: "",
      author_role: "",
      author_avatar: "",
      read_time: "5 min read",
      published_date: new Date().toISOString().split("T")[0],
      tags: "",
      is_published: false,
      display_order: 99,
      related_page_links: [],
      canonical_url: "",
    },
  });

  const { fields: linkFields, append: appendLink, remove: removeLink } = useFieldArray({
    control,
    name: "related_page_links",
  });

  const watchTitle = watch("title");
  const watchSeoTitle = watch("seo_title");
  const watchMetaDesc = watch("meta_description");
  const watchContent = watch("content");

  // Auto-generate slug from title (only when not editing and user hasn't manually set it)
  useEffect(() => {
    if (!isEdit && watchTitle && !titleChanged) {
      setValue("slug", slugify(watchTitle));
    }
  }, [watchTitle, isEdit, titleChanged, setValue]);

  // Load existing post for edit
  useEffect(() => {
    if (!isEdit) return;
    setLoadingData(true);
    supabase
      .from("blog_posts")
      .select("*")
      .eq("id", Number(id))
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          toast({ title: "Failed to load post", variant: "destructive" });
          navigate("/admin/blog");
          return;
        }
        const links = Array.isArray(data.related_page_links)
          ? (data.related_page_links as RelatedLink[])
          : [];
        reset({
          slug: data.slug,
          title: data.title,
          seo_title: data.seo_title ?? "",
          meta_description: data.meta_description ?? "",
          category: data.category,
          excerpt: data.excerpt,
          content: data.content,
          hero_image: data.hero_image,
          author_name: data.author_name,
          author_role: data.author_role,
          author_avatar: data.author_avatar,
          read_time: data.read_time,
          published_date: data.published_date,
          tags: (data.tags ?? []).join(", "),
          is_published: data.is_published,
          display_order: data.display_order,
          related_page_links: links,
          canonical_url: data.canonical_url ?? "",
        });
        setLoadingData(false);
      });
  }, [id, isEdit, reset, navigate, toast]);

  const handleWordPressImport = async () => {
    if (!wpUrl.trim()) {
      toast({ title: "Please enter a WordPress post URL", variant: "destructive" });
      return;
    }
    
    setImporting(true);
    try {
      const urlObj = new URL(wpUrl.trim());
      const domain = urlObj.origin;
      const pathParts = urlObj.pathname.split("/").filter(Boolean);
      const slug = pathParts[pathParts.length - 1];
      
      if (!slug) {
        throw new Error("Could not extract post slug from URL.");
      }
      
      const apiUrl = `${domain}/wp-json/wp/v2/posts?slug=${slug}&_embed=1`;
      const res = await fetch(apiUrl);
      
      if (!res.ok) {
        throw new Error(`WordPress API returned status ${res.status}`);
      }
      
      const posts = await res.json();
      if (!Array.isArray(posts) || posts.length === 0) {
        throw new Error("No post found with this slug. Please verify the URL.");
      }
      
      const wpPost = posts[0];
      const title = wpPost.title?.rendered || "";
      const content = wpPost.content?.rendered || "";
      const rawExcerpt = wpPost.excerpt?.rendered || "";
      const excerpt = rawExcerpt.replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, "").trim();
      
      let heroImage = "";
      if (wpPost._embedded?.["wp:featuredmedia"]?.[0]?.source_url) {
        heroImage = wpPost._embedded["wp:featuredmedia"][0].source_url;
      } else {
        const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
        if (imgMatch) {
          heroImage = imgMatch[1];
        }
      }
      
      const authorName = wpPost._embedded?.author?.[0]?.name || "ConverseAI Team";
      const authorAvatar = wpPost._embedded?.author?.[0]?.avatar_urls?.["96"] || "";
      const seoTitle = wpPost.yoast_head_json?.title || title;
      const metaDescription = wpPost.yoast_head_json?.description || excerpt;
      const canonicalUrl = wpPost.yoast_head_json?.canonical || wpUrl.trim();
      const publishedDate = wpPost.date ? wpPost.date.split("T")[0] : new Date().toISOString().split("T")[0];
      
      const words = content.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length;
      const readTime = `${Math.ceil(words / 200)} min read`;
      
      // Parse link elements
      const linkRegex = /<a[^>]+href="([^">]+)"[^>]*>(.*?)<\/a>/g;
      const internalLinks: RelatedLink[] = [];
      let match;
      const siteDomain = urlObj.hostname;
      
      while ((match = linkRegex.exec(content)) !== null) {
        const linkUrl = match[1];
        const linkLabel = match[2].replace(/<[^>]*>/g, "").trim();
        
        if (linkUrl.startsWith("/") || linkUrl.includes(siteDomain)) {
          if (!internalLinks.some((l) => l.url === linkUrl) && internalLinks.length < 5) {
            internalLinks.push({
              label: linkLabel || "Learn More",
              url: linkUrl,
              description: `Internal link extracted from imported article.`,
            });
          }
        }
      }
      
      // Fill Form Values
      setValue("title", title);
      setValue("slug", slug);
      setValue("seo_title", seoTitle);
      setValue("meta_description", metaDescription);
      setValue("canonical_url", canonicalUrl);
      setValue("content", content);
      setValue("excerpt", excerpt);
      setValue("hero_image", heroImage);
      setValue("author_name", authorName);
      setValue("author_avatar", authorAvatar);
      setValue("published_date", publishedDate);
      setValue("read_time", readTime);
      
      if (internalLinks.length > 0) {
        setValue("related_page_links", internalLinks);
      }
      
      toast({
        title: "WordPress post imported!",
        description: `Successfully loaded content, images, links, and Yoast SEO details for "${title}".`,
      });
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Import failed",
        description: err.message || "Failed to fetch WordPress API. Verify the URL and CORS access.",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    setSaving(true);
    const payload = {
      slug: values.slug.trim(),
      title: values.title.trim(),
      seo_title: values.seo_title.trim() || null,
      meta_description: values.meta_description.trim() || null,
      canonical_url: values.canonical_url.trim() || null,
      category: values.category,
      excerpt: values.excerpt.trim(),
      content: values.content,
      hero_image: values.hero_image.trim(),
      author_name: values.author_name.trim(),
      author_role: values.author_role.trim(),
      author_avatar: values.author_avatar.trim(),
      read_time: values.read_time.trim(),
      published_date: values.published_date,
      tags: values.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      is_published: values.is_published,
      display_order: values.display_order,
      related_page_links: values.related_page_links,
    };

    const { error } = isEdit
      ? await supabase.from("blog_posts").update(payload).eq("id", Number(id))
      : await supabase.from("blog_posts").insert(payload);

    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: isEdit ? "Post updated!" : "Post created!" });
      navigate("/admin/blog");
    }
  };

  if (loadingData) {
    return (
      <AdminShell>
        <div className="flex justify-center py-32">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
        </div>
      </AdminShell>
    );
  }

  const seoTitleLen = watchSeoTitle?.length ?? 0;
  const metaDescLen = watchMetaDesc?.length ?? 0;

  return (
    <AdminShell>
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/blog">
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isEdit ? "Edit Blog Post" : "New Blog Post"}
            </h1>
          </div>
        </div>

        {/* ─── WordPress Import Section ─── */}
        {!isEdit && (
          <div className="mb-8 rounded-xl border border-violet-100 bg-violet-50/50 p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-violet-900">Autofill from WordPress URL</h2>
            <p className="text-xs text-violet-700 mt-1 mb-4">
              Enter any WordPress post link (e.g., from blog.theconverseai.com) to automatically map header content,
              Yoast SEO descriptions, featured images, and internal link suggestions.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                type="url"
                placeholder="https://blog.theconverseai.com/my-post-url/"
                className="flex-1 bg-white border-violet-200 focus-visible:ring-violet-400"
                value={wpUrl}
                onChange={(e) => setWpUrl(e.target.value)}
              />
              <Button
                type="button"
                className="bg-violet-600 hover:bg-violet-700 text-white"
                onClick={handleWordPressImport}
                disabled={importing}
              >
                {importing ? "Importing..." : "Import & Map Content"}
              </Button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

          {/* ─── Basic Info ─── */}
          <section className="rounded-xl border border-border/60 bg-white p-6 space-y-5">
            <h2 className="text-base font-semibold text-foreground">Basic Information</h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="md:col-span-2 space-y-1.5">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g. How AI Chatbots Transform Customer Support"
                  {...register("title", { required: "Title is required" })}
                />
                {errors.title && <p className="text-xs text-red-600">{errors.title.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="slug">URL Slug *</Label>
                <div className="flex gap-2 items-center">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">/blog/</span>
                  <Input
                    id="slug"
                    placeholder="my-post-url"
                    {...register("slug", { required: "Slug is required" })}
                    onChange={(e) => {
                      setTitleChanged(true);
                      register("slug").onChange(e);
                    }}
                  />
                </div>
                {errors.slug && <p className="text-xs text-red-600">{errors.slug.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                  {...register("category")}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="published_date">Published Date</Label>
                <Input type="date" id="published_date" {...register("published_date")} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="read_time">Read Time</Label>
                <Input id="read_time" placeholder="5 min read" {...register("read_time")} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="excerpt">Excerpt / Summary *</Label>
              <Textarea
                id="excerpt"
                rows={3}
                placeholder="A short description shown on the blog listing page..."
                {...register("excerpt", { required: "Excerpt is required" })}
              />
              {errors.excerpt && <p className="text-xs text-red-600">{errors.excerpt.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input id="tags" placeholder="AI, customer support, chatbot, automation" {...register("tags")} />
            </div>
          </section>

          {/* ─── SEO ─── */}
          <section className="rounded-xl border border-border/60 bg-white p-6 space-y-5">
            <div>
              <h2 className="text-base font-semibold text-foreground">SEO Settings</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Customize how this post appears in search engines.</p>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <Label htmlFor="seo_title">SEO Title</Label>
                <span className={`text-xs ${seoTitleLen > 60 ? "text-red-500" : "text-muted-foreground"}`}>
                  {seoTitleLen}/60
                </span>
              </div>
              <Input
                id="seo_title"
                placeholder="Leave blank to use the post title"
                {...register("seo_title")}
              />
              <p className="text-xs text-muted-foreground">Ideal: 50–60 characters. Leave blank to use the post title.</p>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <Label htmlFor="meta_description">Meta Description</Label>
                <span className={`text-xs ${metaDescLen > 160 ? "text-red-500" : "text-muted-foreground"}`}>
                  {metaDescLen}/160
                </span>
              </div>
              <Textarea
                id="meta_description"
                rows={3}
                placeholder="A concise description for search results (recommended 120–160 characters)..."
                {...register("meta_description")}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="canonical_url">Canonical URL</Label>
              <Input
                id="canonical_url"
                placeholder="Leave blank to use the standard post URL"
                {...register("canonical_url")}
              />
              <p className="text-xs text-muted-foreground">Useful if this post has a duplicate elsewhere that should get search priority.</p>
            </div>
          </section>

          {/* ─── Hero Image ─── */}
          <section className="rounded-xl border border-border/60 bg-white p-6 space-y-5">
            <h2 className="text-base font-semibold text-foreground">Hero Image</h2>
            <Controller
              name="hero_image"
              control={control}
              render={({ field }) => (
                <ImageUpload
                  value={field.value}
                  onChange={field.onChange}
                  label="Hero / Cover Image"
                />
              )}
            />
          </section>

          {/* ─── Content ─── */}
          <section className="rounded-xl border border-border/60 bg-white p-6 space-y-4">
            <div>
              <h2 className="text-base font-semibold text-foreground">Post Content</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Use the toolbar to add headings, bullets, quotes, links, and images inline.
              </p>
            </div>
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <RichTextEditor
                  content={field.value}
                  onChange={field.onChange}
                  placeholder="Start writing your blog post here..."
                />
              )}
            />
          </section>

          {/* ─── Author ─── */}
          <section className="rounded-xl border border-border/60 bg-white p-6 space-y-5">
            <h2 className="text-base font-semibold text-foreground">Author</h2>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="author_name">Author Name</Label>
                <Input id="author_name" placeholder="Arjun Mehta" {...register("author_name")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="author_role">Author Role</Label>
                <Input id="author_role" placeholder="Head of AI Solutions" {...register("author_role")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="author_avatar">Author Avatar URL</Label>
                <Input id="author_avatar" placeholder="https://..." {...register("author_avatar")} />
              </div>
            </div>
          </section>

          {/* ─── Related Page Links (Interlinking) ─── */}
          <section className="rounded-xl border border-border/60 bg-white p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-foreground">Related Page Links</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Internal links shown as a "Related Resources" box inside the post — great for SEO interlinking.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendLink({ label: "", url: "", description: "" })}
              >
                <Plus className="mr-1.5 h-4 w-4" /> Add Link
              </Button>
            </div>

            {linkFields.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4 border border-dashed border-border/60 rounded-lg">
                No related links added yet. Click "Add Link" to add internal page links.
              </p>
            )}

            {linkFields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-1 gap-3 rounded-lg border border-border/60 bg-secondary/20 p-4 md:grid-cols-3"
              >
                <div className="space-y-1">
                  <Label className="text-xs">Label</Label>
                  <Input
                    placeholder="e.g. AI Customer Support"
                    {...register(`related_page_links.${index}.label`)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">URL</Label>
                  <Input
                    placeholder="/services/custom-ai-agents"
                    {...register(`related_page_links.${index}.url`)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Description</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Short description..."
                      {...register(`related_page_links.${index}.description`)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700 shrink-0"
                      onClick={() => removeLink(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* ─── Publish Settings ─── */}
          <section className="rounded-xl border border-border/60 bg-white p-6">
            <h2 className="text-base font-semibold text-foreground mb-4">Publish Settings</h2>
            <div className="flex flex-wrap gap-6 items-center">
              <div className="flex items-center gap-3">
                <Controller
                  name="is_published"
                  control={control}
                  render={({ field }) => (
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <div
                        className={`relative w-12 h-6 rounded-full transition-colors ${field.value ? "bg-primary" : "bg-gray-200"}`}
                        onClick={() => field.onChange(!field.value)}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${field.value ? "translate-x-7" : "translate-x-1"}`}
                        />
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {field.value ? "Published" : "Draft"}
                      </span>
                    </label>
                  )}
                />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="display_order" className="whitespace-nowrap">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  className="w-24"
                  {...register("display_order", { valueAsNumber: true })}
                />
              </div>
            </div>
          </section>

          {/* ─── Submit ─── */}
          <div className="flex justify-end gap-3 pb-8">
            <Button type="button" variant="outline" onClick={() => navigate("/admin/blog")} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : isEdit ? "Update Post" : "Create Post"}
            </Button>
          </div>
        </form>
      </div>
    </AdminShell>
  );
};

export default AdminBlogForm;
