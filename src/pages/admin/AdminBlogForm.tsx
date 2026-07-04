import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import AdminShell from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useBlogCategories } from "@/hooks/useBlogCategories";
import { useBlogTags } from "@/hooks/useBlogTags";
import { useBlogAuthors } from "@/hooks/useBlogAuthors";
import { useBlogRevisions } from "@/hooks/useBlogRevisions";
import { calculateReadingTime, formatReadingTime } from "@/lib/readingTime";
import { sanitizeHtml } from "@/lib/htmlSanitizer";
import { startAutosave, loadAutosave, clearAutosave, getAutosaveAge } from "@/lib/autosave";
import { checkDuplicates } from "@/lib/duplicateDetector";
import { analyzeSEO } from "@/lib/seoAnalyzer";
import RichTextEditor from "@/components/admin/RichTextEditor";
import {
  ArrowLeft, Save, Eye, EyeOff, Clock, History, AlertTriangle,
  CheckCircle, XCircle, ChevronDown, ChevronUp, Plus, Trash2,
  GripVertical, RotateCcw, Globe, Share2, BookOpen, HelpCircle,
  Link2, BarChart2
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type PostStatus = "draft" | "published" | "scheduled" | "archived";

interface FAQ { id?: number; question: string; answer: string; order_index: number; }

interface FormValues {
  // SEO
  seo_title: string; meta_description: string; slug: string;
  focus_keyphrase: string; canonical_url: string;
  // Blog Details
  title: string; publish_date: string; publish_at: string; unpublish_at: string;
  author_id: string; status: PostStatus;
  // Header Image
  featured_image_url: string; featured_image_alt: string; featured_image_caption: string;
  // Social
  og_title: string; og_description: string; og_image_url: string;
  twitter_title: string; twitter_description: string; twitter_image_url: string;
  // Content
  content_html: string; excerpt: string;
  // Publish
  display_order: number;
}

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

// ─── Section Header ────────────────────────────────────────────────────────────
function SectionCard({ title, icon: Icon, children, defaultOpen = true }: {
  title: string; icon: React.ElementType; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-border/60 bg-white shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-secondary/20 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Icon className="h-4 w-4 text-violet-600" />
          <span className="text-sm font-semibold text-foreground">{title}</span>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && <div className="px-6 pb-6 pt-0 space-y-4 border-t border-border/40">{children}</div>}
    </div>
  );
}

// ─── SEO Score Ring ───────────────────────────────────────────────────────────
function SEOScoreRing({ score }: { score: number }) {
  const color = score >= 75 ? "text-green-600" : score >= 50 ? "text-yellow-600" : "text-red-600";
  const bg = score >= 75 ? "bg-green-50" : score >= 50 ? "bg-yellow-50" : "bg-red-50";
  return (
    <div className={cn("flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold", bg, color)}>
      {score >= 75 ? <CheckCircle className="h-3 w-3" /> : score >= 50 ? <AlertTriangle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
      SEO {score}/100
    </div>
  );
}

// ─── Character Counter ────────────────────────────────────────────────────────
function CharCounter({ value, max, ideal }: { value: string; max: number; ideal?: [number, number] }) {
  const len = value.length;
  const isOver = len > max;
  const isIdeal = ideal ? len >= ideal[0] && len <= ideal[1] : false;
  return (
    <span className={cn("text-xs tabular-nums", isOver ? "text-red-500" : isIdeal ? "text-green-600" : "text-muted-foreground")}>
      {len}/{max}
    </span>
  );
}

// ─── FAQ Editor ───────────────────────────────────────────────────────────────
function FAQEditor({ faqs, onChange }: { faqs: FAQ[]; onChange: (f: FAQ[]) => void }) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const dragIdx = useRef<number | null>(null);

  const toggle = (i: number) => setExpanded((s) => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n; });
  const update = (i: number, field: keyof FAQ, val: string) => {
    const n = [...faqs]; n[i] = { ...n[i], [field]: val }; onChange(n);
  };
  const remove = (i: number) => { const n = [...faqs]; n.splice(i, 1); onChange(n.map((f, j) => ({ ...f, order_index: j }))); };
  const add = () => { onChange([...faqs, { question: "", answer: "", order_index: faqs.length }]); setExpanded((s) => new Set([...s, faqs.length])); };

  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => (
        <div
          key={i}
          draggable
          onDragStart={() => { dragIdx.current = i; }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => {
            if (dragIdx.current === null || dragIdx.current === i) return;
            const n = [...faqs]; const [moved] = n.splice(dragIdx.current, 1); n.splice(i, 0, moved);
            onChange(n.map((f, j) => ({ ...f, order_index: j }))); dragIdx.current = null;
          }}
          className="rounded-lg border border-border/60 bg-secondary/10"
        >
          <div className="flex items-center gap-2 px-4 py-3">
            <GripVertical className="h-4 w-4 text-muted-foreground/50 cursor-grab shrink-0" />
            <span className="text-xs font-medium text-violet-700 bg-violet-100 rounded px-1.5 py-0.5">Q{i + 1}</span>
            <button type="button" onClick={() => toggle(i)} className="flex-1 text-left text-sm font-medium truncate">
              {faq.question || <span className="text-muted-foreground italic">Untitled question</span>}
            </button>
            <button type="button" onClick={() => toggle(i)} className="shrink-0">
              {expanded.has(i) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            <button type="button" onClick={() => remove(i)} className="shrink-0 text-red-500 hover:text-red-700">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          {expanded.has(i) && (
            <div className="px-4 pb-4 space-y-3 border-t border-border/40 pt-3">
              <Input placeholder="Question..." value={faq.question} onChange={(e) => update(i, "question", e.target.value)} className="text-sm font-medium" />
              <Textarea placeholder="Answer..." value={faq.answer} onChange={(e) => update(i, "answer", e.target.value)} rows={3} className="text-sm resize-none" />
            </div>
          )}
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={add} className="w-full border-dashed">
        <Plus className="h-3.5 w-3.5 mr-1.5" /> Add FAQ
      </Button>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
const AdminBlogForm = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();

  const { categories } = useBlogCategories();
  const { tags } = useBlogTags();
  const { authors } = useBlogAuthors();
  const { revisions } = useBlogRevisions(isEdit ? Number(id) : undefined);

  const [loadingData, setLoadingData] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [titleLocked, setTitleLocked] = useState(isEdit);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [selectedCatIds, setSelectedCatIds] = useState<number[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [relatedPostIds, setRelatedPostIds] = useState<number[]>([]);
  const [allPosts, setAllPosts] = useState<{ id: number; title: string }[]>([]);
  const [seoScore, setSeoScore] = useState(0);
  const [autosaveAge, setAutosaveAge] = useState<string | null>(null);
  const [showRestoreBanner, setShowRestoreBanner] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [featuredImageObj, setFeaturedImageObj] = useState<{ id: number; storage_url: string } | null>(null);

  const autosaveKey = isEdit ? `post_${id}` : "new_post";

  const { register, handleSubmit, reset, control, watch, setValue, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      seo_title: "", meta_description: "", slug: "", focus_keyphrase: "", canonical_url: "",
      title: "", publish_date: new Date().toISOString().split("T")[0], publish_at: "", unpublish_at: "",
      author_id: "", status: "draft",
      featured_image_url: "", featured_image_alt: "", featured_image_caption: "",
      og_title: "", og_description: "", og_image_url: "",
      twitter_title: "", twitter_description: "", twitter_image_url: "",
      content_html: "", excerpt: "", display_order: 99,
    },
  });

  const watchTitle = watch("title");
  const watchSeoTitle = watch("seo_title");
  const watchMetaDesc = watch("meta_description");
  const watchSlug = watch("slug");
  const watchContent = watch("content_html");
  const watchFeaturedUrl = watch("featured_image_url");
  const watchStatus = watch("status");

  // Auto-slug from title
  useEffect(() => {
    if (!titleLocked && watchTitle) setValue("slug", slugify(watchTitle));
  }, [watchTitle, titleLocked, setValue]);

  // Auto reading time
  const readingTime = calculateReadingTime(watchContent);

  // Live SEO score
  useEffect(() => {
    const result = analyzeSEO({
      title: watchTitle, seo_title: watchSeoTitle, meta_description: watchMetaDesc,
      content_html: watchContent, focus_keyphrase: watch("focus_keyphrase"),
      canonical_url: watch("canonical_url"), featured_image_id: featuredImageObj?.id ?? null,
      excerpt: watch("excerpt"),
    });
    setSeoScore(result.score);
  }, [watchTitle, watchSeoTitle, watchMetaDesc, watchContent, featuredImageObj]);

  // Autosave
  const getFormData = useCallback(() => ({
    form: watch(), faqs, selectedCatIds, selectedTagIds, relatedPostIds,
  }), [watch, faqs, selectedCatIds, selectedTagIds, relatedPostIds]);

  useEffect(() => {
    const saved = loadAutosave(autosaveKey);
    if (saved && !isEdit) {
      setAutosaveAge(getAutosaveAge(saved.savedAt));
      setShowRestoreBanner(true);
    }
  }, [autosaveKey, isEdit]);

  useEffect(() => {
    const cleanup = startAutosave(autosaveKey, getFormData, 30_000);
    return cleanup;
  }, [autosaveKey, getFormData]);

  // Fetch all posts for related selector
  useEffect(() => {
    supabase.from("blog_posts").select("id, title").is("deleted_at", null)
      .neq("status", "archived").order("title").then(({ data }) => setAllPosts(data ?? []));
  }, []);

  // Load existing post for edit
  useEffect(() => {
    if (!isEdit) return;
    setLoadingData(true);
    Promise.all([
      supabase.from("blog_posts").select("*").eq("id", Number(id)).is("deleted_at", null).single(),
      supabase.from("blog_post_categories").select("category_id").eq("post_id", Number(id)),
      supabase.from("blog_post_tags").select("tag_id").eq("post_id", Number(id)),
      supabase.from("blog_faqs").select("*").eq("post_id", Number(id)).order("order_index"),
      supabase.from("blog_related_posts").select("related_post_id").eq("post_id", Number(id)),
      supabase.from("blog_images").select("id, storage_url").eq("id", 0), // placeholder
    ]).then(async ([postRes, catRes, tagRes, faqRes, relRes]) => {
      const post = postRes.data;
      if (postRes.error || !post) {
        toast({ title: "Failed to load post", variant: "destructive" });
        navigate("/admin/blog");
        return;
      }

      // Load featured image
      let featuredUrl = "";
      if (post.featured_image_id) {
        const { data: img } = await supabase.from("blog_images").select("id, storage_url").eq("id", post.featured_image_id).single();
        if (img) { setFeaturedImageObj(img); featuredUrl = img.storage_url; }
      }

      reset({
        seo_title: post.seo_title ?? "", meta_description: post.meta_description ?? "",
        slug: post.slug, focus_keyphrase: post.focus_keyphrase ?? "", canonical_url: post.canonical_url ?? "",
        title: post.title, publish_date: post.publish_date ?? "", publish_at: post.publish_at ?? "",
        unpublish_at: post.unpublish_at ?? "", author_id: post.author_id?.toString() ?? "",
        status: post.status as PostStatus,
        featured_image_url: featuredUrl,
        featured_image_alt: "", featured_image_caption: "",
        og_title: post.og_title ?? "", og_description: post.og_description ?? "", og_image_url: "",
        twitter_title: post.twitter_title ?? "", twitter_description: post.twitter_description ?? "",
        twitter_image_url: "", content_html: post.content_html ?? "", excerpt: post.excerpt ?? "",
        display_order: post.display_order,
      });

      setSelectedCatIds((catRes.data ?? []).map((r: any) => r.category_id));
      setSelectedTagIds((tagRes.data ?? []).map((r: any) => r.tag_id));
      setFaqs((faqRes.data ?? []) as FAQ[]);
      setRelatedPostIds((relRes.data ?? []).map((r: any) => r.related_post_id));
      setLoadingData(false);
    });
  }, [id, isEdit]);

  const onSubmit = async (values: FormValues) => {
    setSaving(true);

    // Sanitize HTML
    const { html: cleanHtml } = sanitizeHtml(values.content_html);

    try {
      // Upsert featured image if URL provided
      let featuredImgId = featuredImageObj?.id ?? null;
      if (values.featured_image_url && values.featured_image_url !== featuredImageObj?.storage_url) {
        const { data: imgData } = await supabase.from("blog_images").insert({
          storage_path: values.featured_image_url,
          storage_url: values.featured_image_url,
          alt_text: values.featured_image_alt,
          caption: values.featured_image_caption,
          file_name: values.featured_image_url.split("/").pop() ?? "image",
        }).select("id").single();
        if (imgData) { featuredImgId = imgData.id; setFeaturedImageObj({ id: imgData.id, storage_url: values.featured_image_url }); }
      }

      const payload = {
        title: values.title.trim(), slug: values.slug.trim(), excerpt: values.excerpt.trim(),
        content_html: cleanHtml, seo_title: values.seo_title.trim(), meta_description: values.meta_description.trim(),
        canonical_url: values.canonical_url.trim(), focus_keyphrase: values.focus_keyphrase.trim(),
        og_title: values.og_title.trim(), og_description: values.og_description.trim(),
        twitter_title: values.twitter_title.trim(), twitter_description: values.twitter_description.trim(),
        status: values.status, publish_date: values.publish_date || null,
        publish_at: values.publish_at || null, unpublish_at: values.unpublish_at || null,
        author_id: values.author_id ? Number(values.author_id) : null,
        reading_time: readingTime, featured_image_id: featuredImgId,
        display_order: values.display_order, seo_score: seoScore,
        permalink: `https://blog.theconverseai.com/${values.slug.trim()}`,
      };

      let postId = isEdit ? Number(id) : null;

      if (isEdit) {
        const { error } = await supabase.from("blog_posts").update(payload).eq("id", postId!);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("blog_posts").insert(payload).select("id").single();
        if (error) throw error;
        postId = data.id;
      }

      // Save categories
      await supabase.from("blog_post_categories").delete().eq("post_id", postId!);
      if (selectedCatIds.length > 0) {
        await supabase.from("blog_post_categories").insert(selectedCatIds.map((cid) => ({ post_id: postId!, category_id: cid })));
      }

      // Save tags
      await supabase.from("blog_post_tags").delete().eq("post_id", postId!);
      if (selectedTagIds.length > 0) {
        await supabase.from("blog_post_tags").insert(selectedTagIds.map((tid) => ({ post_id: postId!, tag_id: tid })));
      }

      // Save FAQs
      await supabase.from("blog_faqs").delete().eq("post_id", postId!);
      if (faqs.length > 0) {
        await supabase.from("blog_faqs").insert(faqs.map((f, i) => ({ post_id: postId!, question: f.question, answer: f.answer, order_index: i })));
      }

      // Save related posts
      await supabase.from("blog_related_posts").delete().eq("post_id", postId!);
      if (relatedPostIds.length > 0) {
        await supabase.from("blog_related_posts").insert(relatedPostIds.map((rid) => ({ post_id: postId!, related_post_id: rid })));
      }

      // Log activity
      await supabase.from("blog_activity_log").insert({
        action: isEdit ? "blog.updated" : "blog.created",
        resource_type: "blog", resource_id: postId!, resource_title: values.title,
      });

      clearAutosave(autosaveKey);
      toast({ title: isEdit ? "Post updated!" : "Post created!" });
      if (!isEdit) navigate(`/admin/blog/${postId}/edit`);
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleSoftDelete = async () => {
    if (!isEdit) return;
    await supabase.from("blog_posts").update({ deleted_at: new Date().toISOString() }).eq("id", Number(id));
    toast({ title: "Post moved to trash" });
    navigate("/admin/blog");
  };

  if (loadingData) {
    return (
      <AdminShell>
        <div className="flex justify-center py-32">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
        </div>
      </AdminShell>
    );
  }

  const selectedCategories = categories.filter((c) => selectedCatIds.includes(c.id));
  const selectedTags = tags.filter((t) => selectedTagIds.includes(t.id));
  const availablePosts = allPosts.filter((p) => p.id !== Number(id));

  return (
    <AdminShell>
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/blog"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Link>
            </Button>
            <h1 className="text-xl font-bold">{isEdit ? "Edit Blog Post" : "New Blog Post"}</h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <SEOScoreRing score={seoScore} />
            {autosaveAge && !showRestoreBanner && (
              <span className="text-xs text-muted-foreground">Autosaved {autosaveAge}</span>
            )}
            {isEdit && (
              <Button type="button" variant="outline" size="sm" onClick={() => setShowHistory(true)}>
                <History className="h-3.5 w-3.5 mr-1" /> History ({revisions.length})
              </Button>
            )}
          </div>
        </div>

        {/* Restore Banner */}
        {showRestoreBanner && (
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <RotateCcw className="h-4 w-4 shrink-0" />
            <span>Unsaved changes found from <strong>{autosaveAge}</strong>.</span>
            <Button type="button" size="sm" variant="outline" className="ml-auto border-amber-300 text-amber-700"
              onClick={() => {
                const saved = loadAutosave(autosaveKey);
                if (saved?.data) {
                  const d = saved.data as any;
                  if (d.form) reset(d.form);
                  if (d.faqs) setFaqs(d.faqs);
                  if (d.selectedCatIds) setSelectedCatIds(d.selectedCatIds);
                  if (d.selectedTagIds) setSelectedTagIds(d.selectedTagIds);
                  if (d.relatedPostIds) setRelatedPostIds(d.relatedPostIds);
                }
                setShowRestoreBanner(false);
              }}>
              Restore
            </Button>
            <Button type="button" size="sm" variant="ghost" className="text-amber-700"
              onClick={() => { clearAutosave(autosaveKey); setShowRestoreBanner(false); }}>
              Discard
            </Button>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* ─── Section 1: SEO ─────────────────────────────────────────── */}
          <SectionCard title="SEO & Metadata" icon={Globe}>
            {/* Live URL preview */}
            <div className="flex items-center gap-2 rounded-lg bg-secondary/30 px-3 py-2 font-mono text-xs text-muted-foreground">
              <Globe className="h-3 w-3 shrink-0" />
              <span className="truncate">https://blog.theconverseai.com/{watchSlug || "your-post-slug"}</span>
              {watchSlug && (
                <a href={`https://blog.theconverseai.com/${watchSlug}`} target="_blank" rel="noopener noreferrer" className="ml-auto shrink-0 hover:text-foreground">
                  <Eye className="h-3 w-3" />
                </a>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="seo_title">SEO Title</Label>
                  <CharCounter value={watchSeoTitle} max={60} ideal={[50, 60]} />
                </div>
                <Input id="seo_title" placeholder="Leave blank to use post title" {...register("seo_title")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="focus_keyphrase">Focus Keyphrase</Label>
                <Input id="focus_keyphrase" placeholder="e.g. ai chatbot for customer support" {...register("focus_keyphrase")} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="meta_description">Meta Description</Label>
                <CharCounter value={watchMetaDesc} max={160} ideal={[120, 160]} />
              </div>
              <Textarea id="meta_description" rows={3} placeholder="120–160 character summary for search results..." {...register("meta_description")} />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="slug">URL Slug</Label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">blog.theconverseai.com/</span>
                  <Input id="slug" placeholder="auto-generated-from-title" {...register("slug", { required: "Slug is required" })}
                    onChange={(e) => { setTitleLocked(true); register("slug").onChange(e); }} />
                </div>
                {errors.slug && <p className="text-xs text-red-600">{errors.slug.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="canonical_url">Canonical URL</Label>
                <Input id="canonical_url" placeholder="https://..." {...register("canonical_url")} />
              </div>
            </div>

            {/* Google SERP Preview */}
            <div className="rounded-lg border border-border/60 bg-gray-50 p-4 space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Google Preview</p>
              <p className="text-sm font-medium text-blue-600 truncate">
                {watchSeoTitle || watchTitle || "Your Post Title"}
              </p>
              <p className="text-xs text-green-700 truncate">
                blog.theconverseai.com › {watchSlug || "your-slug"}
              </p>
              <p className="text-xs text-gray-600 line-clamp-2">
                {watchMetaDesc || "Add a meta description to see how your post appears in search results..."}
              </p>
            </div>
          </SectionCard>

          {/* ─── Section 2: Blog Details ────────────────────────────────── */}
          <SectionCard title="Blog Details" icon={BookOpen}>
            <div className="space-y-1.5">
              <Label htmlFor="title">Blog Title *</Label>
              <Input id="title" placeholder="e.g. How AI Chatbots Transform Customer Support" className="text-lg font-semibold"
                {...register("title", { required: "Title is required" })} />
              {errors.title && <p className="text-xs text-red-600">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="publish_date">Publish Date</Label>
                <Input type="date" id="publish_date" {...register("publish_date")} />
              </div>
              <div className="space-y-1.5">
                <Label>Reading Time</Label>
                <div className="flex h-9 items-center rounded-md border border-input bg-secondary/20 px-3 text-sm text-muted-foreground">
                  <Clock className="mr-2 h-3.5 w-3.5" />
                  {formatReadingTime(readingTime)}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="status">Status</Label>
                <select id="status" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring" {...register("status")}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            {watchStatus === "scheduled" && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="space-y-1.5">
                  <Label htmlFor="publish_at">Publish At</Label>
                  <Input type="datetime-local" id="publish_at" {...register("publish_at")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="unpublish_at">Unpublish At (optional)</Label>
                  <Input type="datetime-local" id="unpublish_at" {...register("unpublish_at")} />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Excerpt</Label>
              <Textarea rows={2} placeholder="Short description shown on the blog listing page..." {...register("excerpt")} />
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <Label>Categories</Label>
              <div className="flex flex-wrap gap-2 min-h-[36px] rounded-md border border-input bg-background p-2">
                {selectedCategories.map((c) => (
                  <span key={c.id} className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-700">
                    {c.name}
                    <button type="button" onClick={() => setSelectedCatIds((ids) => ids.filter((i) => i !== c.id))}>
                      <XCircle className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <select className="flex-1 min-w-[120px] bg-transparent text-sm outline-none"
                  onChange={(e) => { const val = Number(e.target.value); if (val && !selectedCatIds.includes(val)) setSelectedCatIds([...selectedCatIds, val]); e.target.value = ""; }}>
                  <option value="">Add category...</option>
                  {categories.filter((c) => !selectedCatIds.includes(c.id)).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 min-h-[36px] rounded-md border border-input bg-background p-2">
                {selectedTags.map((t) => (
                  <span key={t.id} className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                    {t.name}
                    <button type="button" onClick={() => setSelectedTagIds((ids) => ids.filter((i) => i !== t.id))}>
                      <XCircle className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <select className="flex-1 min-w-[120px] bg-transparent text-sm outline-none"
                  onChange={(e) => { const val = Number(e.target.value); if (val && !selectedTagIds.includes(val)) setSelectedTagIds([...selectedTagIds, val]); e.target.value = ""; }}>
                  <option value="">Add tag...</option>
                  {tags.filter((t) => !selectedTagIds.includes(t.id)).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            </div>
          </SectionCard>

          {/* ─── Section 3: Header Image ────────────────────────────────── */}
          <SectionCard title="Header Image" icon={BarChart2}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="featured_image_url">Image URL</Label>
                  <Input id="featured_image_url" placeholder="https://..." {...register("featured_image_url")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="featured_image_alt">Alt Text</Label>
                  <Input id="featured_image_alt" placeholder="Descriptive alt text..." {...register("featured_image_alt")} />
                </div>
              </div>
              {watchFeaturedUrl ? (
                <div className="relative overflow-hidden rounded-lg border border-border/60 bg-secondary/20 aspect-video">
                  <img src={watchFeaturedUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
              ) : (
                <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border/60 bg-secondary/10 aspect-video text-sm text-muted-foreground">
                  Image preview will appear here
                </div>
              )}
            </div>
          </SectionCard>

          {/* ─── Section 5: Content ─────────────────────────────────────── */}
          <SectionCard title="Blog Content" icon={BookOpen}>
            <Controller
              name="content_html"
              control={control}
              render={({ field }) => (
                <RichTextEditor content={field.value} onChange={field.onChange} placeholder="Start writing your blog post here..." />
              )}
            />
            <p className="text-xs text-muted-foreground">{calculateReadingTime(watchContent) * 200}± words · {formatReadingTime(readingTime)}</p>
          </SectionCard>

          {/* ─── Section 6: FAQ ──────────────────────────────────────────── */}
          <SectionCard title={`FAQ (${faqs.length})`} icon={HelpCircle} defaultOpen={false}>
            <FAQEditor faqs={faqs} onChange={setFaqs} />
          </SectionCard>

          {/* ─── Section 7: Related Blogs ────────────────────────────────── */}
          <SectionCard title="Related Blogs Carousel" icon={Link2} defaultOpen={false}>
            <div className="flex flex-wrap gap-2 min-h-[36px] rounded-md border border-input bg-background p-2">
              {relatedPostIds.map((pid) => {
                const post = allPosts.find((p) => p.id === pid);
                return post ? (
                  <span key={pid} className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                    {post.title.slice(0, 30)}...
                    <button type="button" onClick={() => setRelatedPostIds((ids) => ids.filter((i) => i !== pid))}>
                      <XCircle className="h-3 w-3" />
                    </button>
                  </span>
                ) : null;
              })}
              <select className="flex-1 min-w-[160px] bg-transparent text-sm outline-none"
                onChange={(e) => { const val = Number(e.target.value); if (val && !relatedPostIds.includes(val)) setRelatedPostIds([...relatedPostIds, val]); e.target.value = ""; }}>
                <option value="">Select a related blog...</option>
                {availablePosts.filter((p) => !relatedPostIds.includes(p.id)).map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
          </SectionCard>

          {/* ─── Publish Bar ─────────────────────────────────────────────── */}
          <div className="sticky bottom-0 z-10 flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-white px-6 py-4 shadow-lg">
            <div className="flex items-center gap-3">
              <Label htmlFor="display_order" className="text-xs whitespace-nowrap">Display Order</Label>
              <Input id="display_order" type="number" className="w-20" {...register("display_order", { valueAsNumber: true })} />
            </div>
            <div className="flex gap-2">
              {isEdit && (
                <Button type="button" variant="ghost" className="text-red-600 hover:bg-red-50" onClick={handleSoftDelete}>
                  <Trash2 className="h-4 w-4 mr-1" /> Move to Trash
                </Button>
              )}
              <Button type="button" variant="outline" onClick={() => navigate("/admin/blog")} disabled={saving}>Cancel</Button>
              <Button type="submit" variant="outline" disabled={saving}>
                <Save className="h-4 w-4 mr-1.5" />
                {saving ? "Saving…" : isEdit ? "Save" : "Save as Draft"}
              </Button>
              <Button type="button" disabled={saving}
                onClick={handleSubmit((v) => onSubmit({ ...v, status: "published" }))}
                className="bg-green-600 hover:bg-green-700">
                <Eye className="h-4 w-4 mr-1.5" />
                {watchStatus === "published" ? "Update & Keep Live" : "Publish"}
              </Button>
            </div>
          </div>
        </form>

        {/* Revision History Panel */}
        {showHistory && (
          <div className="fixed inset-0 z-50 flex">
            <div className="flex-1 bg-black/40" onClick={() => setShowHistory(false)} />
            <div className="w-80 bg-white border-l border-border/60 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
                <h3 className="font-semibold text-sm">Revision History</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowHistory(false)}>✕</Button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {revisions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No revisions yet</p>
                ) : revisions.map((rev) => (
                  <div key={rev.id} className="rounded-lg border border-border/60 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-violet-700">Version {rev.version_number}</span>
                      <span className="text-xs text-muted-foreground">{new Date(rev.created_at).toLocaleDateString()}</span>
                    </div>
                    {rev.updated_by && <p className="text-xs text-muted-foreground">{rev.updated_by}</p>}
                    <Button type="button" size="sm" variant="outline" className="w-full text-xs"
                      onClick={() => {
                        setValue("content_html", rev.content_html);
                        setValue("seo_title", rev.seo_title);
                        setValue("meta_description", rev.meta_description);
                        setValue("slug", rev.slug);
                        setValue("canonical_url", rev.canonical_url);
                        setShowHistory(false);
                        toast({ title: `Restored to Version ${rev.version_number}` });
                      }}>
                      <RotateCcw className="h-3 w-3 mr-1" /> Restore
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
};

export default AdminBlogForm;
