import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import AdminShell from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { parseCSV, validateCSVColumns } from "@/lib/csvParser";
import { calculateReadingTime } from "@/lib/readingTime";
import { sanitizeHtml } from "@/lib/htmlSanitizer";
import { ArrowLeft, Upload, FileText, AlertTriangle, CheckCircle, XCircle, Play, RotateCcw, Download } from "lucide-react";
import { cn } from "@/lib/utils";

const REQUIRED_COLUMNS = [
  "Title", "Content (HTML)", "Permalink", "Publish Date", "Featured Image URL",
  "Image Alt", "Image Caption", "Categories", "Tags", "SEO Title",
  "Meta Description", "Canonical URL", "Focus Keyphrase", "Excerpt", "WordPress ID",
];

type DryRunStatus = "new" | "update" | "skip" | "warn";

interface DryRunRow {
  row: number; title: string; slug: string; wpId: string;
  action: DryRunStatus; issues: string[];
}

interface ImportStats {
  total: number; created: number; updated: number; skipped: number; failed: number;
  sessionId: string;
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
}

const AdminBlogImport = () => {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<"upload" | "validate" | "dryrun" | "import" | "done">("upload");
  const [csvText, setCsvText] = useState("");
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [dryRunRows, setDryRunRows] = useState<DryRunRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState<ImportStats | null>(null);
  const [sessionId] = useState(() => crypto.randomUUID());

  const handleFile = (file: File) => {
    if (!file.name.endsWith(".csv")) { toast({ title: "Please select a CSV file", variant: "destructive" }); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCsvText(text);
      const parsed = parseCSV(text);
      setRows(parsed);
      const { valid, missing } = validateCSVColumns(parsed, REQUIRED_COLUMNS);
      setValidationErrors(missing);
      setStep(valid ? "validate" : "validate");
    };
    reader.readAsText(file);
  };

  const runDryRun = async () => {
    setStep("dryrun");
    const results: DryRunRow[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const issues: string[] = [];
      let action: DryRunStatus = "new";
      const slug = slugify(row["Permalink"] || row["Title"] || "");

      // Check WP ID for existing
      const wpId = row["WordPress ID"]?.trim();
      if (wpId) {
        const { data } = await supabase.from("blog_posts").select("id").eq("wp_id", Number(wpId)).is("deleted_at", null).single();
        if (data) action = "update";
      }

      // Check duplicate slug
      const { data: existingSlug } = await supabase.from("blog_posts").select("id").eq("slug", slug).is("deleted_at", null).single();
      if (existingSlug && action === "new") { action = "skip"; issues.push("Duplicate slug"); }

      // Check featured image
      if (!row["Featured Image URL"]?.trim()) issues.push("Missing featured image URL");
      else {
        try {
          const r = await fetch(row["Featured Image URL"], { method: "HEAD" });
          if (!r.ok) issues.push(`Featured image returned HTTP ${r.status}`);
        } catch { issues.push("Featured image URL unreachable"); }
      }

      if (!row["Title"]?.trim()) issues.push("Missing title");
      if (!row["SEO Title"]?.trim()) issues.push("Missing SEO title");

      results.push({ row: i + 2, title: row["Title"] || "(no title)", slug, wpId: wpId || "", action, issues });
    }

    setDryRunRows(results);
  };

  const runImport = async () => {
    setImporting(true);
    const newStats: ImportStats = { total: rows.length, created: 0, updated: 0, skipped: 0, failed: 0, sessionId };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const dryRow = dryRunRows[i];
      setProgress(Math.round(((i + 1) / rows.length) * 100));

      if (dryRow?.action === "skip") { newStats.skipped++; continue; }

      try {
        const { html: cleanContent } = sanitizeHtml(row["Content (HTML)"] || "");
        const slug = slugify(row["Permalink"] || row["Title"]);
        const wpId = row["WordPress ID"]?.trim() ? Number(row["WordPress ID"]) : null;

        // Upload featured image via Edge Function
        let featuredImageId: number | null = null;
        if (row["Featured Image URL"]?.trim()) {
          try {
            const resp = await supabase.functions.invoke("migrate-image", {
              body: { url: row["Featured Image URL"].trim(), importSessionId: sessionId },
            });
            if (resp.data?.storageUrl) {
              const { data: imgData } = await supabase.from("blog_images").insert({
                storage_path: resp.data.storagePath, storage_url: resp.data.storageUrl,
                original_url: row["Featured Image URL"].trim(), alt_text: row["Image Alt"] || "",
                caption: row["Image Caption"] || "", file_name: resp.data.fileName || "",
                file_size: resp.data.fileSize || null, mime_type: resp.data.mimeType || "image/jpeg",
                import_session_id: sessionId,
              }).select("id").single();
              if (imgData) featuredImageId = imgData.id;
            }
          } catch { /* image upload failed, continue without image */ }
        }

        const postPayload = {
          wp_id: wpId, title: row["Title"].trim(), slug, excerpt: row["Excerpt"]?.trim() || "",
          content_html: cleanContent, seo_title: row["SEO Title"]?.trim() || "",
          meta_description: row["Meta Description"]?.trim() || "",
          canonical_url: row["Canonical URL"]?.trim() || "",
          focus_keyphrase: row["Focus Keyphrase"]?.trim() || "",
          publish_date: row["Publish Date"] || null, featured_image_id: featuredImageId,
          status: "draft" as const, reading_time: calculateReadingTime(cleanContent),
          permalink: `https://theconverseai.com/blog/${slug}`,
          import_session_id: sessionId,
        };

        if (dryRow?.action === "update" && wpId) {
          const { error } = await supabase.from("blog_posts").update(postPayload).eq("wp_id", wpId);
          if (error) throw error;
          newStats.updated++;
        } else {
          const { data: newPost, error } = await supabase.from("blog_posts").insert(postPayload).select("id").single();
          if (error) throw error;
          newStats.created++;

          // Save categories
          if (row["Categories"]?.trim() && newPost?.id) {
            const catNames = row["Categories"].split(",").map((c) => c.trim()).filter(Boolean);
            for (const name of catNames) {
              const catSlug = slugify(name);
              let catId: number;
              const { data: existing } = await supabase.from("blog_categories").select("id").eq("slug", catSlug).single();
              if (existing) { catId = existing.id; }
              else {
                const { data: newCat } = await supabase.from("blog_categories").insert({ name, slug: catSlug }).select("id").single();
                catId = newCat!.id;
              }
              if (newPost?.id) await supabase.from("blog_post_categories").insert({ post_id: newPost.id, category_id: catId }).single();
            }
          }

          // Save tags
          if (row["Tags"]?.trim() && newPost?.id) {
            const tagNames = row["Tags"].split(",").map((t) => t.trim()).filter(Boolean);
            for (const name of tagNames) {
              const tagSlug = slugify(name);
              let tagId: number;
              const { data: existing } = await supabase.from("blog_tags").select("id").eq("slug", tagSlug).single();
              if (existing) { tagId = existing.id; }
              else {
                const { data: newTag } = await supabase.from("blog_tags").insert({ name, slug: tagSlug }).select("id").single();
                tagId = newTag!.id;
              }
              if (newPost?.id) await supabase.from("blog_post_tags").insert({ post_id: newPost.id, tag_id: tagId }).single();
            }
          }
        }
      } catch (err: any) {
        newStats.failed++;
        console.error(`Row ${i + 2} failed:`, err.message);
      }
    }

    await supabase.from("blog_activity_log").insert({
      action: "import.completed", resource_type: "blog",
      resource_title: `Import session ${sessionId.slice(0, 8)}`,
      metadata: newStats as any,
    });

    setStats(newStats);
    setImporting(false);
    setStep("done");
  };

  const downloadDryRunCSV = () => {
    const headers = ["Row", "Title", "Slug", "WordPress ID", "Action", "Issues"];
    const csvContent = [headers, ...dryRunRows.map((r) => [r.row, r.title, r.slug, r.wpId, r.action, r.issues.join("; ")])].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "import-dry-run.csv"; a.click();
  };

  const actionBadge = (action: DryRunStatus) => {
    const map: Record<DryRunStatus, string> = {
      new: "bg-green-100 text-green-700", update: "bg-blue-100 text-blue-700",
      skip: "bg-red-100 text-red-700", warn: "bg-yellow-100 text-yellow-700",
    };
    const label = { new: "🆕 New", update: "🔄 Update", skip: "⚠️ Skip", warn: "⚠️ Warn" };
    return <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", map[action])}>{label[action]}</span>;
  };

  return (
    <AdminShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild><Link to="/admin/blog"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Link></Button>
          <h1 className="text-2xl font-bold">Import WordPress Export</h1>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2">
          {["Upload", "Validate", "Dry Run", "Import", "Done"].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={cn("h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold",
                i < ["upload","validate","dryrun","import","done"].indexOf(step)
                  ? "bg-violet-600 text-white"
                  : i === ["upload","validate","dryrun","import","done"].indexOf(step)
                    ? "bg-violet-200 text-violet-700 ring-2 ring-violet-600"
                    : "bg-secondary text-muted-foreground")}>
                {i + 1}
              </div>
              <span className="text-xs font-medium hidden sm:block">{s}</span>
              {i < 4 && <div className="h-px w-4 bg-border" />}
            </div>
          ))}
        </div>

        {/* Step 1: Upload */}
        {step === "upload" && (
          <div
            className="rounded-xl border-2 border-dashed border-violet-300 bg-violet-50 p-12 text-center cursor-pointer hover:bg-violet-100 transition-colors"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}>
            <Upload className="mx-auto h-10 w-10 text-violet-400 mb-3" />
            <p className="text-sm font-semibold text-violet-700">Drop your WordPress CSV export here</p>
            <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </div>
        )}

        {/* Step 2: Validate */}
        {step === "validate" && (
          <div className="space-y-4">
            <div className={cn("rounded-xl border p-5", validationErrors.length === 0 ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50")}>
              <div className="flex items-center gap-2 mb-3">
                {validationErrors.length === 0
                  ? <CheckCircle className="h-5 w-5 text-green-600" />
                  : <XCircle className="h-5 w-5 text-red-600" />}
                <span className="font-semibold text-sm">
                  {validationErrors.length === 0 ? `${rows.length} rows detected — all required columns present` : "Column validation failed"}
                </span>
              </div>
              {validationErrors.length > 0 && (
                <div className="space-y-1">
                  {validationErrors.map((col) => (
                    <div key={col} className="flex items-center gap-2 text-sm text-red-700">
                      <XCircle className="h-3.5 w-3.5 shrink-0" /> Missing column: <code className="bg-red-100 px-1 rounded">{col}</code>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border/60 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Required Columns</p>
              <div className="flex flex-wrap gap-2">
                {REQUIRED_COLUMNS.map((col) => (
                  <span key={col} className={cn("rounded px-2 py-0.5 text-xs",
                    validationErrors.includes(col) ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700")}>
                    {validationErrors.includes(col) ? "✗" : "✓"} {col}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("upload")}>Choose Different File</Button>
              <Button disabled={validationErrors.length > 0} onClick={runDryRun} className="bg-violet-600 hover:bg-violet-700">
                Run Dry Run Preview
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Dry Run */}
        {step === "dryrun" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "New", count: dryRunRows.filter((r) => r.action === "new").length, color: "text-green-700 bg-green-50" },
                { label: "Update", count: dryRunRows.filter((r) => r.action === "update").length, color: "text-blue-700 bg-blue-50" },
                { label: "Issues", count: dryRunRows.filter((r) => r.issues.length > 0).length, color: "text-yellow-700 bg-yellow-50" },
                { label: "Skip", count: dryRunRows.filter((r) => r.action === "skip").length, color: "text-red-700 bg-red-50" },
              ].map(({ label, count, color }) => (
                <div key={label} className={cn("rounded-xl p-4 text-center font-semibold", color)}>
                  <p className="text-2xl">{count}</p>
                  <p className="text-xs">{label}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-border/60 bg-white shadow-sm overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-secondary/20">
                    <th className="px-4 py-2 text-left text-xs font-semibold">#</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold">Title</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold">Action</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold">Issues</th>
                  </tr>
                </thead>
                <tbody>
                  {dryRunRows.map((row) => (
                    <tr key={row.row} className="border-b border-border/30 hover:bg-secondary/10">
                      <td className="px-4 py-2 text-muted-foreground text-xs">{row.row}</td>
                      <td className="px-4 py-2"><p className="font-medium line-clamp-1">{row.title}</p><p className="text-xs text-muted-foreground">{row.slug}</p></td>
                      <td className="px-4 py-2">{actionBadge(row.action)}</td>
                      <td className="px-4 py-2">
                        {row.issues.length === 0
                          ? <span className="text-xs text-green-600">✓ No issues</span>
                          : <ul className="text-xs text-amber-700 space-y-0.5">{row.issues.map((iss, i) => <li key={i}>⚠ {iss}</li>)}</ul>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={downloadDryRunCSV}><Download className="h-4 w-4 mr-1" /> Download Report</Button>
              <Button variant="outline" onClick={() => setStep("validate")}>Back</Button>
              <Button
                disabled={dryRunRows.filter((r) => r.action !== "skip").length === 0}
                onClick={() => { setStep("import"); runImport(); }}
                className="bg-violet-600 hover:bg-violet-700 ml-auto">
                <Play className="h-4 w-4 mr-1.5" />
                Proceed with Import ({dryRunRows.filter((r) => r.action !== "skip").length} posts)
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Importing */}
        {step === "import" && (
          <div className="rounded-xl border border-violet-200 bg-violet-50 p-8 text-center space-y-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600 mx-auto" />
            <p className="font-semibold text-violet-800">Importing... {progress}%</p>
            <div className="w-full rounded-full bg-violet-200 h-2.5">
              <div className="h-2.5 rounded-full bg-violet-600 transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-muted-foreground">Please don't close this tab</p>
          </div>
        )}

        {/* Step 5: Done */}
        {step === "done" && stats && (
          <div className="space-y-4">
            <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
              <CheckCircle className="h-10 w-10 text-green-600 mx-auto mb-3" />
              <h2 className="text-xl font-bold text-green-800">Import Complete!</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {[
                { label: "Total", count: stats.total, color: "bg-secondary" },
                { label: "Created", count: stats.created, color: "bg-green-100" },
                { label: "Updated", count: stats.updated, color: "bg-blue-100" },
                { label: "Skipped", count: stats.skipped, color: "bg-yellow-100" },
                { label: "Failed", count: stats.failed, color: "bg-red-100" },
              ].map(({ label, count, color }) => (
                <div key={label} className={cn("rounded-xl p-3 text-center font-semibold", color)}>
                  <p className="text-2xl">{count}</p><p className="text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" asChild><Link to="/admin/blog"><FileText className="h-4 w-4 mr-1" /> View Posts</Link></Button>
              <Button variant="outline" onClick={() => setStep("upload")}><RotateCcw className="h-4 w-4 mr-1" /> Import Another</Button>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
};

export default AdminBlogImport;
