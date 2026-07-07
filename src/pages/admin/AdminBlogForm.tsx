import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { uploadBlogImage } from "@/lib/uploadImage";
import AdminShell from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useBlogCategories } from "@/hooks/useBlogCategories";
import { useBlogTags } from "@/hooks/useBlogTags";
import { useBlogRevisions } from "@/hooks/useBlogRevisions";
import { calculateReadingTime, formatReadingTime } from "@/lib/readingTime";
import { blogHref, getSubdomainHosts } from "@/lib/blogUrl";
import { sanitizeHtml } from "@/lib/htmlSanitizer";
import { startAutosave, loadAutosave, clearAutosave, getAutosaveAge } from "@/lib/autosave";
import { checkDuplicates } from "@/lib/duplicateDetector";
import { analyzeSEO } from "@/lib/seoAnalyzer";
import RichTextEditor from "@/components/admin/RichTextEditor";
import FAQRichTextEditor from "@/components/admin/FAQRichTextEditor";
import {
  ArrowLeft, Save, Eye, EyeOff, Clock, History, AlertTriangle,
  CheckCircle, XCircle, ChevronDown, ChevronUp, Plus, Trash2,
  GripVertical, RotateCcw, Globe, Share2, BookOpen, HelpCircle,
  Link2, BarChart2, Search
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
  status: PostStatus;
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
function SectionCard({ title, icon: Icon, children, defaultOpen = true, overflowHidden = true }: {
  title: string; icon: React.ElementType; children: React.ReactNode; defaultOpen?: boolean; overflowHidden?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={cn("rounded-xl border border-border/60 bg-white shadow-sm", overflowHidden ? "overflow-hidden" : "")}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "w-full flex items-center justify-between px-6 py-4 hover:bg-secondary/20 transition-colors",
          open ? "rounded-t-xl" : "rounded-xl"
        )}
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
              <FAQRichTextEditor 
                placeholder="Answer..." 
                content={faq.answer} 
                onChange={(html) => update(i, "answer", html)} 
              />
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

  const { blogHost } = getSubdomainHosts();
  const cleanBlogHost = blogHost ? blogHost.replace(/^https?:\/\//, "") : "blog.theconverseai.com";

  const { categories } = useBlogCategories();
  const { tags } = useBlogTags();
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
  const [showPreview, setShowPreview] = useState(false);
  const [featuredImageObj, setFeaturedImageObj] = useState<{ id: number; storage_url: string } | null>(null);

  const [searchBlog, setSearchBlog] = useState("");
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (showPreview) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showPreview]);

  const autosaveKey = isEdit ? `post_${id}` : "new_post";

  const { register, handleSubmit, reset, control, watch, setValue, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      seo_title: "", meta_description: "", slug: "", focus_keyphrase: "", canonical_url: "",
      title: "", publish_date: new Date().toISOString().split("T")[0], publish_at: "", unpublish_at: "",
      status: "draft",
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
  const featuredFileRef = useRef<HTMLInputElement>(null);
  const [uploadingFeatured, setUploadingFeatured] = useState(false);

  useEffect(() => {
    if (!showPreview) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [showPreview]);

  async function handleFeaturedUpload(file: File | undefined) {
    if (!file) return;
    setUploadingFeatured(true);
    try {
      const url = await uploadBlogImage(file);
      setValue("featured_image_url", url, { shouldDirty: true });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err?.message, variant: "destructive" });
    } finally {
      setUploadingFeatured(false);
      if (featuredFileRef.current) featuredFileRef.current.value = "";
    }
  }
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

  // Fetch all posts for related selector (fetch all posts other than deleted ones, regardless of status)
  useEffect(() => {
    supabase.from("blog_posts").select("id, title").is("deleted_at", null)
      .order("title").then(({ data }) => setAllPosts(data ?? []));
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
        unpublish_at: post.unpublish_at ?? "",
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

  const onInvalid = (errors: any) => {
    console.warn("Form validation failed:", errors);
    const errList = Object.entries(errors);
    if (errList.length > 0) {
      const [field, err] = errList[0] as [string, any];
      toast({
        title: "Validation Error",
        description: `${field}: ${err.message || "Invalid field value"}`,
        variant: "destructive",
      });
    }
  };

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
        reading_time: readingTime, featured_image_id: featuredImgId,
        display_order: (values.display_order === undefined || values.display_order === null || Number.isNaN(values.display_order)) ? 99 : Number(values.display_order),
        seo_score: seoScore,
        permalink: `${blogHost}/${values.slug.trim()}`,
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
    if (!window.confirm("Are you sure you want to move this blog post to the trash?")) return;
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

        <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-5">

          {/* ─── Section 1: SEO ─────────────────────────────────────────── */}
          <SectionCard title="SEO & Metadata" icon={Globe}>
            {/* Live URL preview */}
            <div className="flex items-center gap-2 rounded-lg bg-secondary/30 px-3 py-2 font-mono text-xs text-muted-foreground">
              <Globe className="h-3 w-3 shrink-0" />
              <span className="truncate">{blogHost}/{watchSlug || "your-post-slug"}</span>
              {watchSlug && (
                <a href={blogHref(watchSlug)} target="_blank" rel="noopener noreferrer" className="ml-auto shrink-0 hover:text-foreground">
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
                  {/* <span className="text-xs text-muted-foreground whitespace-nowrap">blog.theconverseai.com/</span> */}
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
                {cleanBlogHost} › {watchSlug || "your-slug"}
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
                  <Label htmlFor="featured_image_url">Image</Label>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" disabled={uploadingFeatured}
                      onClick={() => featuredFileRef.current?.click()}>
                      {uploadingFeatured ? "Uploading…" : "⬆ Upload"}
                    </Button>
                    <input ref={featuredFileRef} type="file" accept="image/*" className="hidden"
                      onChange={(e) => handleFeaturedUpload(e.target.files?.[0])} />
                  </div>
                  <Input id="featured_image_url" placeholder="…or paste image URL" {...register("featured_image_url")} />
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
          <SectionCard title="Related Blogs Carousel" icon={Link2} defaultOpen={false} overflowHidden={false}>
            {/* Selected tags */}
            <div className="flex flex-wrap gap-2 min-h-[36px] mb-3">
              {relatedPostIds.map((pid) => {
                const post = allPosts.find((p) => p.id === pid);
                return post ? (
                  <span key={pid} className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700 border border-violet-200">
                    {post.title.length > 35 ? post.title.slice(0, 35) + "…" : post.title}
                    <button type="button" onClick={() => setRelatedPostIds((ids) => ids.filter((i) => i !== pid))} className="ml-1 hover:text-red-500 transition-colors">
                      <XCircle className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ) : null;
              })}
              {relatedPostIds.length === 0 && (
                <span className="text-xs text-muted-foreground italic">No related blogs selected yet.</span>
              )}
            </div>

            {/* Searchable Popover Dropdown (Matches user reference picture exactly) */}
            <div ref={dropRef} className="relative w-full">
              <label className="block text-[13.5px] font-semibold text-gray-700 mb-1.5">
                Select related blogs to link:
              </label>
              
              {/* Dropdown trigger */}
              <button
                type="button"
                onClick={() => setDropOpen(!dropOpen)}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm transition-all duration-200 bg-white",
                  dropOpen 
                    ? "border-violet-500 ring-2 ring-violet-100 shadow-sm" 
                    : "border-gray-200 hover:border-violet-300"
                )}
                style={{ height: "46px" }}
              >
                <span className="text-gray-400 text-[14.5px]">
                  Select a related blog...
                </span>
                {dropOpen ? (
                  <ChevronUp className="h-4 w-4 text-gray-500 transition-transform duration-200" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-500 transition-transform duration-200" />
                )}
              </button>

              {/* Dropdown menu containing search input & results list */}
              {dropOpen && (
                <div className="absolute top-[100%] left-0 right-0 z-50 mt-2 rounded-2xl border border-gray-100 bg-white p-3 shadow-xl ring-1 ring-black/5 animate-in fade-in-0 slide-in-from-top-2 duration-200">
                  {/* Search box inside the dropdown menu */}
                  <div className="relative mb-2">
                    <input
                      type="text"
                      className="w-full rounded-xl border border-violet-300 px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                      placeholder="Search blogs..."
                      value={searchBlog}
                      onChange={(e) => setSearchBlog(e.target.value)}
                      autoFocus
                    />
                    {searchBlog && (
                      <button
                        type="button"
                        onClick={() => setSearchBlog("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Matching blogs list */}
                  <div className="max-h-[200px] overflow-y-auto pr-1 space-y-0.5 custom-scrollbar">
                    {(() => {
                      const filtered = availablePosts
                        .filter((p) => !relatedPostIds.includes(p.id))
                        .filter((p) => p.title.toLowerCase().includes(searchBlog.toLowerCase()));

                      if (filtered.length === 0) {
                        return (
                          <div className="py-8 text-center text-sm text-gray-400 italic">
                            {searchBlog ? `No blogs match "${searchBlog}"` : "All available blogs selected"}
                          </div>
                        );
                      }

                      return filtered.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setRelatedPostIds((ids) => [...ids, p.id]);
                            setSearchBlog("");
                            setDropOpen(false);
                          }}
                          className="w-full text-left rounded-lg px-3.5 py-2.5 text-[14.5px] text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors font-normal duration-150"
                        >
                          {p.title}
                        </button>
                      ));
                    })()}
                  </div>
                </div>
              )}
            </div>
          </SectionCard>

          {/* Spacer to give the page scroll room for the dropdown */}
          <div className="h-[240px]" />

          {/* ─── Publish Bar ─────────────────────────────────────────────── */}
          <div className="sticky bottom-0 z-50 flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-white px-6 py-4 shadow-lg">
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
              <Button type="button" variant="outline" onClick={() => setShowPreview(true)} className="border-violet-300 text-violet-700 hover:bg-violet-50">
                <Eye className="h-4 w-4 mr-1.5" /> Preview
              </Button>
              <Button type="button" variant="outline" disabled={saving}
                onClick={handleSubmit((v) => onSubmit(isEdit ? v : { ...v, status: "draft" }), onInvalid)}>
                <Save className="h-4 w-4 mr-1.5" />
                {saving ? "Saving…" : isEdit ? "Save" : "Save as Draft"}
              </Button>
              <Button type="button" disabled={saving}
                onClick={handleSubmit((v) => onSubmit({ ...v, status: "published" }), onInvalid)}
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

        {/* Live Preview Modal Overlay */}
        {showPreview && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-8 animate-in fade-in-0 duration-200">
            <div className="w-full max-w-6xl h-[92vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-border/40">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-gray-50/50 shrink-0">
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-violet-600" />
                  <span className="font-bold text-gray-800 text-base">Blog Post Live Preview</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)} className="rounded-full w-8 h-8 p-0">✕</Button>
              </div>

              {/* Scrollable Blog Page Content Area */}
              <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#fafafd] wp-post-preview-container">
                {/* CSS matches the frontend BlogPost.tsx styling */}
                <style>{`
                  .wp-post-preview-container {
                    font-family: 'Inter', sans-serif;
                    color: #1f2937;
                  }
                  .wp-post-hero {
                    background: #fbf7fe;
                    min-height: 260px;
                    padding: 60px 24px;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    box-sizing: border-box;
                    border-bottom: 1px solid #eae6f8;
                  }
                  .wp-post-hero .by-line {
                    display: inline-block;
                    background: #eddffd;
                    color: #7c3aed;
                    font-size: 11.5px;
                    font-weight: 600;
                    padding: 3px 12px;
                    border-radius: 999px;
                    letter-spacing: 0.02em;
                    margin-bottom: 12px;
                    text-transform: uppercase;
                  }
                  .wp-post-hero h1 {
                    font-size: clamp(24px, 4vw, 42px);
                    font-weight: 700;
                    color: #a855f7;
                    max-width: 900px;
                    margin: 10px auto 0;
                    line-height: 1.25;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                  }
                  .wp-post-body {
                    max-width: 1140px;
                    margin: 0 auto;
                    padding: 40px 24px 80px;
                    display: flex;
                    gap: 40px;
                    align-items: flex-start;
                    width: 100%;
                    box-sizing: border-box;
                  }
                  .wp-post-area {
                    flex: 1 1 0;
                    min-width: 0;
                    width: 100%;
                    box-sizing: border-box;
                  }
                  .wp-post-content-box {
                    background: transparent;
                    padding: 0;
                    margin-bottom: 40px;
                  }
                  .wp-post-hero-img {
                    width: 100%;
                    border-radius: 16px;
                    display: block;
                    margin-bottom: 24px;
                    overflow: hidden;
                    border: 1px solid #eae6f8;
                    box-shadow: 0 4px 20px rgba(124, 58, 237, 0.04);
                  }
                  .wp-post-hero-img img { width: 100%; height: auto; display: block; }
                  
                  .wp-post-content { 
                    font-size: 16.5px; 
                    line-height: 1.75; 
                    color: #4b5563; 
                    width: 100%;
                  }
                  .wp-post-content h1 { font-size: 28px; font-weight: 800; color: #111827; margin: 24px 0 12px; }
                  .wp-post-content h2 { font-size: 22px; font-weight: 700; color: #111827; margin: 24px 0 12px; }
                  .wp-post-content h3 { font-size: 18px; font-weight: 700; color: #111827; margin: 20px 0 10px; }
                  .wp-post-content p { margin: 0 0 12px; }
                  .wp-post-content ul, .wp-post-content ol { padding-left: 20px; margin: 0 0 12px; }
                  .wp-post-content li { margin-bottom: 4px; }
                  .wp-post-content strong { color: #111827; font-weight: 700; }
                  .wp-post-content em { font-style: italic; }
                  .wp-post-content a { color: #7c3aed; font-weight: 700; text-decoration: underline; }
                  .wp-post-content blockquote {
                    border-left: 4px solid #7c3aed;
                    margin: 16px 0;
                    padding: 12px 18px;
                    background: #f7f5fa;
                    border-radius: 0 8px 8px 0;
                    font-style: italic;
                    color: #4b5563;
                    font-size: 16px;
                  }
                  .wp-post-content img { max-width: 100%; height: auto; border-radius: 12px; margin: 16px 0; display: block; object-fit: contain; }
                  
                  .wp-post-content table {
                    width: 100%;
                    table-layout: fixed;
                    border-collapse: separate;
                    border-spacing: 0;
                    margin: 24px 0;
                    border: 1px solid #94a3b8;
                    border-radius: 0px;
                    overflow: hidden;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.01);
                  }
                  .wp-post-content th, .wp-post-content td {
                    border-bottom: 1px solid #94a3b8;
                    border-right: 1px solid #94a3b8;
                    padding: 18px 20px;
                    font-size: 14.5px;
                    line-height: 1.5;
                    text-align: center;
                    vertical-align: middle;
                    background: #ffffff;
                    color: #4b5563;
                    word-break: break-word;
                    overflow-wrap: anywhere;
                  }
                  .wp-post-content th:last-child, .wp-post-content td:last-child { border-right: none; }
                  .wp-post-content tr:last-child th, .wp-post-content tr:last-child td { border-bottom: none; }
                  .wp-post-content th { background: #ffffff; font-weight: 700; color: #1f2937; }
                  .wp-post-content th:first-child, .wp-post-content td:first-child { text-align: left; font-weight: 700; color: #1f2937; }

                  .wp-post-content .rte-callout-box { border-left: 4px solid #7c3aed; background: #F8F5FF; padding: 14px 20px; border-radius: 0 10px 10px 0; margin: 24px 0; font-size: 15px; color: #374151; line-height: 1.7; }
                  .wp-post-content .rte-callout-box p { margin: 0; color: inherit; font-size: inherit; }
                  .wp-post-content .rte-callout-box p:not(:last-child) { margin-bottom: 8px; }
                  
                  .wp-post-content .rte-cta-box { border: 2px dashed #7c3aed; background: #FAF5FF; padding: 24px; border-radius: 12px; margin: 28px 0; text-align: center; }
                  .wp-post-content .rte-cta-box h3 { margin-top: 0; font-size: 20px; font-weight: 800; color: #7c3aed; margin-bottom: 12px; }
                  .wp-post-content .rte-cta-box p { color: #6B7280; font-size: 14.5px; margin-bottom: 16px; }
                  .wp-post-content .rte-cta-box a { display: inline-flex; align-items: center; justify-content: center; padding: 10px 22px; background: #7c3aed; color: #ffffff !important; font-weight: bold; border-radius: 8px; text-decoration: none !important; }

                  .wp-sidebar { width: 300px; flex-shrink: 0; display: flex; flex-direction: column; gap: 24px; }
                  .wp-sidebar-card { background: #ffffff; border-radius: 16px; border: 1px solid #eae6f8; box-shadow: 0 6px 20px rgba(124, 58, 237, 0.03); padding: 20px; }
                  .wp-sidebar-section-label { display: flex; align-items: center; gap: 8px; font-size: 14.5px; font-weight: 700; color: #1f2937; margin-bottom: 12px; }
                  .wp-sidebar-section-label svg { width: 15px; height: 15px; color: #7c3aed; stroke: #7c3aed; stroke-width: 2.5; fill: none; }
                  .wp-search-wrap { position: relative; }
                  .wp-search-wrap input { width: 100%; padding: 8px 12px 8px 34px; border: 1px solid #dcdfe6; border-radius: 8px; font-size: 13.5px; color: #606266; background: #ffffff; outline: none; }
                  .wp-search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); width: 14px; height: 14px; color: #909399; fill: none; stroke: currentColor; stroke-width: 2.5; }
                  .wp-recent-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 14px; }
                  .wp-recent-item a { display: block; font-size: 14px; font-weight: 500; color: #595e68; text-decoration: none !important; }
                  .wp-recent-item a:hover { color: #7c3aed; }

                  @media (max-width: 1024px) {
                    .wp-post-body { flex-direction: column; gap: 36px; }
                    .wp-sidebar { width: 100%; }
                  }
                `}</style>

                {/* Hero Header */}
                <section className="wp-post-hero">
                  <div className="by-line">
                    {selectedCategories.length > 0 ? selectedCategories[0].name : "ConverseAI"}
                  </div>
                  <h1>{watchTitle || "Untitled Post"}</h1>
                </section>

                {/* Main Content & Sidebar Grid */}
                <div className="wp-post-body">
                  <main className="wp-post-area">
                    <div className="wp-post-content-box">
                      {/* Featured Hero Image */}
                      {watchFeaturedUrl && (
                        <div className="wp-post-hero-img">
                          <img src={watchFeaturedUrl} alt={watchTitle} />
                        </div>
                      )}
                      
                      {/* Blog Rich Text Content */}
                      <div 
                        className="wp-post-content"
                        dangerouslySetInnerHTML={{ __html: watchContent }}
                      />
                    </div>

                    {/* FAQ Accordion Block inside the Content Column */}
                    {faqs.length > 0 && (
                      <div className="pt-8 border-t border-gray-200/80 space-y-4">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
                        <div className="space-y-3">
                          {faqs.map((faq, idx) => (
                            <div key={idx} className="rounded-xl border border-gray-200/60 p-4 bg-white shadow-sm">
                              <h3 className="font-bold text-sm text-gray-800 mb-1">Q: {faq.question}</h3>
                              <p className="text-xs text-gray-600 leading-relaxed">A: {faq.answer}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </main>

                  {/* Mock Page Sidebar matching production styling */}
                  <aside className="wp-sidebar">
                    {/* Search Mock */}
                    <div className="wp-sidebar-card">
                      <div className="wp-sidebar-section-label">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8"></circle>
                          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        Search
                      </div>
                      <div className="wp-search-wrap">
                        <svg className="wp-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8"></circle>
                          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input type="text" readOnly placeholder="Search articles..." />
                      </div>
                    </div>

                    {/* Recent Posts Mock */}
                    <div className="wp-sidebar-card">
                      <div className="wp-sidebar-section-label">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <line x1="16" y1="13" x2="8" y2="13"></line>
                          <line x1="16" y1="17" x2="8" y2="17"></line>
                        </svg>
                        Recent Posts
                      </div>
                      <ul className="wp-recent-list">
                        <li className="wp-recent-item"><a href="#" onClick={(e) => e.preventDefault()}>Agentic AI for E-commerce & D2C</a></li>
                        <li className="wp-recent-item"><a href="#" onClick={(e) => e.preventDefault()}>How voice agents scale contact centers</a></li>
                        <li className="wp-recent-item"><a href="#" onClick={(e) => e.preventDefault()}>Omnichannel integration case study</a></li>
                      </ul>
                    </div>
                  </aside>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-border/60 bg-gray-50 flex justify-end gap-3 shrink-0">
                <Button type="button" onClick={() => setShowPreview(false)}>Close Preview</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
};

export default AdminBlogForm;
